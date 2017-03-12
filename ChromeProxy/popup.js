/**
 * Created by Cloud on 17/3/12.
 */

$(document).ready(function () {
    executeScripts();
});

var injectScripts = [
    "jquery.js",
    "content/events.js"
];

function executeScripts() {
    for (i = 0; i < injectScripts.length; i++) {
        chrome.tabs.executeScript(null, {file: injectScripts[i]});
    }
}