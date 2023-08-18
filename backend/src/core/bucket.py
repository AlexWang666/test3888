import boto3, botocore
from .config import config

s3 = boto3.client(
   "s3",
   aws_access_key_id=config['s3']['AWS_ACCESS_KEY'],
   aws_secret_access_key=config['s3']['AWS_SECRET_KEY']
)