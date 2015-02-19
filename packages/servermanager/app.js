'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Servermanager = new Module('servermanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Servermanager.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Servermanager.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    /*Servermanager.menus.add({
      title: 'servermanager example page',
      link: 'servermanager example page',
      roles: ['authenticated'],
      menu: 'main'
    });*/

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Servermanager.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Servermanager.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Servermanager.settings(function(err, settings) {
          //you now have the settings object
      });
      */
    Servermanager.angularDependencies(['ui.select', 'ngTagsInput', 'cgBusy', 'ngClipboard']);
    Servermanager.aggregateAsset('css', 'servermanager.css');

    return Servermanager;
});
