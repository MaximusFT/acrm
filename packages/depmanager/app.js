'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Depmanager = new Module('depmanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Depmanager.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Depmanager.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Depmanager.menus.add({
        title: 'Departments manager',
        link: 'departments manager page',
        roles: ['admin'],
        menu: 'main'
    });

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Depmanager.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Depmanager.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Depmanager.settings(function(err, settings) {
          //you now have the settings object
      });
      */
    Depmanager.angularDependencies(['angularBootstrapNavTree', 'ui.select']);
    Depmanager.aggregateAsset('css', 'depmanager.css');

    return Depmanager;
});
