'use strict';

var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.second = [0, 20, 40];

schedule.scheduleJob(rule, function(){
    console.log('The answer to life, the universe, and everything!');
});