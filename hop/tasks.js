var time = require("./time.js");

var id = 1;
var activityToday = 0;
var latestUpdate = false;
var tasks = [];

function Task(title, priority) {
    this.id = id++;
    this.title = title;
    this.status = -1;
    this.priority = priority;
}

function updateActivity () {
    var now = new Date();
    if (latestUpdate) {
        if (time.happenedToday(latestUpdate, now)) {
            activityToday = activityToday + 1;
            latestUpdate = now;
        } else {
            activityToday = 1;
            latestUpdate = now;
        }
    } else {
        latestUpdate = now;
        activityToday = activityToday + 1;
    }
}

function TASKBADGE(attributes, n1) {
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


/* Services */

service nextStatus (task) {
    var task = tasks.find(function (t) {return t.id == task.id});
    if (task && task.status < 1) {
        task.status = task.status + 1;
    }
    updateActivity()
}

service addTask(name, priority) {
    tasks.push(new Task(name, priority));
}

service getTasks() {
    var tks = [];
    tasks.forEach(function (task) {
        var liClass = task.status < 1 ? "timeline-inverted" : "";
        var item = <li class=${liClass}>
        <TASKBADGE status=${task.status}></TASKBADGE>
        <div class="timeline-panel">
            <div class="timeline-heading">
            <h4 class="timeline-title"> ${task.title} </h4>
            </div>
            <div class="timeline-body">
            <button class="btn btn-info btn-sm" onclick=~{
                ${nextStatus}(${task}).post(function (res) {
                    tasks()}, function (e) {console.log(e)})}>
        <i class="glyphicon glyphicon-check"/>
            </button>
            </div></div> </li>;
        tks.push(item);
    })
    return tks;
}

service getTaskProgress() {
    var todo = 0;
    var finished = 0;
    var inprogress = 0;
    tasks.forEach(function (task) {
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
    return [todo, finished, inprogress];
}


service getTaskActivity () {
    if (activityToday > 1)
        return <h4> You updated ${activityToday} tasks today! Quite the buse bee! Ehm, unicorn!</h4>;
else
    return <h4> You updated ${activityToday} tasks today! You may have stopped believing in unicorns, but they never stopped believing in you!</h4>;

}

/* Setup */
tasks.push(new Task("learn uni-corn!", 10));


/* Export of services */
getTaskActivity.path = "/hop/getTaskActivity";
getTaskProgress.path = "/hop/getTaskProgress";
getTasks.path = "/hop/getTasks";
addTask.path = "/hop/addTask";
nextStatus.path = "/hop/nextTask";