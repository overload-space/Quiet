var esprima = require('esprima');
console.log(JSON.stringify(esprima.tokenize('var answer = 42'), null, 4));