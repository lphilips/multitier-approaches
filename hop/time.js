/* Aux functions for time */

var later = require("later");
later.date.localTime();


function happenedInPast(date) {
    var now = new Date().getTime();
    return date < now;
}

function addMinutes(date, minutes) {
    var ms = date.getTime();
    return new Date(ms + minutes * 60000);
}

function calculateNext(timeDescription) {
    var parsed = later.parse.text(timeDescription);
    var s = later.schedule(parsed);
    var next = s.next(1);
    return new Date(next);
}

function calculatePrevious(timeDescription) {
    var parsed = later.parse.text(timeDescription);
    var s = later.schedule(parsed);
    var next = s.prev(1);
    return new Date(next);
}

function happenedToday(date1, date2) {
    var year1 = date1.getFullYear();
    var year2 = date2.getFullYear();
    var month2 = date2.getMonth();
    var month1 = date1.getMonth();
    var day1 = date1.getDay();
    var day2 = date2.getDay();
    return year1 == year2 && month1 == month2 && day1 == day2;
}

function isValidTimeDescr (descr) {
    var sched = later.parse.text(descr);
    // no error => -1
    return sched.error === -1;
}

exports.happenedInPast = happenedInPast;
exports.addMinutes = addMinutes;
exports.calculateNext = calculateNext;
exports.calculatePrevious = calculatePrevious;
exports.happenedToday = happenedToday;
exports.isValidTimeDescr = isValidTimeDescr;