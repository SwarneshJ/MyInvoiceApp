from flask import Flask, request, render_template, redirect, Response, session
from jose import jwt
import json
import boto3
import requests
import uuid

app = application = Flask(__name__)
application.secret_key = 'myFlaskApp'
client = boto3.client('cognito-idp', region_name='ap-south-1')

@app.route('/')
def login():
    session.clear()
    return render_template('index.html')

@app.route('/', methods=['POST'])
def login_post():
    username = request.form['email']
    password = request.form['password']
    try:
        # Checks if password is correct, if not throws an exception
        verify_response = init_auth_password(username, password)
        idToken = verify_response['AuthenticationResult']['IdToken']
        session['idToken'] = idToken
        print("You are logged in successfully!")

        claims = jwt.get_unverified_claims(session['idToken'])
        # print(claims)
        session['username'] = claims['cognito:username']
        userGroup = claims['cognito:groups'][0]

        # URL of Get Temporary S3 Credentials API Gateway
        url = 'https://4pzyw0ke72.execute-api.ap-south-1.amazonaws.com/development/get-temporary-creds'
        headers = {'Authorizer': session['idToken'], 'Content-Type': 'application/json'}
        try:
            req = requests.get(url, headers=headers)
        except Exception as e:
            print(e)
        res = json.loads(req.text)
        S3_KEY = res['accessKeyId']
        S3_SECRET = res['secretAccessKey']
        S3_TOKEN = res['sessionToken']
        if 'phone_number' in claims:
            phone = claims['phone_number']
        else:
            phone = claims['email']

        session['creds'] = {
            "username": session['username'],
            "name": claims['name'],
            "phone": phone,
            "idtoken": idToken,
            "group": userGroup,
            "s3key": S3_KEY,
            "s3secret": S3_SECRET,
            "s3token": S3_TOKEN,
            "invoiceurl": "https://4pzyw0ke72.execute-api.ap-south-1.amazonaws.com/development"
        }
        return redirect('/dashboard')
    except Exception as e:
        print(e)
        print('Incorrect username or password')
    return 'Incorrect username or password'


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/dashboard')
def dashboard():
    if 'idToken' in session:
        if (session['creds']['group'] == 'Accountant'):
            return redirect('/download')
        elif (session['creds']['group'] == 'Vendor'):
            return render_template(
                'dashboard.html',
                name=session['creds']['name'],
                group=session['creds']['group'],
                phone=session['creds']['phone']
            )
    else:
        return "Unauthorized Access"

@app.route('/upload')
def upload():
    if ('idToken' in session and session['creds']['group'] == 'Vendor'):
        return render_template('upload-page.html', creds=session['creds'])
    else:
        return "Unauthorized Access"

@app.route('/download')
def download():
    if 'idToken' in session:
        # URL of API Gateway to fetch invoice list
        url = 'https://4pzyw0ke72.execute-api.ap-south-1.amazonaws.com/development/get-invoice-list'
        headers = {'Authorizer': session['idToken'], 'Content-Type': 'application/json'}
        inputValue = {
            'username': session['username'],
            'group': session['creds']['group']
        }
        try:
            req = requests.post(url, headers=headers, data=json.dumps(inputValue))
            # session['recordList'] = json.loads(req.text)
            recordList = json.loads(req.text)
            if 'message' in recordList:
                return "Session Timed Out: "+session['recordList']['message']
            # print(recordList)
            return render_template('download-page.html', records=recordList, creds=session['creds'])

        except Exception as e:
            print(e)
            return "Session timed out: "+str(e)
    else:
        return "Unauthorized Access"

def init_auth_password(username, password):
    response = client.initiate_auth(
        AuthFlow='USER_PASSWORD_AUTH',
        AuthParameters={
            'USERNAME': username,
            'PASSWORD': password
        },
        ClientId='6fpnuirig890g9fq82fhirnlvq'
    )
    return response


if __name__ == '__main__':
    app.run(debug=True)
