const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

//const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
client.hmget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this; //! make query chain able
};

//! why not use arrow function?
//! => because we need to use this keyword
mongoose.Query.prototype.exec = async function () {
  //! if this flag is true then apply our caching logic
  //! unless pass the original exec function
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  //! see if we have a value for 'key' in redis
  const cacheValue = await client.hmget(this.hashKey, key);
  //! nested key
  //! if we do
  if (cacheValue) {
    //console.log(this)
    console.log('FROM CACHE SERVER WITH KEY: ', this.hashKey, key);
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }
  //! otherwise
  const result = await exec.apply(this, arguments);
  client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  //! not retroactive
  //* means this expire will work for future post
  console.log('FROM MONGODB');
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
