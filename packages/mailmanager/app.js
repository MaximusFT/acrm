'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Mailmanager = new Module('mailmanager');
Mailmanager.register(function(app, auth, database) {

    Mailmanager.routes(app, auth, database);
    Mailmanager.aggregateAsset('css', 'mailmanager.css');
    Mailmanager.angularDependencies(['cgBusy']);

    return Mailmanager;
});
