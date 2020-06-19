jest.setTimeout(30000);
//! give more time than 5second to every test

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useMongoClient: true,
});
