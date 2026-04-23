from config.aws_config import translate_client
IDIOMAS={"en":"English","fr":"Français","de":"Deutsch","pt":"Português"}
def traducir_texto(texto,destino,origen="auto"):
    r=translate_client.translate_text(Text=texto,SourceLanguageCode=origen,TargetLanguageCode=destino)
    return {"textoOriginal":texto,"textoTraducido":r["TranslatedText"],"idiomaDestino":destino}
def obtener_idiomas():
    return [{"codigo":"es","nombre":"Español"}]+[{"codigo":k,"nombre":v} for k,v in IDIOMAS.items()]
