'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', '$cookies', '$timeout', '$document', '$window', '$http', '$log', 'Global', 'Menus', 'ngAudio',
    function($scope, $rootScope, $cookies, $timeout, $document, $window, $http, $log, Global, Menus, ngAudio) {
        $scope.global = Global;
        $scope.menus = {};
        $scope.alert = ngAudio.load('//mapqo.com/atlant/audio/alert.mp3');
        $scope.html_click_avail = false;
        $scope.counter = 0;

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
            $scope.alert.play();
        };

        $scope.closeMbSignout = function() {
            angular.element('#mb-signout').removeClass('open');
        };

        $scope.checkFeatures = function() {
            $http.get('/api/isFeatures').success(function(data) {
                $scope.isFeatures = data.isFeatures;
            });
        };

        function page_content_onresize() {
            angular.element('.page-content,.content-frame-body,.content-frame-right,.content-frame-left').css('width', '').css('height', '');

            var content_minus = 0;
            content_minus = (angular.element('.page-container-boxed').length > 0) ? 40 : content_minus;
            content_minus += (angular.element('.page-navigation-top-fixed').length > 0) ? 50 : 0;

            var content = angular.element('.page-content');
            var sidebar = angular.element('.page-sidebar');

            if (content.height() < $document.height() - content_minus) {
                content.height($document.height() - content_minus);
            }

            if (sidebar.height() > content.height()) {
                content.height(sidebar.height());
            }

            if ($window.innerHeight > 1024) {
                var doc_height;
                if (angular.element('.page-sidebar').hasClass('scroll')) {
                    if (angular.element('body').hasClass('page-container-boxed')) {
                        doc_height = $document.height() - 40;
                    } else {
                        doc_height = $window.innerHeight;
                    }
                    angular.element('.page-sidebar').height(doc_height);

                }

                if (angular.element('.content-frame-body').height() < $document.height() - 162) {
                    angular.element('.content-frame-body,.content-frame-right,.content-frame-left').height($document.height() - 162);
                } else {
                    angular.element('.content-frame-right,.content-frame-left').height(angular.element('.content-frame-body').height());
                }

                angular.element('.content-frame-left').show();
                angular.element('.content-frame-right').show();
            } else {
                angular.element('.content-frame-body').height(angular.element('.content-frame').height() - 80);

                if (angular.element('.page-sidebar').hasClass('scroll'))
                    angular.element('.page-sidebar').css('height', '');
            }

            if ($window.innerHeight < 1200) {
                if (angular.element('body').hasClass('page-container-boxed')) {
                    angular.element('body').removeClass('page-container-boxed').data('boxed', '1');
                }
            } else {
                if (angular.element('body').data('boxed') === '1') {
                    angular.element('body').addClass('page-container-boxed').data('boxed', '');
                }
            }
        }

        function onresize(timeout) {
            timeout = timeout ? timeout : 200;

            $timeout(function() {
                page_content_onresize();
            }, timeout);
        }

        $scope.openXControl = function() {
            angular.element('.x-navigation-control').parents('.x-navigation').toggleClass('x-navigation-open');
            onresize();
        };

        $scope.openNotificationsBar = function(event) {
            var isActive = angular.element('#' + event.currentTarget.id).hasClass('active');
            angular.element('.xn-icon-button').removeClass('active');
            if (!isActive) {
                angular.element('#' + event.currentTarget.id).addClass('active');
                $scope.html_click_avail = true;
            }
        };

        angular.element('html').on('click', function(event) {
            $scope.counter += 1;
            if(!$scope.html_click_avail && $scope.counter === 2)
                angular.element('.x-navigation-horizontal li,.x-navigation-minimized li').removeClass('active');
            $scope.counter = $scope.counter === 2 ? 0 : $scope.counter;
        });
    }
]);
