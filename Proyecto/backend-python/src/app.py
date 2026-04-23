import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from flask import Flask,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
from routes.routes import auth_bp,pub_bp,bot_bp,perfil_bp,usuarios_bp,mensajes_bp
app=Flask(__name__)
CORS(app)
@app.route("/health")
def health():
    from datetime import datetime
    return jsonify({"status":"ok","instancia":"python","timestamp":datetime.utcnow().isoformat()})
app.register_blueprint(auth_bp)
app.register_blueprint(pub_bp)
app.register_blueprint(bot_bp)
app.register_blueprint(perfil_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(mensajes_bp)
if __name__=="__main__":
    port=int(os.getenv("PORT",3000))
    print(f"🚀 Python en puerto {port}")
    app.run(host="0.0.0.0",port=port)
