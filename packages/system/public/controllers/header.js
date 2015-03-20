'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', '$cookies', '$http', '$log', 'Global', 'Menus',
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

        $scope.minimizeAside = function() {
            $scope.minimized = !$scope.minimized;
            if (!$scope.minimized) {
                //$log.info('close');
                angular.element('.page-container').removeClass('page-container-wide');
                angular.element('.page-sidebar .x-navigation').removeClass('x-navigation-minimized');
                angular.element('.x-navigation-minimize').find('.fa').removeClass('fa-indent').addClass('fa-dedent');
                //angular.element('.page-sidebar.scroll').mCustomScrollbar('update');
            } else {
                //$log.info('open');
                angular.element('.x-navigation li.active').removeClass('active');
                angular.element('.page-container').addClass('page-container-wide');
                angular.element('.page-sidebar .x-navigation').addClass('x-navigation-minimized');
                angular.element('.x-navigation-minimize').find('.fa').removeClass('fa-dedent').addClass('fa-indent');
                //angular.element('.page-sidebar.scroll').mCustomScrollbar('disable',true);
            }
        };

        $scope.openMbSignout = function() {
            angular.element('#mb-signout').addClass('open');
        };

        $scope.closeMbSignout = function() {
            angular.element('#mb-signout').removeClass('open');
        };

        $scope.checkFeatures = function() {
            $http.get('/api/isFeatures').success(function(data) {
                $scope.isFeatures = data.isFeatures;
            });
        };

    }
]);
