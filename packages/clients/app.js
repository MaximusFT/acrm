'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Clients = new Module('clients');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Clients.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Clients.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Clients.menus.add({
        title: 'Clients',
        link: 'clients manager page',
        roles: ['admin'],
        menu: 'main'
    });

    Clients.angularDependencies(['ngClipboard']);

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Clients.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Clients.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Clients.settings(function(err, settings) {
          //you now have the settings object
      });
      */

    return Clients;
});
