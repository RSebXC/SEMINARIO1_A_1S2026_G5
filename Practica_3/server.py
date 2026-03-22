from flask import Flask, request, jsonify
from dotenv import load_dotenv
import boto3
import base64
import os

load_dotenv()  # carga el .env automáticamente

app = Flask(__name__)

@app.route('/tarea3-carne', methods=['POST'])
def analizar_imagen():
    data = request.get_json()

    if not data or 'imagen_base64' not in data:
        return jsonify({'error': 'Se requiere el campo imagen_base64'}), 400

    try:
        imagen_bytes = base64.b64decode(data['imagen_base64'])
    except Exception:
        return jsonify({'error': 'Base64 invalido'}), 400

    try:
        cliente = boto3.client(
            'rekognition',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )

        respuesta = cliente.detect_labels(
            Image={'Bytes': imagen_bytes},
            MaxLabels=10,
            MinConfidence=70
        )

        etiquetas = [
            {
                'nombre': label['Name'],
                'confianza': round(label['Confidence'], 2)
            }
            for label in respuesta['Labels']
        ]

        return jsonify({'etiquetas': etiquetas}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)