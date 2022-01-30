import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    print(event)
    event['uploadDateTime'] = str(datetime.now())
    event['downloaded'] = "No"
    TableName = "InvoicesTable"

    table = dynamodb.Table(TableName)

    response = table.put_item(
        Item=event
    )
    print(response)
    return response["ResponseMetadata"]["HTTPStatusCode"]
