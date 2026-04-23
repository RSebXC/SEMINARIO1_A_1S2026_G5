require('dotenv').config();
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/aws');
const { randomUUID } = require('crypto');
const BUCKET = process.env.S3_BUCKET_NAME;
const BASE_URL = process.env.S3_BASE_URL;
async function subirImagen(buffer, extension='jpg', tipo='publicacion') {
  const carpeta = tipo==='perfil' ? 'Fotos_Perfil' : 'Fotos_Publicadas';
  const key = `${carpeta}/${randomUUID()}.${extension}`;
  await s3Client.send(new PutObjectCommand({ Bucket:BUCKET, Key:key, Body:buffer, ContentType:`image/${extension}` }));
  return { key, url:`${BASE_URL}/${key}` };
}
async function eliminarImagen(key) { await s3Client.send(new DeleteObjectCommand({ Bucket:BUCKET, Key:key })); }
module.exports = { subirImagen, eliminarImagen };
