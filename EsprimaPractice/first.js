var escope = require('escope');
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');

fs.readFile('test.js', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var parseTree = esprima.parse(data.toString(), { loc : true });
    var scopeManager = escope.analyze(parseTree);
    var currentScope = scopeManager.acquire(parseTree);   // global scope
    var notYet = false;
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {

        },
        leave: function (node, parent) {
            if (/Identifier/.test(node.type) && node.name === 'color') {
                console.log("\n\n\n");
                console.log(node);
                console.log("\n\n\n");
            }
            currentScope = scopeManager.acquire(node);
            if (currentScope !== null) {
                for (var x in currentScope.variables) {
                    if (currentScope.variables[x].name === 'color') {
                        console.log(currentScope);
                    }
                }
            }
        }
    });

    // estraverse.traverse(parseTree, {
    //     enter: function(node, parent) {
    //         // do stuff
    //
    //         if (/Function/.test(node.type)) {
    //             currentScope = scopeManager.acquire(node);  // get current function scope
    //         }
    //     },
    //     leave: function(node, parent) {
    //         if (/Function/.test(node.type)) {
    //             currentScope = currentScope.upper;  // set to parent scope
    //         }
    //
    //         // do stuff
    //     }
    //});

    // fs.writeFile('parseTree.json', JSON.stringify(parseTree), function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    // });
});