'use strict';

angular.module('mean.clients').config(['$stateProvider',
		function ($stateProvider) {
			$stateProvider.state('requests from internet', {
				url : '/requests',
				templateUrl : 'clients/views/index.html'
			})
			.state('webinar clients phones', {
				url : '/manager/phonesForWebinar',
				templateUrl : 'clients/views/phonesForWebinar.html'
			});
		}
	]);
