import os, uuid
from config.aws_config import s3_client
from dotenv import load_dotenv
load_dotenv()
BUCKET=os.getenv("S3_BUCKET_NAME"); BASE_URL=os.getenv("S3_BASE_URL")
def subir_imagen(data, extension="jpg", tipo="publicacion"):
    carpeta="Fotos_Perfil" if tipo=="perfil" else "Fotos_Publicadas"
    key=f"{carpeta}/{uuid.uuid4()}.{extension}"
    s3_client.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=f"image/{extension}")
    return {"key":key,"url":f"{BASE_URL}/{key}"}
