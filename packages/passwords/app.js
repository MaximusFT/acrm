'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MeanPass = new Module('passwords');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MeanPass.register(function(app, auth, passport, database) {

  //We enable routing. By default the Package Object is passed to the routes
  MeanPass.routes(app, auth, database, passport);

  //We are adding a link to the main menu for all authenticated passwords
  // MeanPass.menus.add({
  //     title: 'MeanPass example page',
  //     link: 'MeanPass example page',
  //     roles: ['authenticated'],
  //     menu: 'main'
  // });

  MeanPass.aggregateAsset('js', 'MeanPass.js');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    MeanPass.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    MeanPass.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    MeanPass.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return MeanPass;
});
