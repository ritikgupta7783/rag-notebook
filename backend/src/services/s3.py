import os

from configs.s3 import s3

BUCKET_NAME = os.environ["AWS_S3_BUCKET"]

def upload_to_s3(
    file,
    key: str,
    content_type: str | None = None,
) -> str:
    extra_args = {}

    if content_type:
        extra_args["ContentType"] = content_type

    s3.upload_fileobj(
        file,
        BUCKET_NAME,
        key,
        ExtraArgs=extra_args,
    )

    return key

def delete_from_s3(key: str) -> None:
    s3.delete_object(
        Bucket=BUCKET_NAME,
        Key=key,
    )

def download_from_s3(
    key: str,
    destination: str,
) -> str:
    s3.download_file(
        BUCKET_NAME,
        key,
        destination,
    )

    return destination

