/* Run with: hop -v -g hello.js */

/* Find not defined on array prototype, add it manually */

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

var time = require("./time.js");
var tasks = require("./tasks.js");
var meetings = require("./meetings.js");
var courses = require("./courses.js");

/* Services */

service getTasks();
service addTask();
service nextStatus();
service getTaskProgress();
service getTaskActivity();

service getMeetings();
service addMeeting();
service editMeeting();
service getMeetingProgress();


service getCalendar() {
    var schedule = meetings.getMeetingsCalendar();
    schedule = schedule.concat(courses.getCoursesCalendar());
    return schedule;
}

/*module= ${[  => errors
 home.resource("tmpls/events-list.html"),
 home.resource("tmpls/week-days.html"),
 home.resource("tmpls/month-day.html"),
 home.resource("tmpls/year-month.html"),
 home.resource("tmpls/day.html"),
 home.resource("tmpls/month.html"),
 home.resource("tmpls/year.html"),
 home.resource("tmpls/modal.html"),
 home.resource("tmpls/week.html")]}
 */

service home() {
    return <html>
    <head title="Progress app"
          css=${[home.resource( "css/bootstrap.min.css"),
              home.resource( "css/bootstrap-theme.min.css"),
            home.resource( "css/font-awesome.min.css"),
            home.resource( "css/animate.css"),
            home.resource( "css/style.css"),
            home.resource( "css/bootstrap-datetimepicker.min.css"),
            "http://fonts.googleapis.com/css?family=Lobster"]}
         jscript=${["http://code.jquery.com/jquery-1.10.2.js",//home.resource("js/jquery-3.1.1.min.js"),
            home.resource("js/moment.js"),
            home.resource("js/later.min.js"),
            home.resource("js/transition.js"),
            home.resource("js/filesaver.js"),
            home.resource("js/collapse.js"),
            home.resource("js/bootstrap.min.js"),
            home.resource("js/bootstrap-datetimepicker.js"),
            home.resource("js/jquery.appear.js"),
            home.resource("js/jqBootstrapValidation.js"),
            home.resource("js/modernizr.custom.js"),
            home.resource("js/highcharts.js"),
            home.resource("js/highcharts-3d.js"),
            home.resource("js/highcharts-more.js"),
            home.resource("js/underscore-min.js"),
            home.resource("js/calendar.js")
            ]}
             />
    ~{
        function tasks() {
                ${getTasks}()
                    .post(function (tasks) {
                        document.getElementById("taskslist").innerHTML = '';
                        tasks.forEach(function (task) {
                            document.getElementById("taskslist").appendChild(task);
                        })
                    }, function (e) {console.log(e)})
        }
        function fillInMeeting(meeting) {
            document.getElementById("meetingTitle").value = meeting.title;
            document.getElementById("meetingTitle").editing = meeting.id;
            document.getElementById("meeting-start").value = new Date(meeting.start);
            document.getElementById("meeting-description").value = meeting.notes;
        }
        function meetings() {
            ${getMeetings}()
                .post(function (meetings) {
                    document.getElementById("meetingslist").innerHTML = '';
                    meetings.forEach(function (meeting) {
                        document.getElementById("meetingslist").appendChild(meeting);
                    })
                }, function (e) {console.log(e)})
        }
        function graphs() {
            ${getTaskActivity}()
                .post(function (activityToday) {
                    document.getElementById("tasksToday").innerHTML = '';
                    document.getElementById("tasksToday").appendChild(activityToday);
                }, function (e) {console.log(e)})
            ${getTaskProgress}()
                .post(function (stats) {
                    var todo = {name: 'to start', y: stats[0]};
                    var finished = {name: 'finished', y: stats[1]};
                    var inprogress = {name: 'in progress', y: stats[2]};
                    var chart = {
                        chart: {type: 'pie', options3d: {
                            enabled: true,
                            alpha: 45
                        }},
                        title: {text: 'Tasks'},
                        plotOptions: { pie: { innerSize: 100, depth: 45 }},
                        colors: ['#249AA7', '#ABD25E', '#F1594A', '#F8C830'],
                        series: [{
                            name: 'Tasks',
                            data: [finished, todo, inprogress]
                        }]
                    }
                    $("#chartscontainer").highcharts(chart);
                }, function (e) {console.log(e)});
            ${getMeetingProgress}()
                .post(function (months) {
                    var options = Highcharts.getOptions();
                    var chart =  {
                        chart: {type:'column', options3d: {enabled:true, alpha:10, beta:25, depth:70} },
                        title: {text: 'Meetings this year'},
                        colors: ['#249AA7', '#ABD25E', '#F1594A', '#F8C830'],
                        plotOptions: {column: {depth: 25}},
                        xAxis: {categories: options.lang.shortMonths},
                        yAxis: { title: { text: null}},
                        series: [{
                            name: 'Meetings',
                            data: months
                        }]
                    };
                    $("#chartmeetingcontainer").highcharts(chart);
                }, function (e) {console.log(e)})
        }
        function calendar() {
            ${getCalendar}()
                .post(function (schedule) {
                    var calendar = $("#calendar").calendar({
                        tmpl_path : "tmpls/",
                        view : "week",
                        events_source: schedule
                    });
                    calendar.view();
                }, function (e) {console.log(e)})
        }
    }
        <body>
            <section class="text-center" id="logo-section">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="logo text-center">
                                <h1>Uni-corn</h1>
                                <span>Managing your uni-versity career</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div class="mainbody-section text-center">
                <div class="container">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="menu-item blue">
                                <a href="#calendar-modal" data-toggle="modal" onclick=~{calendar()}>
                                    <i class="fa fa-calendar"></i>
                                    <p>Schedule</p>
                                </a>
                            </div>
                            <div class="menu-item green">
                                <a href="#tasks-modal" data-toggle="modal" onclick=~{tasks()}>
                                    <i class="fa fa-tasks"></i>
                                        <p>Tasks</p>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">

                            <img src=${home.resource("images/unicorn.png")} class="img-responsive">
                        </div>
                        <div class="col-md-3">
                            <div class="menu-item light-red">
                                <a href="#meetings-modal" data-toggle="modal" onclick=~{meetings()}>
                                    <i class="fa fa-envelope-o"></i>
                                    <p>Meetings</p>
                                </a>
                            </div>
                            <div class="menu-item color">
                                <a href="#progress-modal" data-toggle="modal" onclick=~{graphs()}>
                                    <i class="fa fa-pie-chart"></i>
                                    <p>Progress</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <div class="section-modal modal fade" tab-index="-1" role="dialog" aria-hidden="true" id="calendar-modal">
            <div class="modal-content">
                <div class="close-modal" data-dismiss="modal">
                    <div class="lr">
                        <div class="rl"></div>
                    </div>
                    </div>
                    <div class="container">
                        <div class="row">
                            <div class="section-title text-center">
                                <h3>Your Awesome Calendar</h3>
                                <p>Always be yourself. Unless you can be a unicorn, then always be a unicorn.</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="pull-right form-inline">
                                <div class="btn-group">
                                    <button class="btn btn-warning" data-calendar-view="year">Year</button>
                                    <button class="btn btn-warning" data-calendar-view="month">Month</button>
                                    <button class="btn btn-warning active" data-calendar-view="week">Week</button>
                                    <button class="btn btn-warning" data-calendar-view="day">Day</button>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="row">
                                <div id="calendar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        <div class="section-modal modal fade" tab-index="-1" role="dialog" aria-hidden="true" id="tasks-modal">
            <div class="modal-content">
                <div class="close-modal" data-dismiss="modal">
                    <div class="lr">
                        <div class="rl"></div>
                    </div>
                </div>
                <div class="container">
                    <div class="row">
                        <div class="section-title text-center">
                            <h3>Tasks</h3>
                            <p>Being a person is getting too complicated. Time to be a unicorn.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-8">
                            <ul id="taskslist" class="timeline">
                            </ul>
                        </div>
                        <div class="col-md-4">
                            <a class="btn btn-default">
                                <span class="glyphicon glyphicon-pencil"></span>
                            </a>
                            <div class="form-horizontal" id="task-form">
                                <div class="form-group">
                                    <label for="task-title" class="control-label sr-only">Title</label>
                                    <div class="col-sm-10">
                                        <input id="taskTitle" value="" class="form-control" placeholder="Title">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="taskPriority" class="control-label sr-only">Priority</label>
                                    <div class="col-sm-10">
                                        <input id="taskPrior" value="" class="form-control" placeholder="Priority (0-...)">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-offset-2 col-sm-10">
                                        <button class="btn btn-success" id="send" onclick=~{
                                            var title = document.getElementById("taskTitle").value;
                                            var priority = document.getElementById("taskPrior").value;
                                            ${addTask}(title, priority).post(function (res) {
                                                tasks();
                                            }, function (e) {console.log(e)})
                                              }>
                                            <i class="glyphicon glyphicon-floppy-disk"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-modal modal fade" tab-index="-1" role="dialog" aria-hidden="true" id="meetings-modal">
            <div class="modal-content">
                <div class="close-modal" data-dismiss="modal">
                    <div class="lr">
                        <div class="rl"></div>
                    </div>
                </div>
            <div class="container">
                <div class="row">
                    <div class="section-title text-center">
                        <h3>Meetings</h3>
                        <p>Everything is better with a unicorn</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-8">
                        <ul id="meetingslist" class="timeline"> </ul>
                    </div>
                    <div class="col-md-4">
                        <a class="btn btn-default">
                            <span class="glyphicon glyphicon-pencil"></span>
                        </a>
                        <div class="form-horizontal" id="meeting-form">
                            <div class="form-group">
                                <label for="meeting-title" class="control-label sr-only">Title</label>
                                <div class="col-sm-10">
                                    <input id="meetingTitle" value="" class="form-control" placeholder="Title">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group date col-sm-8" style="padding-left:15px" id="meeting-starttime">
                                    <input type="text" class="form-control" value="" id="meeting-start">
                                    <span class="input-group-addon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="meeting-description" class="control-label sr-only">Notes</label>
                                <div class="col-sm-10">
                                    <textarea class="form-control" rows="3" value="" id="meeting-description"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-2 col-sm-10">
                                    <button class="btn btn-success" id="send" onclick=~{
                                        var title = document.getElementById("meetingTitle").value;
                                        var date = document.getElementById("meeting-start").value;
                                        var notes = document.getElementById("meeting-description").value;
                                        var id = document.getElementById("meetingTitle").editing;
                                        if (id) {
                                            ${editMeeting}(id, title, notes, date)
                                                .post(function (res) {
                                                    document.getElementById("meetingTitle").editing = false;
                                                    meetings();
                                                }, function (e) {console.log(e)})
                                        } else {
                                            ${addMeeting}
                                            (title, notes, new Date(date)).post(function (res) {
                                                meetings();
                                            }, function (e) {console.log(e)})
                                        }
                                        document.getElementById("meetingTitle").value = '';
                                        document.getElementById("meeting-start").value = '';
                                        document.getElementById("meeting-description").value = '';
                                        }>
                                        <i class="glyphicon glyphicon-floppy-disk"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
        <div class="section-modal modal fade" tab-index="-1" role="dialog" aria-hidden="true" id="progress-modal">
            <div class="modal-content">
                <div class="close-modal" data-dismiss="modal">
                    <div class="lr">
                        <div class="rl"></div>
                    </div>
                </div>
                <div class="container">
                    <div class="row">
                        <div class="section-title text-center">
                            <h3>Progress</h3>
                            <p>If someone says you're not a unicorn don't talk to them. You do not need that kind of negativity in your life.</p>
                        </div>
                    </div>
                    <div class="row">
                    <div id="tasksToday" class="text-center col-md-4 col-md-offset-4"> </div>
                    <div class="col-md-5" id="chartscontainer"></div>
                        <div class="col-md-5" id="chartmeetingcontainer"></div>
                    </div>
                </div>
            </div>
        </div>
            ~{
                $(function () {
                    $('#meeting-starttime').datetimepicker();
                });
            }
     </body>
  </html>
}