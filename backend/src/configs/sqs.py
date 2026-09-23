import json
import os

import boto3
from dotenv import load_dotenv

load_dotenv()

QUEUE_URL = os.environ["AWS_SQS_QUEUE_URL"]

sqs = boto3.client(
    "sqs",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="ap-south-1",
)

def publish_message(message: dict) -> str:
    response = sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps(message),
    )

    return response["MessageId"]
