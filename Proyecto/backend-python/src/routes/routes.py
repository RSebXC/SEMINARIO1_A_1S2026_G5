import os
from flask import Blueprint,request,jsonify,g
from middlewares.auth_middleware import auth_required
from services import cognito_service as cog,rekognition_service as rek
from services import translate_service as trans,lex_service as lex,s3_service as s3
from config.db_config import get_connection
import jwt as pyjwt

auth_bp=Blueprint("auth",__name__,url_prefix="/auth")

@auth_bp.route("/registro",methods=["POST"])
def registro():
    nombre=request.form.get("nombreCompleto"); email=request.form.get("email")
    dpi=request.form.get("dpi"); pw=request.form.get("password"); foto=request.files.get("foto")
    if not all([nombre,email,dpi,pw,foto]): return jsonify({"error":"Todos los campos son obligatorios"}),400
    try:
        c=cog.registrar_usuario(nombre,email,dpi,pw)
        ext=foto.content_type.split("/")[-1].replace("jpeg","jpg")
        f=s3.subir_imagen(foto.read(),ext,"perfil")
        conn=get_connection()
        if conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO usuarios (cognito_sub,nombre_completo,email,password_hash,dpi,foto_perfil_key,foto_perfil_url) VALUES (%s,%s,%s,MD5(%s),%s,%s,%s)",
                    (c["userSub"],nombre,email,pw,dpi,f["key"],f["url"]))
            conn.commit(); conn.close()
        return jsonify({"mensaje":"Registrado. Confirma tu correo.","confirmacionRequerida":c["confirmationRequired"]}),201
    except Exception as e:
        if "UsernameExistsException" in str(e): return jsonify({"error":"Correo ya registrado"}),409
        return jsonify({"error":str(e)}),500

@auth_bp.route("/confirmar",methods=["POST"])
def confirmar():
    d=request.json or {}
    try: cog.confirmar_codigo(d.get("email"),d.get("codigo")); return jsonify({"mensaje":"Cuenta confirmada"})
    except: return jsonify({"error":"Código inválido"}),400

@auth_bp.route("/login",methods=["POST"])
def login():
    d=request.json or {}
    try:
        tokens=cog.login_usuario(d.get("email"),d.get("password"))
        foto=None; conn=get_connection()
        if conn:
            with conn.cursor() as cur:
                cur.execute("SELECT foto_perfil_url FROM usuarios WHERE email=%s",(d.get("email"),))
                row=cur.fetchone()
                if row: foto=row["foto_perfil_url"]
            conn.close()
        return jsonify({**tokens,"fotoPerfil":foto})
    except Exception as e:
        if "NotAuthorizedException" in str(e): return jsonify({"error":"Credenciales incorrectas"}),401
        return jsonify({"error":str(e)}),500

@auth_bp.route("/login-facial",methods=["POST"])
def login_facial():
    email=request.form.get("email"); foto=request.files.get("foto")
    if not email or not foto: return jsonify({"error":"Email y foto requeridos"}),400
    try:
        conn=get_connection()
        if not conn: return jsonify({"error":"BD no disponible"}),503
        with conn.cursor() as cur:
            cur.execute("SELECT foto_perfil_key,cognito_sub FROM usuarios WHERE email=%s",(email,))
            row=cur.fetchone()
        conn.close()
        if not row: return jsonify({"error":"Usuario no encontrado"}),404
        r=rek.comparar_rostros(foto.read(),row["foto_perfil_key"])
        if not r["coincide"]: return jsonify({"error":"Rostro no reconocido","similitud":r["similitud"]}),401
        token=pyjwt.encode({"email":email,"sub":row["cognito_sub"],"loginMethod":"facial"},
            os.getenv("JWT_SECRET","secret"),algorithm="HS256")
        return jsonify({"mensaje":"Login facial exitoso","similitud":r["similitud"],"AccessToken":token})
    except Exception as e: return jsonify({"error":str(e)}),500

pub_bp=Blueprint("pub",__name__,url_prefix="/publicaciones")

@pub_bp.route("/",methods=["GET"])
@auth_required
def listar():
    sub=g.user["sub"]; etiqueta=request.args.get("etiqueta")
    try:
        conn=get_connection()
        if not conn: return jsonify({"error":"BD no disponible"}),503
        q="""SELECT p.id,p.descripcion,p.imagen_url,p.fecha_creacion,
                    u.nombre_completo AS autor,u.foto_perfil_url AS foto_autor,
                    GROUP_CONCAT(e.nombre SEPARATOR ',') AS etiquetas
             FROM publicaciones p JOIN usuarios u ON p.usuario_sub=u.cognito_sub
             LEFT JOIN publicacion_etiquetas pe ON p.id=pe.publicacion_id
             LEFT JOIN etiquetas e ON pe.etiqueta_id=e.id
             WHERE (p.usuario_sub=%s OR p.usuario_sub IN (
               SELECT CASE WHEN usuario_a_sub=%s THEN usuario_b_sub ELSE usuario_a_sub END
               FROM amistades WHERE (usuario_a_sub=%s OR usuario_b_sub=%s) AND estado='aceptada'))"""
        params=[sub,sub,sub,sub]
        if etiqueta and etiqueta!="Todos": q+=" AND e.nombre=%s"; params.append(etiqueta)
        q+=" GROUP BY p.id ORDER BY p.fecha_creacion DESC"
        with conn.cursor() as cur: cur.execute(q,params); rows=cur.fetchall()
        conn.close()
        for r in rows: r["etiquetas"]=r["etiquetas"].split(",") if r["etiquetas"] else []
        return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/etiquetas",methods=["GET"])
@auth_required
def etiquetas():
    try:
        conn=get_connection()
        with conn.cursor() as cur: cur.execute("SELECT DISTINCT nombre FROM etiquetas ORDER BY nombre"); rows=cur.fetchall()
        conn.close(); return jsonify(["Todos"]+[r["nombre"] for r in rows])
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/",methods=["POST"])
@auth_required
def crear():
    img=request.files.get("imagen")
    if not img: return jsonify({"error":"Imagen obligatoria"}),400
    try:
        ext=img.content_type.split("/")[-1].replace("jpeg","jpg")
        ir=s3.subir_imagen(img.read(),ext,"publicacion")
        etiquetas=rek.detectar_etiquetas(ir["key"])
        conn=get_connection()
        if not conn: return jsonify({"error":"BD no disponible"}),503
        with conn.cursor() as cur:
            cur.execute("INSERT INTO publicaciones (usuario_sub,descripcion,imagen_url,imagen_key) VALUES (%s,%s,%s,%s)",
                (g.user["sub"],request.form.get("descripcion"),ir["url"],ir["key"]))
            pid=cur.lastrowid
            for et in etiquetas:
                cur.execute("INSERT IGNORE INTO etiquetas (nombre) VALUES (%s)",(et["nombre"],))
                cur.execute("SELECT id FROM etiquetas WHERE nombre=%s",(et["nombre"],))
                eid=cur.fetchone()["id"]
                cur.execute("INSERT INTO publicacion_etiquetas VALUES (%s,%s,%s)",(pid,eid,et["confianza"]))
        conn.commit(); conn.close()
        return jsonify({"id":pid,"imagenUrl":ir["url"],"etiquetas":etiquetas}),201
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/<int:pid>/comentarios",methods=["POST"])
@auth_required
def comentar(pid):
    d=request.json or {}
    if not d.get("contenido"): return jsonify({"error":"Contenido requerido"}),400
    try:
        conn=get_connection()
        with conn.cursor() as cur:
            cur.execute("INSERT INTO comentarios (publicacion_id,usuario_sub,contenido) VALUES (%s,%s,%s)",(pid,g.user["sub"],d["contenido"]))
            nid=cur.lastrowid
        conn.commit(); conn.close(); return jsonify({"id":nid,"contenido":d["contenido"]}),201
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/<int:pid>/comentarios",methods=["GET"])
@auth_required
def comentarios(pid):
    try:
        conn=get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT c.id,c.contenido,c.fecha_creacion,u.nombre_completo AS autor FROM comentarios c JOIN usuarios u ON c.usuario_sub=u.cognito_sub WHERE c.publicacion_id=%s ORDER BY c.fecha_creacion",(pid,))
            rows=cur.fetchall()
        conn.close(); return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/traducir",methods=["POST"])
@auth_required
def traducir():
    d=request.json or {}
    if not d.get("texto") or not d.get("idiomaDestino"): return jsonify({"error":"texto e idiomaDestino requeridos"}),400
    try: return jsonify(trans.traducir_texto(d["texto"],d["idiomaDestino"]))
    except Exception as e: return jsonify({"error":str(e)}),500

@pub_bp.route("/idiomas",methods=["GET"])
@auth_required
def idiomas(): return jsonify(trans.obtener_idiomas())

bot_bp=Blueprint("bot",__name__,url_prefix="/chatbot")

@bot_bp.route("/mensaje",methods=["POST"])
@auth_required
def mensaje():
    d=request.json or {}
    if not d.get("mensaje"): return jsonify({"error":"Mensaje requerido"}),400
    try: return jsonify(lex.enviar_mensaje(d["mensaje"],d.get("sessionId")))
    except Exception as e: return jsonify({"error":str(e)}),500

perfil_bp=Blueprint("perfil",__name__,url_prefix="/perfil")

@perfil_bp.route("/",methods=["GET"])
@auth_required
def get_perfil():
    try:
        conn=get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT nombre_completo,email,dpi,foto_perfil_url FROM usuarios WHERE cognito_sub=%s",(g.user["sub"],))
            row=cur.fetchone()
        conn.close()
        if not row: return jsonify({"error":"No encontrado"}),404
        return jsonify(row)
    except Exception as e: return jsonify({"error":str(e)}),500

@perfil_bp.route("/",methods=["PUT"])
@auth_required
def put_perfil():
    pw=request.form.get("password")
    if not pw: return jsonify({"error":"Contraseña requerida"}),400
    try:
        conn2=get_connection()
        if not conn2: return jsonify({"error":"BD no disponible"}),503
        with conn2.cursor() as cur:
            cur.execute("SELECT id FROM usuarios WHERE cognito_sub=%s AND password_hash=MD5(%s)",(g.user["sub"],pw))
            row=cur.fetchone()
        conn2.close()
        if not row: return jsonify({"error":"Contraseña incorrecta"}),401
    except Exception as e: return jsonify({"error":str(e)}),500
    try:
        nombre=request.form.get("nombreCompleto"); dpi=request.form.get("dpi")
        cog.actualizar_perfil(g.user["accessToken"],nombre,dpi)
        foto=request.files.get("foto"); fu=fk=None
        if foto:
            ext=foto.content_type.split("/")[-1].replace("jpeg","jpg")
            r=s3.subir_imagen(foto.read(),ext,"perfil"); fu=r["url"]; fk=r["key"]
        conn=get_connection()
        if conn:
            upd=[]; prm=[]
            if nombre: upd.append("nombre_completo=%s"); prm.append(nombre)
            if dpi:    upd.append("dpi=%s"); prm.append(dpi)
            if fu:     upd+=["foto_perfil_url=%s","foto_perfil_key=%s"]; prm+=[fu,fk]
            if upd:
                prm.append(g.user["sub"])
                with conn.cursor() as cur: cur.execute(f"UPDATE usuarios SET {','.join(upd)} WHERE cognito_sub=%s",prm)
                conn.commit()
            conn.close()
        return jsonify({"mensaje":"Perfil actualizado","fotoPerfil":fu})
    except Exception as e: return jsonify({"error":str(e)}),500

# ── USUARIOS Y AMIGOS ─────────────────────────────────────────────────────────
usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

@usuarios_bp.route("/", methods=["GET"])
@auth_required
def listar_usuarios():
    sub = g.user["sub"]
    try:
        conn = get_connection()
        if not conn: return jsonify({"error":"BD no disponible"}),503
        with conn.cursor() as cur:
            cur.execute("""
                SELECT cognito_sub, nombre_completo, email, foto_perfil_url
                FROM usuarios WHERE cognito_sub != %s
                AND cognito_sub NOT IN (
                    SELECT CASE WHEN usuario_a_sub=%s THEN usuario_b_sub ELSE usuario_a_sub END
                    FROM amistades WHERE usuario_a_sub=%s OR usuario_b_sub=%s)
                AND cognito_sub NOT IN (
                    SELECT receptor_sub FROM solicitudes_amistad WHERE solicitante_sub=%s AND estado='pendiente')
            """, [sub,sub,sub,sub,sub])
            rows = cur.fetchall()
        conn.close(); return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

@usuarios_bp.route("/solicitud", methods=["POST"])
@auth_required
def enviar_solicitud():
    d = request.json or {}
    receptor = d.get("receptorSub")
    if not receptor: return jsonify({"error":"receptorSub requerido"}),400
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("INSERT INTO solicitudes_amistad (solicitante_sub,receptor_sub) VALUES (%s,%s)",
                (g.user["sub"],receptor))
        conn.commit(); conn.close()
        return jsonify({"mensaje":"Solicitud enviada"}),201
    except Exception as e:
        if "Duplicate" in str(e): return jsonify({"error":"Solicitud ya existe"}),409
        return jsonify({"error":str(e)}),500

@usuarios_bp.route("/solicitudes", methods=["GET"])
@auth_required
def ver_solicitudes():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""SELECT s.id, s.solicitante_sub, s.fecha_creacion,
                                  u.nombre_completo, u.foto_perfil_url
                           FROM solicitudes_amistad s JOIN usuarios u ON s.solicitante_sub=u.cognito_sub
                           WHERE s.receptor_sub=%s AND s.estado='pendiente'""", (g.user["sub"],))
            rows = cur.fetchall()
        conn.close(); return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

@usuarios_bp.route("/solicitud/<int:sid>", methods=["PUT"])
@auth_required
def responder_solicitud(sid):
    d = request.json or {}
    accion = d.get("accion")
    if accion not in ["aceptar","rechazar"]: return jsonify({"error":"accion debe ser aceptar o rechazar"}),400
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM solicitudes_amistad WHERE id=%s AND receptor_sub=%s",(sid,g.user["sub"]))
            row = cur.fetchone()
            if not row: return jsonify({"error":"Solicitud no encontrada"}),404
            estado = "aceptada" if accion=="aceptar" else "rechazada"
            cur.execute("UPDATE solicitudes_amistad SET estado=%s WHERE id=%s",(estado,sid))
            if accion=="aceptar":
                cur.execute("INSERT IGNORE INTO amistades (usuario_a_sub,usuario_b_sub) VALUES (%s,%s)",
                    (row["solicitante_sub"],g.user["sub"]))
        conn.commit(); conn.close()
        return jsonify({"mensaje":f"Solicitud {estado}"})
    except Exception as e: return jsonify({"error":str(e)}),500

@usuarios_bp.route("/amigos", methods=["GET"])
@auth_required
def listar_amigos():
    sub = g.user["sub"]
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""SELECT u.cognito_sub, u.nombre_completo, u.foto_perfil_url
                           FROM amistades a JOIN usuarios u ON u.cognito_sub =
                             CASE WHEN a.usuario_a_sub=%s THEN a.usuario_b_sub ELSE a.usuario_a_sub END
                           WHERE a.usuario_a_sub=%s OR a.usuario_b_sub=%s""", [sub,sub,sub])
            rows = cur.fetchall()
        conn.close(); return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

# ── MENSAJES ──────────────────────────────────────────────────────────────────
mensajes_bp = Blueprint("mensajes", __name__, url_prefix="/mensajes")

@mensajes_bp.route("/<amigo_sub>", methods=["GET"])
@auth_required
def historial(amigo_sub):
    sub = g.user["sub"]
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""SELECT m.id,m.emisor_sub,m.receptor_sub,m.contenido,m.fecha_creacion,m.leido,
                                  u.nombre_completo AS emisor_nombre
                           FROM mensajes m JOIN usuarios u ON m.emisor_sub=u.cognito_sub
                           WHERE (m.emisor_sub=%s AND m.receptor_sub=%s)
                              OR (m.emisor_sub=%s AND m.receptor_sub=%s)
                           ORDER BY m.fecha_creacion""", [sub,amigo_sub,amigo_sub,sub])
            rows = cur.fetchall()
            cur.execute("UPDATE mensajes SET leido=TRUE WHERE emisor_sub=%s AND receptor_sub=%s AND leido=FALSE",
                (amigo_sub,sub))
        conn.commit(); conn.close(); return jsonify(rows)
    except Exception as e: return jsonify({"error":str(e)}),500

@mensajes_bp.route("/", methods=["POST"])
@auth_required
def enviar_mensaje():
    d = request.json or {}
    receptor = d.get("receptorSub"); contenido = d.get("contenido")
    if not receptor or not contenido: return jsonify({"error":"receptorSub y contenido requeridos"}),400
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("INSERT INTO mensajes (emisor_sub,receptor_sub,contenido) VALUES (%s,%s,%s)",
                (g.user["sub"],receptor,contenido))
            nid = cur.lastrowid
        conn.commit(); conn.close()
        return jsonify({"id":nid,"contenido":contenido,"emisor_sub":g.user["sub"]}),201
    except Exception as e: return jsonify({"error":str(e)}),500
