/*
    Purpose:
    1. to provide a singleton wrapper for redis. Redis by default creates a new instance for each require.
    2. methods are essentially calling redisClient methods
*/
const redis = require('redis');
const redisClient = redis.createClient();

function set(key, value, callback){
    redisClient.set(key, value, function(err, result){
        if(err){
            console.log(err);
            return;
        }else{
            callback(result);
        }
    });
}

function get(key, callback){
    redisClient.get(key, function(err, result){
        if(err) {
            console.log(err);
            return;
        }else{
            callback(result);
        }
    });
}

function expire(key, timeInSeconds){
    redisClient.expire(key, timeInSeconds);
}

function del(key, callback) {
    redisClient.del(key, function(err, result){
        if(err) {
            console.log(err);
            return;
        }else{
            callback(result);
        }
    });
}

function quit(){
    redisClient.quit();
}

module.exports = {
    get: get,
    set: set,
    expire: expire,
    del: del,
    quit: quit,
    redisPrint: redis.print
}