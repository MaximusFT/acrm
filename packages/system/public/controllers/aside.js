'use strict';

angular.module('mean.system').controller('AsideController', ['$scope', '$rootScope', '$cookies', '$http', '$log', '$location', 'modalService', 'Global', 'Menus',
    function($scope, $rootScope, $cookies, $http, $log, $location, modalService, Global, Menus) {
        $scope.global = Global;
        $scope.menus = {};

        $http.post('/api/mode').success(function(response) {
            //$log.info(response);
            $scope.role = response === 777 ? 'Administrator' : (response === 770 ? 'Manager' : (response === 700 ? 'Employee' : 'Not verified'));
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + err);
        });

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

        $http.post('/api/isAdmin').success(function(response) {
            $scope.isAdmin = response.isAdmin;
        });

        $scope.toggleOpenable = function(event) {
            angular.element('#' + event.currentTarget.id).parents('.xn-openable').toggleClass('active');
        };

        $scope.onSubmenuClick = function() {
            if (angular.element('.page-sidebar .x-navigation').hasClass('x-navigation-minimized'))
                angular.element('.xn-openable').removeClass('active');
        };

        $scope.showAvContr = function() {
            // $log.info('show');
            // angular.element('.owner_photo_bubble_action').css('opacity', '1');
            $scope.changeUserPhoto = true;
        };

        $scope.hideAvContr = function() {
            // $log.info('hide');
            // angular.element('.owner_photo_bubble_action').css('opacity', '0');
            $scope.changeUserPhoto = false;
        };

        $scope.browsePhotoLoader = function() {
            // $log.info('lal');
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose profile photo',
                bodyText: 'Specify the image.',
                type: 14
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $log.info(result);
            });
        };
    }
]);
