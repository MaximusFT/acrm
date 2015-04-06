/*global io:false*/
'use strict';

var baseUrl = 'localhost:3000'; //'46.36.217.111:3001';

angular.module('mean.notifications').factory('NotificationSocket', function($rootScope) {
	var socket = io.connect(baseUrl);
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				console.log('event:', eventName);
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});
