const crypto = require('crypto');

exports.generateUniqueID = () => {
  const timestamp = Date.now().toString(); 
  const randomBytes = crypto.randomBytes(16).toString('hex');

  const hash = crypto.createHash('sha256').update(timestamp + randomBytes).digest('hex');

  const id = ('0000000000' + (parseInt(hash, 16) % 10000000000)).slice(-10);
   
  return id;
} 


 

