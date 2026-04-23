require('dotenv').config();
const { DetectLabelsCommand, CompareFacesCommand } = require('@aws-sdk/client-rekognition');
const { rekognitionClient } = require('../config/aws');
const BUCKET = process.env.S3_BUCKET_NAME;
async function detectarEtiquetas(imageKey) {
  const res = await rekognitionClient.send(new DetectLabelsCommand({
    Image:{ S3Object:{ Bucket:BUCKET, Name:imageKey } }, MaxLabels:15, MinConfidence:70
  }));
  return res.Labels.map(l => ({ nombre:l.Name, confianza:Math.round(l.Confidence) }));
}
async function compararRostros(fotoBuffer, perfilKey) {
  const res = await rekognitionClient.send(new CompareFacesCommand({
    SourceImage:{ Bytes:fotoBuffer },
    TargetImage:{ S3Object:{ Bucket:BUCKET, Name:perfilKey } },
    SimilarityThreshold:80
  }));
  if (!res.FaceMatches?.length) return { coincide:false, similitud:0 };
  const sim = Math.round(res.FaceMatches[0].Similarity);
  return { coincide:sim>=80, similitud:sim };
}
module.exports = { detectarEtiquetas, compararRostros };
