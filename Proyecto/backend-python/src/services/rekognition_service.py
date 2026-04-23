import os
from config.aws_config import rekognition_client
from dotenv import load_dotenv
load_dotenv()
BUCKET=os.getenv("S3_BUCKET_NAME")
def detectar_etiquetas(key):
    r=rekognition_client.detect_labels(Image={"S3Object":{"Bucket":BUCKET,"Name":key}},MaxLabels=15,MinConfidence=70)
    return [{"nombre":l["Name"],"confianza":round(l["Confidence"])} for l in r["Labels"]]
def comparar_rostros(foto_bytes, perfil_key):
    r=rekognition_client.compare_faces(SourceImage={"Bytes":foto_bytes},
        TargetImage={"S3Object":{"Bucket":BUCKET,"Name":perfil_key}},SimilarityThreshold=80)
    m=r.get("FaceMatches",[])
    if not m: return {"coincide":False,"similitud":0}
    s=round(m[0]["Similarity"]); return {"coincide":s>=80,"similitud":s}
