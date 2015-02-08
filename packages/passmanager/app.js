'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Passmanager = new Module('passmanager');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Passmanager.register(function (app, auth, database) {

	//We enable routing. By default the Package Object is passed to the routes
	Passmanager.routes(app, auth, database);

	//We are adding a link to the main menu for all authenticated users
	Passmanager.menus.add({
		title : 'Passwords manager',
		link : 'passwords manager page',
		roles : ['admin', 'manager'],
		menu : 'main'
	});

	/**
	//Uncomment to use. Requires meanio@0.3.7 or above
	// Save settings with callback
	// Use this for saving data from administration pages
	Passmanager.settings({
	'someSetting': 'some value'
	}, function(err, settings) {
	//you now have the settings object
	});

	// Another save settings example this time with no callback
	// This writes over the last settings.
	Passmanager.settings({
	'anotherSettings': 'some value'
	});

	// Get settings. Retrieves latest saved settigns
	Passmanager.settings(function(err, settings) {
	//you now have the settings object
	});
	 */

	Passmanager.angularDependencies(['ui.bootstrap', 'cgBusy', 'ngClipboard']);
	// Aggregate css
	Passmanager.aggregateAsset('css', 'angular-busy.min.css');
	// Aggregate js
	Passmanager.aggregateAsset('js', '../lib/angular-busy/dist/angular-busy.min.js', {
		weight : 4,
		absolute : false
	});

	return Passmanager;
});
