require('dotenv').config();
const config = require('../config');

const lodash = require('lodash');
const extraTool = require('express-extra-tool');
extraTool.initGlobal({
  dirroot: __dirname + '/../',
  additions: [{ name: '_', value: lodash }]
});

// database
const db = require('../services/Mongoose');
const { cloneFlow } = require('../providers/FlowProvider');
main();

async function main() {
  await db.connectDatabase();

  const rs = await cloneFlow(
    '5e47fd8fdbfd66471dd71f48',
    '5e3fcc36dbfd66471dd71f33',
    '5e3fcc36dbfd66471dd71f34',
    '5e3fb72c615d2416b2d9cd3a'
  );

  console.log(rs);
}
