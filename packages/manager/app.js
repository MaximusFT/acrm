'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Manager = new Module('manager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Manager.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Manager.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Manager.menus.add({
    title: 'Password Management',
    link: 'manager example page',
    roles: ['admin', 'manager'],
    menu: 'main'
  });

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Manager.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Manager.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Manager.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Manager;
});
