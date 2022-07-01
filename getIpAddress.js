// require('dns').lookup(require('os').hostname(), function (err, add, fam) {
//   console.log(add);
// })

var ip = require("ip").address();
console.log(ip);