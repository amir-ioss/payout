const crypto = require('crypto');

var secret_key = "d0dd65e69a3a42706cc1453e775739ff7573ba406b23519021d076a143d5751e";
var secret_iv = "d379701e4c041ebbec1bdbf686e1083e";
var ecnryption_method = "aes-256-cbc";

// Generate secret hash with crypto to use for encryption
const key = crypto
  .createHash('sha512')
  .update(secret_key)
  .digest('hex')
  .substring(0, 32)
const encryptionIV = crypto
  .createHash('sha512')
  .update(secret_iv)
  .digest('hex')
  .substring(0, 16)

// Encrypt data
function _encrypt(data) {
  const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV)
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  ).toString('base64') // Encrypts data and converts to hex and base64
}

// Decrypt data
function _decrypt(encryptedData) {
  const buff = Buffer.from(encryptedData, 'base64')
  const decipher = crypto.createDecipheriv(ecnryption_method, key, encryptionIV)
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  ) // Decrypts data and converts to utf8
}

var enc = _encrypt("Hello");
var dec = _decrypt(enc);
console.log(enc, dec);

module.exports = {
    _encrypt,
    _decrypt
};