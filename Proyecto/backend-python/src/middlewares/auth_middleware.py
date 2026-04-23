import jwt,time
from functools import wraps
from flask import request,jsonify,g
def auth_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        h=request.headers.get("Authorization","")
        if not h.startswith("Bearer "): return jsonify({"error":"Token requerido"}),401
        try:
            d=jwt.decode(h.split()[1],options={"verify_signature":False})
            if d.get("exp",0)<int(time.time()): return jsonify({"error":"Token expirado"}),401
            g.user={"sub":d.get("sub"),"email":d.get("email"),"nombre":d.get("name"),"accessToken":h.split()[1]}
        except: return jsonify({"error":"Token inválido"}),401
        return f(*args,**kwargs)
    return decorated
