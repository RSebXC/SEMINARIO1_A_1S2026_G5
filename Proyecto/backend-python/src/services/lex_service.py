import os,uuid
from config.aws_config import lex_client
from dotenv import load_dotenv
load_dotenv()
def enviar_mensaje(mensaje,session_id=None):
    sid=session_id or str(uuid.uuid4())
    r=lex_client.recognize_text(botId=os.getenv("LEX_BOT_ID"),botAliasId=os.getenv("LEX_BOT_ALIAS_ID"),
        localeId=os.getenv("LEX_LOCALE_ID","es_US"),sessionId=sid,text=mensaje)
    msgs=" ".join(m["content"] for m in r.get("messages",[]) if m.get("contentType")=="PlainText")
    return {"sessionId":sid,"respuesta":msgs,"intent":r.get("sessionState",{}).get("intent",{}).get("name")}
