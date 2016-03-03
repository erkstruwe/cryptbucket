# cryptbucket [![Build Status](https://travis-ci.org/erkstruwe/cryptbucket.svg?branch=master)](https://travis-ci.org/erkstruwe/cryptbucket)
End-to-end encrypted file hosting

## Usage
### Install
```
npm install
```

### Set up environment
Copy `.env.sample` to `.env` and make all necessary changes to get your database and AWS S3 connections working.

Please take a look at `config/env/development.js` to see if all settings match your environment. By default, you should have a DNS entry with `static.localhost` mapping to `127.0.0.1`.

The Amazon credentials supplied in `.env` should be allowed to `putObject` and `getObject` to AWS S3 in your [S3 Bucket Policy](http://awspolicygen.s3.amazonaws.com/policygen.html).
```json
{
  "Id": "YOUR_POLICY_ID",
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "YOUR_STATEMENT_ID",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Effect": "Allow",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
    "Principal": {
      "AWS": [
        "YOUR_IAM_ARN"
      ]
    }
  }]
}
```

Your bucket's CORS configuration should at least include the following.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>http://localhost:1336</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>accept</AllowedHeader>
    <AllowedHeader>content-type</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

Enable the auto-delete feature by changing the lifecycle settings of your S3 bucket to permanently delete all files with prefix ```standard``` 7 days after creation. Make sure to set the amount of days in the config file as well.

### Test
```
npm test
```
Coverage is virtually non-existent at present.

### Run
```
npm start
```
The package is built and run on the port specified in `.env`.

### Develop
Run the following commands in parallel.
```
npm run build:static
npm run watch:html
npm run watch:css
npm run watch:js
npm run watch:app
npm run livereload
```

## Contribute
This is work in progress. Although I appreciate any help, please do not send PRs on your own. Instead, feel free to contact me.

## License
UNLICENSED. This code is open source only for reviewing and contributing. Please do not use this code for your own projects.

## Thanks
Thanks to all the hard-working javascript module authors out there (see [package.json](https://github.com/erkstruwe/cryptbucket/blob/master/package.json) for a comprehensive list)!
