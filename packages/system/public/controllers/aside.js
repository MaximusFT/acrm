'use strict';

angular.module('mean.system').controller('AsideController', ['$scope', '$rootScope', '$cookies', '$http', '$log', 'Global', 'Menus',
    function($scope, $rootScope, $cookies, $http, $log, Global, Menus) {
        $scope.global = Global;
        $scope.menus = {};
        $scope.isActive = [];

        if (!$scope.global.mode)
            $scope.global.mode = $cookies.mode;

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function(menu) {
                $scope.menus[name] = menu;
            });
        }

        // Query server for menus and check permissions
        queryMenu('main', defaultMainMenu);

        $rootScope.$on('loggedin', function() {

            queryMenu('main', defaultMainMenu);

            $scope.global = {
                authenticated: !!$rootScope.user,
                user: $rootScope.user,
                mode: $cookies.mode
            };
        });

        $http.get('/api/isFeatures').success(function(response) {
            $scope.isFeatures = response.isFeatures;
        });

        $http.get('/api/isAdmin').success(function(response) {
            $scope.isAdmin = response.isAdmin;
        });

        $scope.toogleOpenable = function(index) {
            $scope.isActive[index === 1 ? 0 : 1] = false;
            $scope.isActive[index] = !$scope.isActive[index];
        };
    }
]);
