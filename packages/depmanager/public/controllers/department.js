'use strict';

angular.module('mean.passmanager').controller('DepartmentController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', 'Passwords', 'Users', 'Departments',
		function ($scope, Global, Menus, $rootScope, $http, $log, $stateParams, Passwords, Users, Departments) {
			$scope.global = Global;
			$scope.departmentId = $stateParams.departmentId;
			
			$scope.departmentSchema = [{
					title : 'Name',
					schemaKey : 'name',
					type : 'text',
					inTable : true
				}, {
					title : 'Parent',
					schemaKey : 'parent',
					type : 'text',
					inTable : true
				}, {
					title : 'Left',
					schemaKey : 'left',
					type : 'text',
					inTable : true
				}, {
					title : 'Right',
					schemaKey : 'right',
					type : 'text',
					inTable : true
				}
			];
			$scope.department = {};

			$scope.init = function () {
				$scope.departments = [];
				$http.get('api/getDepartment', {params: {departmentId: $scope.departmentId}
				}).success(function (data) {
					//$log.info(data);
					$scope.departments = [data];
				}).error(function () {
					$log.error('error');
				});
			};

			/*$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						group : $scope.pass.group,
						resourceName : $scope.pass.resourceName,
						resourceUrl : $scope.pass.resourceUrl,
						email : $scope.pass.email,
						login : $scope.pass.login,
						hash_password : $scope.pass.hash_password,
						comment : $scope.pass.comment,
						accessedFor : $scope.pass.accessedFor
					});

				pass.$save(function (response) {
					$scope.passwords.push(response);
				});

				//this.firstName = this.lastName = this.email = this.password = this.role = '';
			};*/

			/*$scope.remove = function (pass) {
				for (var i in $scope.passwords) {
					if ($scope.passwords[i] === pass) {
						$scope.passwords.splice(i, 1);
					}
				}

				pass.$remove();
			};*/

			$scope.update = function (department, departmentField) {
				//pass.$update();
				Departments.update({ departmentId:department._id }, department);
			};
		}
	]);
