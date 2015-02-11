'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Mailmanager = new Module('mailmanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Mailmanager.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Mailmanager.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Mailmanager.menus.add({
    title: 'Mail Manager',
    link: 'mailmanager page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Mailmanager.aggregateAsset('css', 'mailmanager.css');
  Mailmanager.angularDependencies(['cgBusy']);
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Mailmanager.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Mailmanager.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Mailmanager.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Mailmanager;
});
