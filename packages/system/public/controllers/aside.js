'use strict';

angular.module('mean.system').controller('AsideController', ['$scope', '$rootScope', '$cookies', '$http', '$log', 'Global', 'Menus',
    function($scope, $rootScope, $cookies, $http, $log, Global, Menus) {
        $scope.global = Global;
        $scope.menus = {};

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

        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function() {

            queryMenu('main', defaultMainMenu);

            $scope.global = {
                authenticated: !!$rootScope.user,
                user: $rootScope.user,
                mode: $cookies.mode
            };
        });

        $scope.checkFeatures = function() {
            $http.get('/api/isFeatures').success(function(data) {
                $scope.isFeatures = data.isFeatures;
            });
        };

    }
]);
