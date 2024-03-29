'use strict';

angular.module('mean.passmanager').service('modalService', ['$modal', '$log',
		function ($modal, $log) {

			var modalDefaults = {
				backdrop : true,
				keyboard : true,
				modalFade : true,
				templateUrl : '/passmanager/views/modal.html'
			};

			var modalOptions = {
				closeButtonText : 'Close'
				//actionButtonText : 'OK',
				//headerText : 'Proceed?',
				//bodyText : 'Perform this action?'
			};

			this.showModal = function (customModalDefaults, customModalOptions) {
				if (!customModalDefaults)
					customModalDefaults = {};
				customModalDefaults.backdrop = 'static';
				return this.show(customModalDefaults, customModalOptions);
			};

			this.show = function (customModalDefaults, customModalOptions) {
				//Create temp objects to work with since we're in a singleton service
				var tempModalDefaults = {};
				var tempModalOptions = {};
				//var comment = '';

				//Map angular-ui modal custom defaults to modal defaults defined in service
				angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

				//Map modal.html $scope custom properties to defaults defined in service
				angular.extend(tempModalOptions, modalOptions, customModalOptions);

				if (!tempModalDefaults.controller) {
					tempModalDefaults.controller = function ($scope, $modalInstance) {
						$scope.modalOptions = tempModalOptions;
						$scope.modalOptions.ok = function (com, result) {
							result = com;
							$modalInstance.close(result);
						};
						$scope.modalOptions.close = function (result) {
							$modalInstance.dismiss('cancel');
						};
					};
				}

				return $modal.open(tempModalDefaults).result;
			};

		}
	]);
