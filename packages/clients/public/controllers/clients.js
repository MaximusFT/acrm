'use strict';

angular.module('mean.clients').controller('ClientsController', ['$scope', '$http', '$log', 'Global', 'Clients',
		function ($scope, $http, $log, Global, Clients) {
			$scope.global = Global;
			$scope.package = {
				name : 'clients'
			};

			$scope.webreqSchema = [{
					title : 'Webrequest ID',
					schemaKey : 'webreq_inside_id',
					type : 'text',
					inTable : true
				}, {
					title : 'Date',
					schemaKey : 'creation_date',
					type : 'text',
					inTable : true
				}, {
					title : 'Last name',
					schemaKey : 'lastname',
					type : 'text',
					inTable : true
				}, {
					title : 'First name',
					schemaKey : 'firstname',
					type : 'text',
					inTable : true
				}, {
					title : 'Middle name',
					schemaKey : 'middlename',
					type : 'text',
					inTable : true
				}, {
					title : 'Request type',
					schemaKey : 'webreq_type',
					type : 'text',
					inTable : true
				}, {
					title : 'Office ID',
					schemaKey : 'office_destination',
					type : 'text',
					inTable : true
				}, {
					title : 'Comment',
					schemaKey : 'comment',
					type : 'text',
					inTable : true
				}, {
					title : 'Form',
					schemaKey : 'form_address',
					type : 'text',
					inTable : true
				}, {
					title : 'Referer',
					schemaKey : 'link_source',
					type : 'text',
					inTable : true
				}, {
					title : 'Target page',
					schemaKey : 'target_page',
					type : 'text',
					inTable : true
				}
			];
			
			$scope.init = function () {
				$scope.getHttp1 = null;
				$scope.getHttp1 = $http.get('api/webreqs').success(function (data) {
						$scope.webreqs = data;
						$log.info(data);
					}).error(function () {
						$log.error('error');
					});
			};
		}
	]);
