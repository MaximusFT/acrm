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
			$scope.onlyOpened = true;
			$scope.onlyMyOpened = true;

			$scope.init = function (t) {
				$scope.getHttp1 = null;
				$scope.tickets = [];
				$scope.isTicketOpen = [];
				var config;
				if ($scope.onlyOpened === false)
					config = {
						type : t,
						status : 1
					};
				if ($scope.onlyOpened === true)
					config = {
						type : t
					};
				$scope.getHttp1 = $http.get('api/tickets', {
						params : config
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
				var config;
				if ($scope.onlyMyOpened === true)
					config = {
						status : 0
					};
				$scope.getHttp1 = $http.get('api/myOpenedTickets', {
						params : config
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

			$scope.openTicket = function (req, t) {
				var ticket = new Tickets({
						type : t,
						subject : req.subject,
						when_opened : new Date().getTime() / 1000,
						status : 0,
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
				if (typeof answer === 'undefined')
					return;
				var temp = answer + '';
				if (temp.trim() === '')
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
					//$log.info($scope.tickets[ticketIndex]);
					$scope.tickets[ticketIndex].correspondence.splice($scope.tickets[ticketIndex].correspondence.length, 0, msg);
				},
					function (response) {
					$log.error('error');
				});
			};

			$scope.refreshTicket = function (ticketIndex) {
				if ($scope.tickets[ticketIndex].status !== 1) {
					$scope.tickets[ticketIndex].isRefreshing = true;
					$scope.getHttp2 = null;
					$scope.getHttp2 = $http.get('api/refreshTicket', {
							params : {
								ticketId : $scope.tickets[ticketIndex]._id,
								count : $scope.tickets[ticketIndex].correspondence.length
							}
						}).success(function (data) {
							//$log.warn(data);
							$scope.tickets[ticketIndex].status = data.status;
							if(data.status === 1)
								$scope.tickets[ticketIndex].when_closed = new Date().getTime() / 1000;
							if (typeof data.msgs === 'undefined') {
								$scope.tickets[ticketIndex].isRefreshing = false;
								return;
							}
							$scope.tickets[ticketIndex].correspondence = $scope.tickets[ticketIndex].correspondence.concat(data.msgs);					
							$scope.tickets[ticketIndex].isRefreshing = false;
						}).error(function () {
							$log.error('error');
						});
				}
			};

			$scope.closeTicket = function (ticketIndex) {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Confirm the action',
					bodyText : 'Are you sure? This would mean that the problem is solved.',
					type : 5
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					if (result === 'ok') {
						$scope.tickets[ticketIndex].when_closed = new Date().getTime() / 1000;
						$http.put('/api/closeTicket', {
							params : {
								ticketId : $scope.tickets[ticketIndex]._id,
								when_closed : $scope.tickets[ticketIndex].when_closed
							}
						})
						.success(function (data, status) {
							//$log.info(data);
							$scope.tickets[ticketIndex].status = 1;
						})
						.error(function (data, status) {
							$log.error(status);
						});
					}
				});
			};

			$scope.changeOnlyOpened = function (t) {
				$scope.onlyOpened = !$scope.onlyOpened;
				$scope.init(t);
			};
			
			$scope.changeOnlyMyOpened = function () {
				$scope.onlyMyOpened = !$scope.onlyMyOpened;
				$scope.myOpenedTickets();
			};
		}
	]);
