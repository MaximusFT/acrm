'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Usermanager = new Module('usermanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Usermanager.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Usermanager.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  /*Usermanager.menus.add({
    title: 'Users manager',
    link: 'users manager page',
    roles: ['manager', 'employee'],
    menu: 'main'
  });*/

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Usermanager.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Usermanager.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Usermanager.settings(function(err, settings) {
        //you now have the settings object
    });
    */
	
	Usermanager.angularDependencies(['ui.bootstrap', 'cgBusy']);
	// Aggregate css
	Usermanager.aggregateAsset('css', 'angular-busy.min.css');
	// Aggregate js
	Usermanager.aggregateAsset('js', '../lib/angular-busy/dist/angular-busy.min.js', {
		weight : 4,
		absolute : false
	});
	Usermanager.aggregateAsset('js', '../lib/ng-clip/ng-clip.min.js', {
		weight : 4,
		absolute : false
	});
	Usermanager.aggregateAsset('js', '../lib/zeroclipboard/dist/ZeroClipboard.min.js', {
		weight : 4,
		absolute : false
	});	
	
  return Usermanager;
});
