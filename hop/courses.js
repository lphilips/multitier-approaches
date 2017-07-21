var fs = require("fs");
var later = require("later");
var time = require("./time.js");

var courses = [];


function Course(title, duration, time) {
    this.title = title;
    this.duration = duration;
    this.time = time;
}

function getCoursesCalendar () {
    var schedule = [];
    courses.forEach(function (course) {
        var nextDate = time.calculateNext(course.time);
        var prevDate = time.calculatePrevious(course.time);
        var endNextDate = time.addMinutes(nextDate, course.duration);
        var endPrevDate = time.addMinutes(prevDate, course.duration);
        var next = {title: course.title, start: nextDate.getTime(), end: endNextDate.getTime(), class: "event-info"};
        var prev = {title: course.title, start: prevDate.getTime(), end: endPrevDate.getTime(), class: "event-info"};
        schedule.push(next);
        schedule.push(prev);
    })
    return schedule;
}

var dataCourses = fs.readFileSync('data.json');
var coursesJSON = JSON.parse(dataCourses);
coursesJSON.forEach(function (json) {
    if (!time.isValidTimeDescr(json.time))
        throw new Error('Wrong time description in course');
    courses.push(new Course(json.title, json.duration, json.time));
});

exports.getCoursesCalendar = getCoursesCalendar;