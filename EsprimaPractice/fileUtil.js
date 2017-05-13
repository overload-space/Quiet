var escope = require('escope');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');
var globalVar = require('./globalVar');

// File In

function code2Tree () {
    globalVar.file = fs.readFileSync(globalVar.inputlPath, 'utf-8').toString();
    var parseTree = esprima.parse(globalVar.file, { loc : true });
    globalVar.parseTree = parseTree;
    //writeFile(parseTree);
}

function writeFile(parseTree) {
    var output = JSON.stringify(parseTree);
    console.log(output);
    fs.writeFile(globalVar.outputJSONPath, output);
}

function Tree2code () {
    var parseTree = escodegen.generate(globalVar.parseTree);
    var output = JSON.stringify(parseTree).toString().replace(/^\"/, "").replace(/\"$/, "").replace(/\\n/g, "");
    console.log(output);
    fs.writeFile(globalVar.outputPath, output);
}



// First, locate the function you want
function getFunction (parseTree, nodeName) {
    var returnNode = {};
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {

        },
        leave: function (node, parent) {
            if ('FunctionDeclaration' === node.type && nodeName === node.id.name) {
                returnNode = node;
                this.break();
            }
        }
    });
    return returnNode;
}

function getDeclareScope(parseTree, nodeName) {
    var scopeManager = escope.analyze(parseTree);
    var currentScope = scopeManager.acquire(parseTree);   // global scope
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {
            currentScope = scopeManager.acquire(node);
            //console.log(currentScope);
            if (currentScope !== null && node.id) {
            }
        },
        leave: function (node, parent) {
            currentScope = scopeManager.acquire(node);
            //console.log(currentScope);
            if (currentScope !== null) {
                if (externalVar.has(node.id.name)) {
                    for (var x in currentScope.references) {
                        if (externalVar.has(currentScope.references[x].identifier.name)) {
                            //console.log(currentScope);
                            externalVar.add(node.id.name);
                            node.keep = true;
                            //keep = true;
                            break;
                        }
                    }
                }
            }
            if (parent !== null && node.hasOwnProperty('keep')) {
                parent.keep = true;
            }
            console.log(externalVar);
        }
    });
}

function getVarParentFunc(parseTree, nodeName) {
    var returnNode = {};
    var found = false;
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {
            if ('VariableDeclarator' === node.type && nodeName === node.id.name) {
                found = true;
                this.skip();
            }
        },
        leave: function (node, parent) {
            if (found && node.type === 'VariableDeclaration') {
                found = false;
                returnNode = parent;
                this.break();
            }
        }
    });
    return returnNode;
}

function getLocalVar(parseTree) {
    var localVar = new Set();
    estraverse.traverse(parseTree, {
        enter: function (node, parent){
            if ('Identifier' === node.type &&
                ('VariableDeclarator' === parent.type ||
                'FunctionDeclaration' === parent.type) &&
                parent.init !== node &&
                parent !== parseTree) {
                localVar.add(node.name);
            }
        },
        leave: function (node, parent) {

        }
    });
    return localVar;
}

// function getCurrentFuncLocalVar(parseTree) {
//     var localVar = new Set();
//     var body = parseTree.body.body;
//     for (state)
//     estraverse.traverse(parseTree, {
//         enter: function (node, parent){
//             if ('Identifier' === node.type &&
//                 ('VariableDeclarator' === parent.type ||
//                 'FunctionDeclaration' === parent.type) &&
//                 parent.init !== node) {
//                 localVar.add(node.name);
//             }
//         },
//         leave: function (node, parent) {
//
//         }
//     });
//     return localVar;
// }

// Second, find the external variables and functions
function getExternalVar (parseTree, externalVar, externalFunc) {
    var localVar = getLocalVar(parseTree);
    //console.log(localVar);
    var params = new Set();
    for (var i in parseTree.params) {
        params.add(parseTree.params[i].name);
    }
    // TODO: deal with MemberExpression
    estraverse.traverse(parseTree, {
        leave: function (node, parent) {
            if ('Identifier' === node.type &&
                !localVar.has(node.name) &&
                !params.has(node.name) &&
                'MemberExpression' !== parent.type) {
                if ((parent.type === 'CallExpression' && parent.callee === node) || parent === parseTree) {
                    externalVar.add(node.name);
                } else {
                    externalVar.add(node.name);
                }
            }
        }
    });
    //console.log(externalVar);
}

function containsVar(parseTree, element) {
    var result = false;
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {
            if (node.name === element) {
                result = true;
                this.break();
            }
        }
    });
    return result;
}

// Third, find all the dependencies
function iteration(parseTree, externalVar, externalFunc) {
    externalVar.forEach(function (elem, index, self) {
        var funcNode = getVarParentFunc(parseTree, elem);
        funcNode.body.forEach(function (p1, p2, p3) {
            if (containsVar(p1, elem)) {
                getExternalVar(p1, externalVar, externalFunc);
            }
        });
        //var localVar = getLocalVar(parseTree);
        //console.log(localVar);
    });

    externalFunc.forEach(function (elem, index, self) {

    });
}

// Forth, delete the irrelevant code
function cutTree(parseTree, externalVar, externalFunc) {
    // var keep = false;
    // var scopeManager = escope.analyze(parseTree);
    // var currentScope = scopeManager.acquire(parseTree);   // global scope
    // estraverse.traverse(parseTree, {
    //     enter: function (node, parent) {
    //         currentScope = scopeManager.acquire(node);
    //         //console.log(currentScope);
    //         if (currentScope !== null) {
    //             //console.log(currentScope);
    //             //var keep = false;
    //             // for (var x in currentScope.references) {
    //             //     if (externalVar.has(currentScope.references[x].identifier.name)) {
    //             //         //console.log(currentScope);
    //             //         externalVar.add(node.name);
    //             //         node.keep = true;
    //             //         //keep = true;
    //             //         break;
    //             //     }
    //             // }
    //             // if (keep) {
    //             //     for (var x in currentScope.variables) {
    //             //         if (externalVar.has(currentScope.variables[x].name)) {
    //             //             //console.log(currentScope);
    //             //             keep = false;
    //             //             break;
    //             //         }
    //             //     }
    //             //     if (keep) {
    //             //         node.keep = true;
    //             //         node.alwaysKeep = true;
    //             //     }
    //             // }
    //         }
    //         // if (parent !== null && parent.hasOwnProperty('keep')) {
    //         //     node.keep = true;
    //         //     node.alwaysKeep = true;
    //         // }
    //     },
    //     leave: function (node, parent) {
    //         currentScope = scopeManager.acquire(node);
    //         //console.log(currentScope);
    //         if (currentScope !== null) {
    //             if (externalVar.has(node.id.name)) {
    //                 for (var x in currentScope.references) {
    //                     if (externalVar.has(currentScope.references[x].identifier.name)) {
    //                         //console.log(currentScope);
    //                         externalVar.add(node.id.name);
    //                         node.keep = true;
    //                         //keep = true;
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //         if (parent !== null && node.hasOwnProperty('keep')) {
    //             parent.keep = true;
    //         }
    //         console.log(externalVar);
    //     }
    // });
    //
    // estraverse.replace(parseTree, {
    //     enter: function (node, parent) {
    //
    //     },
    //     leave: function (node, parent) {
    //         currentScope = scopeManager.acquire(node);
    //         //console.log(currentScope);
    //         if (currentScope !== null) {
    //             if (!node.hasOwnProperty('keep')) {
    //                 this.remove();
    //             }
    //         }
    //     }
    // });
    externalVar.forEach(function (elem, index, self) {
        console.log(elem);
    });
    writeFile(parseTree);
}

var main = function () {
    code2Tree();

    var externalVar = new Set();
    var externalFunc = new Set();
    var funcNode = getFunction(globalVar.parseTree, 'childNode');
    externalFunc.add('childNode');
    getExternalVar(funcNode, externalVar, externalFunc);
    //while (!(externalVar.length === 0 && externalFunc.length === 0)) {
        //iteration(globalVar.parseTree, externalVar, externalFunc);
    //}
    cutTree(globalVar.parseTree, externalVar, externalFunc);


    console.log(externalVar);
    console.log(externalFunc);

    //Tree2code();
    //console.log(globalVar.parseTree);
}();

