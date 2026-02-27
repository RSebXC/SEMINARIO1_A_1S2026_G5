
import boto3
import uuid
from botocore.exceptions import NoCredentialsError
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def get_s3_client():
    """Returns an S3 client if credentials are configured, otherwise None."""
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return None
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

async def upload_file_to_s3(file: UploadFile, folder: str) -> dict:
    """
    Uploads a file to S3 and returns the key and public URL.
    Raises HTTPException if S3 is not configured or upload fails.
    """
    s3_client = get_s3_client()
    if not s3_client:
        raise HTTPException(
            status_code=503,
            detail="S3 not configured. Please provide a URL string instead."
        )
    try:
        file_extension = file.filename.split(".")[-1].lower()
        key = f"{folder}/{uuid.uuid4()}.{file_extension}"

        s3_client.upload_fileobj(
            file.file,
            settings.S3_BUCKET_NAME,
            key,
            ExtraArgs={'ContentType': file.content_type}
        )

        public_url = f"{settings.S3_PUBLIC_BASE_URL}/{key}"
        return {"key": key, "publicUrl": public_url}

    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="S3 credentials are invalid.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
