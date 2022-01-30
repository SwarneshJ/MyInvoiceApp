# MyInvoiceApp
A flask based application hosted on AWS for uploading and downloading invoices with role based login

![alt text](https://github.com/SwarneshJ/MyInvoiceApp/blob/9afb5c36bd5bbe077ce02a07a756b5a33da2fe00/screenshots/Capture3.JPG?raw=true)

Link to access the website: http://myinvoiceapp-env.eba-pxe4neey.ap-south-1.elasticbeanstalk.com/

Login Credentials for Accountant:
1. Username - swarnesh , Password - Pass@2022

Login Credentials for Vendors:
1. Username - testuser , Password - Pass@2022
2. Username - testuser2 , Password - Pass@2022

This application has been hosted on AWS Elastic Beanstalk, and the services being used are Lambda Functions, S3, DynamoDb (NoSQL).

There are two types of users - Accountant and Vendor

1. A vendor can upload invoices from the upload invoice dashboard by entering the invoice details and uploading the required file (accepted formats: pdf, jpg, png),
he/she can also view the files uploaded by him/her from the "Downloads" screen.
2. An accountant can view all the invoices uploaded on the portal by the vendors, view their details and download those files.

![alt text](https://github.com/SwarneshJ/MyInvoiceApp/blob/c0ebe8ae7f6cbd9634f2306918d6b91985cc63f2/screenshots/Capture.JPG?raw=true)

User also has the option to download multiple files together in a zip format by selecting all the checkboxes.

The files are displayed in a tabular format with proper pagination and sorting by columns feature enabled, an accountant also has the option to search for files by username or
to only display invoices from a particular date range.
