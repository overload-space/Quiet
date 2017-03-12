/**
 * Created by Cloud on 17/3/12.
 */
element = $('a:contains(CV)');
var events = $(element).data("events");
console.log(events);
// var events = [];
// for (var property in element) {
//     var match = property.match(/^on(.*)/);
//
//     if (match) {
//         events.push(match[1]);
//     }
// }
// console.log(events.join(' '));
// var items = Array.prototype.slice.call(
//     document.querySelectorAll('*')
// ).map(function(element) {
//     var listeners = getEventListeners(element);
//     return {
//         element: element,
//         listeners: Object.keys(listeners).map(function(k) {
//             return { event: k, listeners: listeners[k] };
//         })
//     };
// }).filter(function(item) {
//     return item.listeners.length;
// });