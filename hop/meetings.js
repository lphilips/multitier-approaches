var Time = require("./time.js");
var id = 0;
var meetings = [];


function Meeting (title, notes, time) {
    this.id = id++;
    this.title = title;
    this.notes = notes;
    this.start = new Date(time);
    this.end = new Date(Time.addMinutes(new Date(time), 60));
}

function getMeetingsCalendar () {
    var schedule = [];
    meetings.forEach(function (appointment) {
        appointment.class= "event-info";
        schedule.push(appointment);
    });
    return schedule;
}

function MEETINGBADGE(attributes, n1) {
    var status = attributes.status;
    var badgeC = "danger";
    var iconC = "road";
    if (status == 1) {
        iconC = "check";
        badgeC = "info"
    }
    else if (status == 0) {
        iconC = "edit";
        badgeC = "warning";
    }

    var classBadge = "timeline-badge " + badgeC;
    var classIcon = "glyphicon glyphicon-"+iconC;

    return <div class=${classBadge}>
              <i class=${classIcon}/>
        </div>;
}

service addMeeting (title, notes, time) {
    meetings.push(new Meeting(title, notes, time));
}

service editMeeting (id, title, notes, date) {
    var meeting = meetings.find(function (m) {return m.id == id});
    console.log(meeting);
    meeting.title = title;
    meeting.notes = notes;
    meeting.date = date;
}


service getMeetings () {
    var mts = [];
    meetings.forEach(function (meeting) {
        var liClass = "";
        var item = <li class=${liClass}>
        <MEETINGBADGE status=1></TASKBADGE>
            <div class="timeline-panel">
            <div class="timeline-heading">
            <h4 class="timeline-title"> ${meeting.title} </h4>
            </div>
            <div class="timeline-body">
            <button class="btn btn-info btn-sm" onclick=~{fillInMeeting(${meeting})}>
            <i class="glyphicon glyphicon-pencil"/>
            </button>
            </div></div> </li>;
        mts.push(item);
    })
    return mts;
}

service getMeetingProgress () {
    var currYear = new Date().getFullYear();
    var months = [0,0,0,0,0,0,0,0,0,0,0,0];
    meetings.forEach(function (meeting) {
        var date = new Date(meeting.start);
        var month = date.getMonth();
        var year = date.getFullYear();
        if (year == currYear)
            months[month] = months[month] + 1;
    });
    return months;
}

getMeetings.path = "/hop/getMeetings";
addMeeting.path = "/hop/addMeeting";
editMeeting.path = "/hop/editMeeting";
getMeetingProgress.path = "/hop/getMeetingProgress";

exports.getMeetingsCalendar = getMeetingsCalendar;