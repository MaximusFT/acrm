'use strict';

angular.module('mean.users')
    .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$log', '$location', 'Global',
        function($scope, $rootScope, $http, $log, $location, Global) {
            // This object will be filled by the form
            $scope.user = {};
            $scope.global = Global;
            $scope.global.registerForm = false;
            $scope.input = {
                type: 'password',
                placeholder: 'Password',
                confirmPlaceholder: 'Repeat Password',
                iconClass: '',
                tooltipText: 'Show password'
            };

            $scope.togglePasswordVisible = function() {
                $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
                $scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
                $scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
                $scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
            };

            // Register the login() function
            $scope.login = function() {
                $http.post('/login', {
                        email: $scope.user.email,
                        password: $scope.user.password
                    })
                    .success(function(response) {
                        // authentication OK
                        $scope.loginError = 0;
                        $rootScope.user = response.user;
                        $rootScope.$emit('loggedin');
                        if (response.redirect) {
                            if (window.location.href === response.redirect) {
                                //This is so an admin user will get full admin page
                                window.location.reload();
                            } else {
                                window.location = response.redirect;
                            }
                        }
                    })
                    .error(function() {
                        $scope.loginerror = 'Authentication failed.';
                    });
            };
        }
    ])
    .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$log', '$location', 'Global',
        function($scope, $rootScope, $http, $log, $location, Global) {
            $scope.user = {};
            $scope.global = Global;
            $scope.global.registerForm = true;
            $scope.input = {
                type: 'password',
                placeholder: 'Password',
                placeholderConfirmPass: 'Repeat Password',
                iconClassConfirmPass: '',
                tooltipText: 'Show password',
                tooltipTextConfirmPass: 'Show password'
            };

            $scope.scorePassword = function(pass) {
                var score = 0;
                if (!pass)
                    return score;

                // award every unique letter until 5 repetitions
                var letters = {};
                for (var i = 0; i < pass.length; i += 1) {
                    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
                    score += 5.0 / letters[pass[i]];
                }

                // bonus points for mixing it up
                var variations = {
                    digits: /\d/.test(pass),
                    lower: /[a-z]/.test(pass),
                    upper: /[A-Z]/.test(pass),
                    nonWords: /\W/.test(pass),
                };

                var variationCount = 0;
                for (var check in variations) {
                    variationCount += (variations[check] === true) ? 1 : 0;
                }
                score += (variationCount - 1) * 10;
                //$log.info(score);
                $scope.passScore = parseInt(score);

                if ($scope.passScore < 50 || !pass)
                    angular.element('.password-marker').addClass('password-error');
                else
                    angular.element('.password-marker').removeClass('password-error');
            };

            $scope.register = function() {
                $scope.usernameError = null;
                $scope.registerError = null;
                $http.post('/register', {
                        email: $scope.user.email,
                        password: $scope.user.password,
                        confirmPassword: $scope.user.confirmPassword,
                        username: $scope.user.username,
                        name: $scope.user.name,
                        whatDepartment: $scope.user.whatDepartment,
                        task: 10001
                    })
                    .success(function() {
                        // authentication OK
                        $scope.registerError = 0;
                        $rootScope.user = $scope.user;
                        Global.user = $rootScope.user;
                        Global.authenticated = !!$rootScope.user;
                        $rootScope.$emit('loggedin');
                        window.location.reload();
                    })
                    .error(function(error) {
                        // Error: authentication failed
                        //$log.error(error);
                        if (error === 'Username already taken') {
                            $scope.usernameError = error;
                        } else if (error === 'Email already taken') {
                            $scope.emailError = error;
                        } else $scope.registerError = error;
                    });
            };
        }
    ])
    .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$log', 'Global',
        function($scope, $rootScope, $http, $location, $log, Global) {
            $scope.user = {};
            $scope.global = Global;
            $scope.global.registerForm = false;
            $scope.forgotpassword = function() {
                $http.post('/forgot-password', {
                        text: $scope.user.email //$scope.text
                    })
                    .success(function(response) {
                        $scope.response = response;
                    })
                    .error(function(error) {
                        $scope.response = error;
                    });
            };
        }
    ])
    .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'Global',
        function($scope, $rootScope, $http, $location, $stateParams, Global) {
            $scope.user = {};
            $scope.global = Global;
            $scope.global.registerForm = false;
            $scope.resetpassword = function() {
                $http.post('/reset/' + $stateParams.tokenId, {
                    password: $scope.user.password,
                    confirmPassword: $scope.user.confirmPassword
                }).success(function(response) {
                    $rootScope.user = response.user;
                    $rootScope.$emit('loggedin');
                    window.location.reload();
                }).error(function(error) {
                    if (error.msg === 'Token invalid or expired')
                        $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
                    else
                        $scope.validationError = error;
                });
            };
        }
    ]);
