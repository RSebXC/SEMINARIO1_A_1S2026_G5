const router = require('express').Router();
const multer = require('multer');
const auth = require('../middlewares/auth.middleware');
const rek = require('../services/rekognition.service');
const s3 = require('../services/s3.service');
const { pool } = require('../config/db');
const { traducirTexto, obtenerIdiomas } = require('../services/translate.service');
const upload = multer({ storage:multer.memoryStorage() });

router.get('/', auth, async (req,res) => {
  try {
    const sub=req.user.sub; const { etiqueta }=req.query;
    let q=`SELECT p.id,p.descripcion,p.imagen_url,p.fecha_creacion,
            u.nombre_completo AS autor,u.foto_perfil_url AS foto_autor,
            GROUP_CONCAT(e.nombre SEPARATOR ',') AS etiquetas
           FROM publicaciones p JOIN usuarios u ON p.usuario_sub=u.cognito_sub
           LEFT JOIN publicacion_etiquetas pe ON p.id=pe.publicacion_id
           LEFT JOIN etiquetas e ON pe.etiqueta_id=e.id
           WHERE (p.usuario_sub=? OR p.usuario_sub IN (
             SELECT CASE WHEN usuario_a_sub=? THEN usuario_b_sub ELSE usuario_a_sub END
             FROM amistades WHERE (usuario_a_sub=? OR usuario_b_sub=?) AND estado='aceptada'))`;
    const params=[sub,sub,sub,sub];
    if (etiqueta&&etiqueta!=='Todos') { q+=' AND e.nombre=?'; params.push(etiqueta); }
    q+=' GROUP BY p.id ORDER BY p.fecha_creacion DESC';
    const [rows]=await pool.execute(q,params);
    res.json(rows.map(r=>({ ...r, etiquetas:r.etiquetas?r.etiquetas.split(','):[] })));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.get('/etiquetas', auth, async (req,res) => {
  try {
    const [rows]=await pool.execute('SELECT DISTINCT nombre FROM etiquetas ORDER BY nombre');
    res.json(['Todos',...rows.map(r=>r.nombre)]);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.post('/', auth, upload.single('imagen'), async (req,res) => {
  try {
    if (!req.file) return res.status(400).json({ error:'Imagen obligatoria' });
    const ext=(req.file.mimetype.split('/')[1]||'jpg').replace('jpeg','jpg');
    const img=await s3.subirImagen(req.file.buffer,ext,'publicacion');
    const etiquetas=await rek.detectarEtiquetas(img.key);
    const [result]=await pool.execute(
      'INSERT INTO publicaciones (usuario_sub,descripcion,imagen_url,imagen_key) VALUES (?,?,?,?)',
      [req.user.sub,req.body.descripcion||null,img.url,img.key]
    );
    const pid=result.insertId;
    for (const et of etiquetas) {
      await pool.execute('INSERT IGNORE INTO etiquetas (nombre) VALUES (?)',[et.nombre]);
      const [[{id}]]=await pool.execute('SELECT id FROM etiquetas WHERE nombre=?',[et.nombre]);
      await pool.execute('INSERT INTO publicacion_etiquetas VALUES (?,?,?)',[pid,id,et.confianza]);
    }
    res.status(201).json({ id:pid, imagenUrl:img.url, etiquetas });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.post('/:id/comentarios', auth, async (req,res) => {
  try {
    const { contenido }=req.body;
    if (!contenido) return res.status(400).json({ error:'Contenido requerido' });
    const [r]=await pool.execute(
      'INSERT INTO comentarios (publicacion_id,usuario_sub,contenido) VALUES (?,?,?)',
      [req.params.id,req.user.sub,contenido]
    );
    res.status(201).json({ id:r.insertId, contenido });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.get('/:id/comentarios', auth, async (req,res) => {
  try {
    const [rows]=await pool.execute(
      `SELECT c.id,c.contenido,c.fecha_creacion,u.nombre_completo AS autor
       FROM comentarios c JOIN usuarios u ON c.usuario_sub=u.cognito_sub
       WHERE c.publicacion_id=? ORDER BY c.fecha_creacion`,[req.params.id]
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.post('/traducir', auth, async (req,res) => {
  try {
    const { texto, idiomaDestino }=req.body;
    if (!texto||!idiomaDestino) return res.status(400).json({ error:'texto e idiomaDestino requeridos' });
    res.json(await traducirTexto(texto,idiomaDestino));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

router.get('/idiomas', auth, (req,res) => res.json(obtenerIdiomas()));

module.exports = router;
