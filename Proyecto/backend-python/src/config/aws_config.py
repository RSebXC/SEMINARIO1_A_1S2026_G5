import boto3, os
from dotenv import load_dotenv
load_dotenv()
cfg = dict(region_name=os.getenv("AWS_REGION","us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))
cognito_client     = boto3.client("cognito-idp",   **cfg)
rekognition_client = boto3.client("rekognition",   **cfg)
translate_client   = boto3.client("translate",     **cfg)
lex_client         = boto3.client("lexv2-runtime", **cfg)
s3_client          = boto3.client("s3",            **cfg)
