import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')


def lambda_handler(event, context):
    print(event)
    TableName = "InvoicesTable"

    table = dynamodb.Table(TableName)

    # Change status of downloaded if the file has been downloaded by an accountant
    response = table.update_item(
        Key={'UUID': event['uploadId']},
        UpdateExpression="set downloadedBy=:a, downloadDate=:b, downloaded=:c",
        ExpressionAttributeValues={
            ':a': event['downloadedBy'],
            ':b': str(datetime.now()),
            ':c': "Yes"
        },
        ReturnValues="UPDATED_NEW"
    )
    print(response)
    return response["ResponseMetadata"]["HTTPStatusCode"]
