const { Upload } = require("@aws-sdk/lib-storage");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
const s3 = require("../config/s3");
const env = require("../config/env");

async function uploadToS3({ folder, file }) {
  const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
  const key = `${folder}/${uuid()}.${ext}`; 

  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: env.S3_BUCKET_IMAGES,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await uploader.done();
  return { key, publicUrl: `${env.S3_PUBLIC_BASE_URL}/${key}` };
}

module.exports = { uploadToS3 };
