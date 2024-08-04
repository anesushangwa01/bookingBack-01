// const crypto = require('crypto');
// const key = crypto.randomBytes(32).toString('base64');
// console.log(key);
// // khuhu


const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);
