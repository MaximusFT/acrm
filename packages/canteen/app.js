'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Canteen = new Module('canteen');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Canteen.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Canteen.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    // Canteen.menus.add({
    //   title: 'canteen example page',
    //   link: 'canteen example page',
    //   roles: ['authenticated'],
    //   menu: 'main'
    // });

    Canteen.aggregateAsset('css', 'canteen.css');

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Canteen.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Canteen.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Canteen.settings(function(err, settings) {
          //you now have the settings object
      });
      */

    return Canteen;
});
