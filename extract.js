var fs = require("fs");
var program = require("commander");
var AWS = require("aws-sdk");
const _cliProgress = require('cli-progress');

program
  .version("0.0.1")
  .option("-t, --table [tablename]", "table you want to output")
  .option("-d, --describe")
  .option("-r, --region [regionname]")
  .option(
    "-e, --endpoint [url]",
    "Endpoint URL, can be used to dump from local DynamoDB"
  )
  .option("-p, --profile [profile]", "Use profile from your credentials file")
  .option("-f, --file [file]", "Name of the file to be created")
  .option(
    "-ec --envcreds",
    "Load AWS Credentials using AWS Credential Provider Chain"
  )
  .parse(process.argv);

if (!program.table) {
  console.log("You must specify a table");
  program.outputHelp();
  process.exit(0);
}

if (!program.file && !program.describe) {
  console.log("You must specify a file output");
  program.outputHelp();
  process.exit(0);
}

if (program.region && AWS.config.credentials) {
  AWS.config.update({ region: program.region });
} else {
  AWS.config.loadFromPath(__dirname + "/config.json");
}

if (program.endpoint) {
  AWS.config.update({ endpoint: program.endpoint });
}

if (program.profile) {
  var newCreds = new AWS.SharedIniFileCredentials({ profile: program.profile });
  newCreds.profile = program.profile;
  AWS.config.update({ credentials: newCreds });
}

if (program.envcreds) {
  var newCreds = AWS.config.credentials;
  newCreds.profile = program.profile;
  AWS.config.update({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_DEFAULT_REGION
  });
}

var dynamoDB = new AWS.DynamoDB();

var query = {
  TableName: program.table,
  Limit: 1000
};

var describeTable = async function() {
  return await dynamoDB.describeTable(
    {
      TableName: program.table
    }).promise();
};

var stream;

// create a new progress bar instance and use shades_classic theme
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

var scanDynamoDB = async function(query) {
  do {
    var data = await dynamoDB.scan(query).promise();
    data.Items.forEach(function(row) {
      writeData(JSON.stringify( row ));
      // Result is incomplete; there is more to come.
      query.ExclusiveStartKey = data.LastEvaluatedKey;
    });
    // increment the current value in your application..
    bar1.increment(query.Limit);
  } while(typeof data.LastEvaluatedKey != "undefined");

};

var writeData = function(data) {
  stream.write(data + "\n");
};

(async () => {
  if (program.describe) {
    var describe = await describeTable();
    console.dir(describe);
  } else {
    stream = fs.createWriteStream(program.file, {flags:'a'});
    var describe = await describeTable();

    // if (describe.)
    // start the progress bar with a total value of 200 and start value of 0
    bar1.start(describe.Table.ItemCount, 0);

    await scanDynamoDB(query);

    // stop the progress bar
    bar1.stop();

    console.log('\nExtract finished !');
  }
})();
