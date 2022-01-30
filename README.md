# MyInvoiceApp
A flask based application for uploading and downloading invoices with role based login



Link to access the website: http://myinvoiceapp-env.eba-pxe4neey.ap-south-1.elasticbeanstalk.com/

Login Credentials for Accountant:
1. Username - swarnesh , Password - Pass@2022

Login Credentials for Vendors:
1. Username - testuser , Password - Pass@2022
2. Username - testuser2 , Password - Pass@2022

This application has been implemented with role based login, there are two types of users - Accountant and Vendor

1. A vendor can upload invoices from the upload invoice dashboard by entering the invoice details and uploading the required file (accepted formats: pdf, jpg, png),
he/she can also view the files uploaded by him/her from the "Downloads" screen.
2. An accountant can view all the invoices uploaded on the portal by the vendors, view their details and download those files.
