'use strict';

angular.module('mean.support').controller('SupportController', ['$scope', 'Global', 'Support',
		function ($scope, Global, Support) {
			$scope.global = Global;
			$scope.package = {
				name : 'support'
			};
		}
	]);

angular.module('mean.support').controller('TicketsController', ['$scope', 'Global', '$http', '$cookies', '$log', 'modalService', 'Tickets',
		function ($scope, Global, $http, $cookies, $log, modalService, Tickets) {
			$scope.global = Global;
			$scope.mode = $cookies.mode;
			$scope.tabs = [{
					type : 0,
					title : 'Requests for access',
					gclass : 'glyphicon glyphicon-exclamation-sign'
				}, {
					type : 1,
					title : 'Ideas and suggestions',
					gclass : 'glyphicon glyphicon-bullhorn'
				}
			];
			$scope.getHttp1 = null;
			$scope.isTicketOpen = [];

			$scope.init = function (t) {
				$scope.getHttp1 = null;
				$scope.tickets = [];
				$scope.getHttp1 = $http.get('api/tickets', {
						params : {
							type : t
						}
					}).success(function (data) {
						//$log.warn(data);
						$scope.tickets = data;
						if (data.length > 0)
							$scope.isTickets = true;
						else
							$scope.isTickets = false;
					}).error(function () {
						$log.error('error');
					});
			};

			$scope.myOpenedTickets = function () {
				$scope.getHttp1 = null;
				$scope.tickets = [];
				$scope.getHttp1 = $http.get('api/myOpenedTickets').success(function (data) {
						$log.warn(data);
						$scope.tickets = data;
						if (data.length > 0)
							$scope.isTickets = true;
						else
							$scope.isTickets = false;
					}).error(function () {
						$log.error('error');
					});
			};

			$scope.openTicket = function (req, t) {
				var ticket = new Tickets({
						type : t,
						subject : req.subject,
						when : new Date().getTime() / 1000,
						correspondence : [{
								role : 'u',
								text : req.text,
								when : new Date().getTime() / 1000
							}

						]
					});
				ticket.$save(function (response) {
					//$log.info(response);
					if (t === 0)
						$scope.isSentRequest = true;
					if (t === 1)
						$scope.isSentIdea = true;
				});
			};

			$scope.formatDate = function (date) {
				var temp = new Date(date * 1000);
				return temp.toLocaleString();
			};

			$scope.reply = function (ticketIndex, answer) {
				if(typeof answer === 'undefined')
					return;
				var temp = answer+'';
				if(temp.trim() === '')
					return;
				var msg = {
					role : $scope.mode === 'Administrator' ? 'a' : 'u',
					text : answer,
					when : new Date().getTime() / 1000
				};
				$http({
					url : '/api/replyTicket',
					method : 'POST',
					data : {
						'ticketId' : $scope.tickets[ticketIndex]._id,
						'answer' : msg
					}
				})
				.then(function (response) {
					$log.info($scope.tickets[ticketIndex]);
					$scope.tickets[ticketIndex].correspondence.splice($scope.tickets[ticketIndex].correspondence.length, 0, msg);
				},
					function (response) {
					$log.error('error');
				});
			};

			$scope.closeTicket = function (id, type) {
				$log.info('close');
			};
		}
	]);
