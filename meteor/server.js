import { Meteor } from 'meteor/meteor';

const Courses = new Mongo.Collection("courses");
const Tasks = new Mongo.Collection("tasks");
const Meetings = new Mongo.Collection("meetings");


function Task(title, priority) {
    this.title = title;
    this.status = -1;
    this.priority = priority;
}

function Course(title, duration, time) {
    this.title = title;
    this.duration = duration;
    this.time = time;
}

Meteor.startup(() => {
    let nrCourses = Courses.find().count();
    let nrTasks = Tasks.find().count();
    if (nrCourses <= 0) {
        data = JSON.parse(Assets.getText('data.json'));
        data.forEach(function (c) {
            Courses.insert(new Course(c.title, c.duration, c.time))
        })
    }
    if (nrTasks <= 0) {
        Tasks.insert(new Task("Lean uni-corn!", 5))
    }
});
