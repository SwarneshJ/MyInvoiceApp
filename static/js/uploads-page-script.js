var idtoken = document.getElementsByName("idtoken")[0].id;
var username = document.getElementsByName("username")[0].id;
var KEY = document.getElementsByName("s3key")[0].id;
var SECRET = document.getElementsByName("s3secret")[0].id;
var STOKEN = document.getElementsByName("s3token")[0].id;
var URL = document.getElementsByName("invoiceurl")[0].id;

// Generate UUID4
var dt = new Date().getTime();
var UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (dt + Math.random()*16)%16 | 0;
    dt = Math.floor(dt/16);
    return (c=='x' ? r :(r&0x3|0x8)).toString(16);
});

const s3 = new AWS.S3({
  region: 'ap-south-1',
  accessKeyId: KEY,
  secretAccessKey: SECRET,
  sessionToken: STOKEN
});

const fileTypes = ["pdf", "jpg", "png"];

var btn = document.getElementById("query_submit");
btn.onclick = function() {
  var file = document.getElementById("fileSelect");
  var name = document.getElementsByName("name")[0].value;
  var date = document.getElementsByName("date")[0].value;
  var invoiceNo = document.getElementsByName("invoiceNo")[0].value;
  var invoiceAmount = document.getElementsByName("invoiceAmount")[0].value;
  if (!name.length) {
    return alert("Please enter the name field");
  }
  if (!date.length) {
    return alert("Please enter the date of invoice");
  }
  if (!invoiceNo.length) {
    return alert("Please enter the invoice number");
  }
  if (!invoiceAmount.length) {
    return alert("Please enter the invoice amount");
  }
  if (!file.files.length) {
    return alert("Please choose a file to upload first.");
  }

  var fileFormat = (file.value).toString();
  var fileType = fileFormat.split('.')[fileFormat.split('.').length - 1];
  if (!fileTypes.includes(fileType.toLowerCase())) return alert("Please select a file in pdf, jpg or PNG formats");

  // Save transaction details
  const req = new XMLHttpRequest();
  req.open('POST', URL+'/save-invoice-data');
  req.setRequestHeader("Authorizer", idtoken);
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // console.log(req.responseText);

      // Setting up S3 upload parameters
      const params = {
        Bucket: 'my-invoices-s3',
        Key: UUID+"."+fileType, // File name you want to save as in S3
        Body: file.files[0]
      };

      // Uploading files to the bucket
      s3.upload(params, function(err, data) {
        if (err) { 
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        location.reload(true);
        return alert("File uploaded successfully to S3 bucket");
      });
    }
    else if (this.readyState == 4 && this.status != 200) {
      return alert("Upload Failed - Internal Server error: Please re-login");
    }
  }
  req.send(JSON.stringify({
    "username" : username,
    "name" : name,
    "date" : date,
    "invoiceNo" : invoiceNo,
    "invoiceAmount": invoiceAmount,
    "UUID" : UUID,
    "fileType": fileType
  }));

}
