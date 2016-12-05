var esprima = require('esprima');
var fs = require('fs');

fs.readFile('test.js', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var parseTree = esprima.parse(data.toString(), { loc : true });
    for (var child in parseTree) {

    }

    fs.writeFile('parseTree.json', JSON.stringify(parseTree), function (err) {
        if (err) {
            return console.log(err);
        }
    });
});