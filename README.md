# AWS DynamoDB extract

This application will extract the content of a DynamoDB table into JSON output.

By default the program use the configuration and credentials provided by your ~/.aws/ files (come with aws-cli install).

If you don't have aws-cli setup, you can update `config.json` with your AWS credentials and region.

## Pre-requisites

```
npm install
```

## Usage

typically, to use you'd run:

```
npm run extract -- -t your_dynamo_table_name -f output.json
```

Use *-d* to describe the table prior so you can have an idea of the number of rows you are going to export

```
npm run extract -- -t your_dynamo_table_name -d
```

to get some information about the table.

Full syntax is:

    Options:

    	-h, --help               output usage information
    	-V, --version            output the version number
    	-t, --table [tablename]  table you want to output
    	-e, --endpoint [url]     Endpoint URL, can be used to dump from local DynamoDB
    	-f, --file [file]        Name of the file to be created
    	-d, --describe
    	-p, --profile [profile]  Use profile from your credentials file
    	-ec --envcreds           Load AWS Credentials using AWS Credential Provider Chain
