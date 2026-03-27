import base64
import json
from PIL import Image
import io

IMAGEN = "imagen.jpg"

# Abrir y redimensionar si es muy grande
img = Image.open(IMAGEN)
print(f"Tamaño original: {img.size}")

# Redimensionar manteniendo proporción
img.thumbnail((1920, 1080))
print(f"Tamaño reducido: {img.size}")

# Guardar en buffer
buffer = io.BytesIO()
img.save(buffer, format="JPEG", quality=85)
contenido = buffer.getvalue()

print(f"Peso final: {round(len(contenido)/1024/1024, 2)} MB")

if len(contenido) > 5 * 1024 * 1024:
    print("Aún muy grande, reduce más el quality o tamaño")
else:
    print("Tamaño OK para Rekognition")

encoded = base64.b64encode(contenido).decode('utf-8')
payload = {"imagen_base64": encoded}

with open("payload.json", "w") as f:
    json.dump(payload, f)

print(f"payload.json generado — base64: {len(encoded)} caracteres")