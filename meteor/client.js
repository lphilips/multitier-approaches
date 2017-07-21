import { Template } from 'meteor/templating';
var Highcharts = require('highcharts');
import { ReactiveVar } from 'meteor/reactive-var';
import './imports/charts.js';




import './main.html';

Courses = new Mongo.Collection("courses");
Tasks = new Mongo.Collection("tasks");
Meetings = new Mongo.Collection("meetings");

var activityToday = 0;
var latestUpdate = false;

later.date.localTime();

function Task(title, priority) {
    this.title = title;
    this.status = -1;
    this.priority = priority;
}

function Meeting(title, notes, time) {
    this.title = title;
    this.notes = notes;
    this.start = new Date(time);
    this.end = addMinutes(new Date(time), 120);
}

function isValidTimeDescr (descr) {
    var sched = later.parse.text(descr);
    // no error => -1
    return sched.error === -1;
}

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


function updateActivity () {
    var now = new Date();
    if (latestUpdate) {
        if (happenedToday(latestUpdate, now)) {
            latestUpdate = now;
            return true;
        } else {
            latestUpdate = now;
            return false;
        }
    } else {
        latestUpdate = now;
        return true;
    }
}

function processMeetingMonths () {
    var currYear = new Date().getFullYear();
    var months = [0,0,0,0,0,0,0,0,0,0,0,0];
    Meetings.find().fetch().forEach(function (meeting) {
        var date = new Date(meeting.start);
        var month = date.getMonth();
        var year = date.getFullYear();
        if (year == currYear)
            months[month] = months[month] + 1;
    });
    return months;
}


function processTasksStatus () {
    var todo = 0;
    var finished = 0;
    var inprogress = 0;
    Tasks.find().fetch().forEach(function (task) {
        if (task.status < 0) {
            todo++;
        }
        else if (task.status > 0) {
            finished++;
        }
        else {
            inprogress++;
        }
    });
    return [todo, finished, inprogress]
}

function createMonthChart  () {
    var options = Highcharts.getOptions();
    var months = processMeetingMonths();
    var chart = {
        chart: {type: 'column', options3d: {enabled: true, alpha: 10, beta: 25, depth: 70}},
        title: {text: 'Meetings this year'},
        colors: ['#249AA7', '#ABD25E', '#F1594A', '#F8C830'],
        plotOptions: {column: {depth: 25}},
        xAxis: {categories: options.lang.shortMonths},
        yAxis: {title: {text: null}},
        series: [{
            name: 'Meetings',
            data: months
        }]
    };
    $("#chartmeetingcontainer").highcharts(chart);
}

function createPieChart () {
        var stats = processTasksStatus();
        var todo = {name: 'to start', y: stats[0]};
        var finished = {name: 'finished', y: stats[1]};
        var inprogress = {name: 'in progress', y: stats[2]};
        Meteor.defer(function () {
            var chart = {
                chart: {
                    type: 'pie', options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                title: {text: 'Tasks'},
                plotOptions: {pie: {innerSize: 100, depth: 45}},
                colors: ['#249AA7', '#ABD25E', '#F1594A', '#F8C830'],
                series: [{
                    name: 'Tasks',
                    data: [finished, todo, inprogress]
                }]
            }

            $("#chartscontainer").highcharts(chart);
        })
}

Template.start.onCreated(function () {
    this.activityToday = new ReactiveVar(0);
})

Template.start.helpers({
    tasks: function () {
        return Tasks.find()
    },
    taskbadgetype : function (status) {
      if (status == 0) {
          return "warning";
      } else if (status == -1) {
          return "danger";
      } else {
          return "info"
      }
    },
    taskicontype: function (status) {
        if (status == 0) {
            return "glyphicon-edit";
        } else if (status == -1) {
            return "glyphicon-road";
        } else {
            return "glyphicon-check"
        }
    },
    taskliclass: function (status) {
        if (status < 1)
            return "timeline-inverted";
        else
            return "";
    },
    meetings: function () {
        return Meetings.find();
    },
    meetingliclass : function (date) {
        if (happenedInPast(date))
            return "timeline-inverted";
        else
            return "";
    },
    meetingicontype : function (date) {
        if (happenedInPast(date))
            return "glyphicon-check";
        else
            return "glyphicon-road";
    },
    meetingbadgetype: function (date) {
        if (happenedInPast(date))
            return "info";
        else
            return "danger";
    },
    tasksUpdate: function () {
        var nr = Template.instance().activityToday.get();
        if (nr > 1)
            return "You updated " + nr + " tasks today! Quite the busy bee! Ehm, unicorn!";
        else
            return "You updated " + nr + " tasks today. You may have stopped believing in unicorns, but they never stopped believing in you!";
    },
    progressMonths: function () {
        createMonthChart()
    },
    progressTasks : function () {
       createPieChart()
    }
})


Template.start.events({
    'click #editTask' : function (event, template) {
        let id = this._id;
        let task = Tasks.findOne({_id: id});
        let status = task.status < 1 ? task.status + 1 : task.status;
        var nr = template.activityToday.get();
        Tasks.update(id, {$set: {status : status }});
        if (updateActivity())
            template.activityToday.set(nr+1);
        else
            template.activityToday.set(1);


    },
    'click #addTask' : function (event) {
        let taskTitle = $("#taskTitle").val();
        let taskPrior = $("#taskPriority").val();
        Tasks.insert(new Task(taskTitle, taskPrior));
    },
    'click #editMeeting': function (event) {
        var meeting = Meetings.findOne({_id: this._id});

        if (meeting) {
            $("#meetingTitle").val(meeting.title);
            $("#meetingTitle").attr("editing", this._id);
            $("#meetingStart").val(meeting.start);
            $("#meetingDescription").val(meeting.notes);
        }
    },
    'click #addMeeting': function (event) {
        var id = $("#meetingTitle").attr("editing");
        var title = $("#meetingTitle").val();
        var start = $("#meetingStart").val();
        var notes = $("#meetingDescription").val();
        var meeting;
        if (id && id !== "false") {
            meeting = new Meeting(title, notes, start);
            Meetings.update(meeting._id, {$set: meeting});
            $("#meetingTitle").attr("editing", false);
        } else {
            Meetings.insert(new Meeting(title, notes, start));
        }
        $("#meetingTitle").val("");
        $("#meetingStart").val("");
        $("#meetingDescription").val("");
    }
});

Template.start.onRendered(function () {
    $('#meeting-starttime').datetimepicker();

    Tracker.autorun(function () {
        var schedule = [];
        Meetings.find().fetch().forEach(function (appointment) {
            schedule.push({
                title: appointment.title,
                start: appointment.start.getTime(),
                end: appointment.end.getTime(),
                class: "event-info"
            })
        });
        Courses.find().fetch().forEach(function (course) {
            var nextDate = calculateNext(course.time);
            var prevDate = calculatePrevious(course.time);
            var endNextDate = addMinutes(nextDate, course.duration);
            var endPrevDate = addMinutes(prevDate, course.duration);
            var next = {
                title: course.title,
                start: nextDate.getTime(),
                end: endNextDate.getTime(),
                class: "event-info"
            };
            var prev = {
                title: course.title,
                start: prevDate.getTime(),
                end: endPrevDate.getTime(),
                class: "event-info"
            };
            schedule.push(next);
            schedule.push(prev);
        });
        $("#calendar").calendar(
            {
                tmpl_path: "tmpls/",
                view: 'week',
                events_source: schedule
            });

        createMonthChart();
        createPieChart();
    });


    $('.btn-group button[data-calendar-view]').each(function() {
        var $this = $(this);
        $this.click(function () {
            calendar.view($this.data('calendar-view'));
        })
    });

})