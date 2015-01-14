'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Currencymanager = new Module('currencymanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Currencymanager.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Currencymanager.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  /*Currencymanager.menus.add({
    title: 'Currency Manager',
    link: 'currencymanager page',
    roles: ['admin'],
    menu: 'main'
  });*/

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Currencymanager.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Currencymanager.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Currencymanager.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Currencymanager;
});
