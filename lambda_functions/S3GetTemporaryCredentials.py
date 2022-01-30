import boto3
import os
sts = boto3.client("sts")

# Get the role ARN of STS-Lambda-assume-S3-role which is saved as environment variable
roleARN = os.environ['RoleArn']

def lambda_handler(event, context):
    try:
        response = sts.assume_role(
            RoleArn=roleARN,
            RoleSessionName='AssumeRoleSession1',
            DurationSeconds=1800
        )
        responseJSON = {
            "accessKeyId": response['Credentials']['AccessKeyId'],
            "secretAccessKey": response['Credentials']['SecretAccessKey'],
            "sessionToken": response['Credentials']['SessionToken'],
            "expiration": str(response['Credentials']['Expiration']),
            "statusCode": 1000,
            "statusMsg": "Success"
        }
    except Exception as error:
        print(error)
        responseJSON = {
            "accessKeyId": None,
            "secretAccessKey": None,
            "sessionToken": None,
            "expiration": None,
            "statusCode": 1001,
            "statusMsg": "Failure"
        }
    return responseJSON
