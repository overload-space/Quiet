var escope = require('escope');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');
var globalVar = require('./globalVar');


/* Functions :
    code2Tree,
    writeFile,
    tree2Code
   deal with input and output */
function code2Tree () {
    globalVar.file = fs.readFileSync(globalVar.inputlPath, 'utf-8').toString();
    var parseTree = esprima.parse(globalVar.file, { loc : true, range : true });
    globalVar.parseTree = parseTree;
}

function writeFile(parseTree) {
    var output = JSON.stringify(parseTree);
    console.log(output);
    fs.writeFile(globalVar.outputJSONPath, output);
}

function sliceFile(globalRange) {
    var file = globalVar.file;
    var needSub = 0;
    for (var i in globalRange) {
        globalRange[i][0] -= needSub;
        globalRange[i][1] -= needSub;
        file = file.slice(0, globalRange[i][0]) + file.slice(globalRange[i][1]);
        needSub += globalRange[i][1] - globalRange[i][0];
    }
    fs.writeFile(globalVar.outputPath, file);
}


/* Functions :
    getScope,
    markScope,
    getThrough,
 */
// First, locate the function you want
function getScope(parseTree, scopeManager, nodeName, globalRange, references) {
    estraverse.traverse(parseTree, {
        enter: function (node, parent) {
            var currentScope = scopeManager.acquire(node);
            if (currentScope !== null && 'FunctionDeclaration' === node.type && node.id.name === nodeName) {
                markScope(currentScope.block.range, globalRange);
                getThrough(currentScope, references)
            }
        },
        leave: function (node, parent) {

        }
    });
}

// delete each part need keep from the globalRange(need delete)
function markScope(range, globalRange) {
    var newStart = range[0];
    var newEnd = range[1];
    for (var i in globalRange) {
        var start = globalRange[i][0];
        var end = globalRange[i][1];
        if (newEnd <= start || newStart >= end) {

        } else if (newStart <= start && newEnd < end) {
            globalRange[i] = [newEnd, end];
        } else if (newStart <= start && newEnd >= end) {
            globalRange.splice(i, 1);
        } else if (newStart < end && newEnd < end) {
            globalRange[i] = [newEnd, end];
            globalRange.splice(i, 0, [start, newStart])
        } else if (newStart < end && newEnd >= end) {
            globalRange[i] = [start, newStart];
        }
    }
}

function getThrough(currentScope, references) {
    for (var i in currentScope.through) {
        var resolved = currentScope.through[i].resolved;
        if (resolved !== undefined) {
            var def = resolved.defs[0];
            if (def.type === 'Variable') {
                references.varRef.add(resolved);
            } else if (def.type === 'FunctionName') {
                references.funcRef.add(resolved);
            }
        }

    }
}

/* Iteration, until find all references
 */
function iteration(references, globalRange) {
    references.funcRef.forEach(function (elem, index, self) {
        for (var i in elem.defs) {
            markScope(elem.defs[i].node.range, globalRange);
        }
        for (var j in elem.references) {
            var reference = elem.references[j];
            var needRange = reference.from.block.range;
            if (reference.from.type === 'block') {
                needRange = reference.from.upper.block.range;
            }
            markScope(needRange, globalRange);
            references.funcRef.add(reference.resolved);
        }
    });
    references.varRef.forEach(function (elem, index, self) {
        for (var i in elem.defs) {
            markScope(elem.defs[i].parent.range, globalRange);
        }
        for (var j in elem.references) {
            var reference = elem.references[j];
            var needRange = reference.from.block.range;
            if (reference.from.type === 'block') {
                needRange = reference.from.upper.block.range;
            }
            if (reference.from !== elem.scope) {
                markScope(needRange, globalRange);
                references.funcRef.add(reference.resolved);
            }
            var id = reference.identifier;
            estraverse.traverse(globalVar.parseTree, {
                leave: function (node, parent) {
                    if (node.isAssignmentExpr) {
                        console.log(parent);
                        markScope(parent.range, globalRange);
                    }
                    if (node.isMemberExpr) {
                        //console.log(parent);
                        parent.isAssignmentExpr = true;
                        //markScope(parent.range, globalRange);
                    }
                    if (node === id) {
                        if (parent.type === 'MemberExpression') {
                            parent.isMemberExpr = true;
                        } else {
                            //console.log(parent);
                            markScope(parent.range, globalRange);
                        }
                    }
                }
            })
        }
    });
}

var main = function () {
    code2Tree();
    var globalRange = [globalVar.parseTree.range];
    var scopeManager = escope.analyze(globalVar.parseTree);
    var references = {
        varRef: new Set(),
        funcRef: new Set()
    };
    getScope(globalVar.parseTree, scopeManager, 'childNode', globalRange, references);
    iteration(references, globalRange);
    //console.log(references);
    sliceFile(globalRange);
}();