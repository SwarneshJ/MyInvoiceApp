import json
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
dynamo_client = boto3.client('dynamodb')


def lambda_handler(event, context):
    print(event)
    TableName = "InvoicesTable"

    table = dynamodb.Table(TableName)

    scan_kwargs = {}
    invoice_list = []

    if event['group'] == 'Accountant':
        done = False
        start_key = None
        # Exclusive start key since dynamodb scan has limitation of 1 MB per scan
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            res = table.scan(**scan_kwargs)
            invoice_list.extend(res['Items'])
            start_key = res.get('LastEvaluatedKey', None)
            done = start_key is None

    elif event['group'] == 'Vendor':
        scan_kwargs['FilterExpression'] = Attr("username").eq(event['username'])
        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            res = table.scan(**scan_kwargs)
            invoice_list.extend(res['Items'])
            start_key = res.get('LastEvaluatedKey', None)
            done = start_key is None

    print(invoice_list)
    return invoice_list
