// Filter by dates

$(document).ready(function () {
  $('#myTable').DataTable( {
    "pagingType": "full_numbers"
  } );
  $.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var FilterStart = $('#searchFrom').val();
        var FilterEnd = $('#searchTo').val();
        var recordDate = data[4].trim();
        if (FilterStart == '' || FilterEnd == '') {
            return true;
        }
        if (recordDate >= FilterStart && recordDate <= FilterEnd)
        {
            return true;
        }
        else {
            return false;
        }
        
    });
    var Table = $('#myTable').DataTable();
    $('#searchFrom').change(function (e) {
        Table.draw();
    });
    $('#searchTo').change(function (e) {
        Table.draw();
    });
});

// Get the button that opens the modal
var modals = document.getElementsByName("myModal");
var row = document.getElementsByName("uuidKeys");
var spans = document.getElementsByClassName("close");

for (var i = 0; i < row.length; i++) (function(i) {
  var modal = document.getElementById(modals[i].id)

  // When the user clicks on the button, open the modal
  row[i].onclick = function() {
    modal.style.display = "block";
  }

  // Get the <span> element that closes the modal
  var span = document.getElementById(spans[i].id);

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
})(i);

// Download the file inside view details button

var idtoken = document.getElementsByName("idtoken")[0].id;
var KEY = document.getElementsByName("s3key")[0].id;
var SECRET = document.getElementsByName("s3secret")[0].id;
var STOKEN = document.getElementsByName("s3token")[0].id;

const s3 = new AWS.S3({
  region: 'ap-south-1',
  accessKeyId: KEY,
  secretAccessKey: SECRET,
  sessionToken: STOKEN
});

var records = document.getElementsByName("uuidKeys");
var uuidList = [];
records.forEach(record => {
  uuidList.push(record.id);
});

var group = document.getElementsByName("group")[0].id;
var urlApi = document.getElementsByName("invoiceurl")[0].id;
var username = document.getElementsByName("username")[0].id;

uuidList.forEach(uuidNo => {
  
  var download = document.getElementById("d "+uuidNo.split('.')[0]);

  download.onclick = function() {
    const signedUrlExpireSeconds = 15 // your expiry time in seconds.

    const url = s3.getSignedUrl('getObject', {
      Bucket: "my-invoices-s3",
      Key: uuidNo.split(' ')[0],
      Expires: signedUrlExpireSeconds
    });

    var zip = new JSZip();
    var filename = "";

    // Get download date for the name of zip file
    var today = new Date();
    var zipFilename = today.toLocaleDateString()+" "+today.toLocaleTimeString();

    // Set downloaded to true and record download date if group is accountant
    if (group === 'Accountant') {
      const req = new XMLHttpRequest();
      req.open('POST', urlApi+"/download-status");
      req.setRequestHeader("Authorizer", idtoken);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify({
        "uploadId" : uuidNo.split('.')[0],
        "downloadedBy": username
      }));
      req.onreadystatechange = function() {
        //console.log(req.responseText);
        if (this.readyState == 4 && this.status == 200) {
          //console.log(req.responseText);
        }
      }
    }

    JSZipUtils.getBinaryContent(url, function (err, data) {
      if(err) {
        throw err; // or handle the error
      }
      filename = (uuidNo).split(' ')[1]+" "+(uuidNo).split(' ')[2]+" "+(uuidNo).split(' ')[3]+"."+uuidNo.split('.')[1].split(' ')[0];
      // console.log(filename);
      zip.file(filename, data, {base64:true});
      // console.log("Loop number "+count);
      zip.generateAsync({type:'blob'}).then(function(content) {
          saveAs(content, zipFilename);
          window.location.reload();
      });
    });
  }
})

// Select all check boxes

function checkall(){
  var checkboxes = document.getElementsByName('mycheckboxes');
  var button = document.getElementById('selectall');
  if(button.value == 'select'){
      for (var i in checkboxes){ 
        checkboxes[i].checked = 'TRUE';
      }
      button.value = 'deselect'
  }else{
      for (var i in checkboxes){
          checkboxes[i].checked = '';
      }
      button.value = 'select';
  }
}

// Get checked check boxes
var btn = document.getElementById("downloadmultiple");

btn.onclick = function() {
  var checkedBoxes = document.querySelectorAll('input[name=mycheckboxes]:checked');
  var zip = new JSZip();
  var filename = "";
  var count = 0;

  // Get download date for the name of zip file
  var today = new Date();
  var zipFilename = today.toLocaleDateString()+" "+today.toLocaleTimeString();

  for(let i = 0; i < checkedBoxes.length ; i++){
    let checkedBox = checkedBoxes[i];
    let uuidNum = (checkedBox.id).split(' ')[0];

    let signedUrlExpireSeconds = 15 // your expiry time in seconds.

    let url = s3.getSignedUrl('getObject', {
      Bucket: "my-invoices-s3",
      Key: uuidNum,
      Expires: signedUrlExpireSeconds
    });

    // Set downloaded to true and record download date if group is accountant
    if (group === 'Accountant') {
      const req = new XMLHttpRequest();
      req.open('POST', urlApi+"/download-status");
      req.setRequestHeader("Authorizer", idtoken);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify({
        "uploadId" : uuidNum.split('.')[0],
        "downloadedBy": username
      }));
      req.onreadystatechange = function() {
        //console.log(req.responseText);
        if (this.readyState == 4 && this.status == 200) {
          //console.log(req.responseText);
        }
      }
    }

    JSZipUtils.getBinaryContent(url, function (err, data) {
      if(err) {
        throw err; // or handle the error
      }
      filename = (checkedBox.id).split(' ')[1]+" "+(checkedBox.id).split(' ')[2]+" "+(checkedBox.id).split(' ')[3]+"."+uuidNum.split('.')[1];
      // console.log(filename);
      zip.file(filename, data, {base64:true});
      count++;
      // console.log("Loop number "+count);
      if (count == checkedBoxes.length) {
        zip.generateAsync({type:'blob'}).then(function(content) {
           saveAs(content, zipFilename);
           window.location.reload();
        });
      }
    });

  }
  // window.location.reload();
}
