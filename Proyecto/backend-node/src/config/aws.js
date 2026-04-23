require('dotenv').config();
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { TranslateClient } = require('@aws-sdk/client-translate');
const { LexRuntimeV2Client } = require('@aws-sdk/client-lex-runtime-v2');
const { S3Client } = require('@aws-sdk/client-s3');
const cfg = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
};
module.exports = {
  cognitoClient: new CognitoIdentityProviderClient(cfg),
  rekognitionClient: new RekognitionClient(cfg),
  translateClient: new TranslateClient(cfg),
  lexClient: new LexRuntimeV2Client(cfg),
  s3Client: new S3Client(cfg)
};
