'use strict';

angular.module('mean.system').controller('ErrorController', ['$scope', '$stateParams', '$log', 'Global',
    function($scope, $stateParams, $log, Global) {
        $scope.global = Global;
        if ($stateParams.error) {
            $scope.errorCode = $stateParams.error;
            $log.info(typeof $scope.errorCode);
            switch ($scope.errorCode) {
                case '400':
                    $scope.errorText = 'Bad Request';
                    break;
                case '401':
                    $scope.errorText = 'Unathorized';
                    break;
                case '402':
                    $scope.errorText = 'Payment Required';
                    break;
                case '403':
                    $scope.errorText = 'Forbidden';
                    break;
                case '404':
                    $scope.errorText = 'Not Found';
                    break;
                case '405':
                    $scope.errorText = 'Method Not Allowed';
                    break;
                case '406':
                    $scope.errorText = 'Not Acceptable';
                    break;
                case '407':
                    $scope.errorText = 'Proxy Authentication Required';
                    break;
                case '408':
                    $scope.errorText = 'Request Timeout';
                    break;
                case '409':
                    $scope.errorText = 'Conflict';
                    break;
                case '410':
                    $scope.errorText = 'Gone';
                    break;
                case '411':
                    $scope.errorText = 'Length Required';
                    break;
                case '412':
                    $scope.errorText = 'Precondition Failed';
                    break;
                case '413':
                    $scope.errorText = 'Request Entity Too Large';
                    break;
                case '414':
                    $scope.errorText = 'Request-URI Too Large';
                    break;
                case '415':
                    $scope.errorText = 'Unsupported Media Type';
                    break;
                case '416':
                    $scope.errorText = 'Requested Range Not Satisfiable';
                    break;
                case '417':
                    $scope.errorText = 'Expectation Failed';
                    break;
                case '418':
                    $scope.errorText = 'I\'m a teapot';
                    break;
                case '422':
                    $scope.errorText = 'Unprocessable Entity';
                    break;
                case '423':
                    $scope.errorText = 'Locked';
                    break;
                case '424':
                    $scope.errorText = 'Failed Dependency';
                    break;
                case '425':
                    $scope.errorText = 'Unordered Collection';
                    break;
                case '426':
                    $scope.errorText = 'Upgrade Required';
                    break;
                case '428':
                    $scope.errorText = 'Precondition Required';
                    break;
                case '429':
                    $scope.errorText = 'Too Many Requests';
                    break;
                case '431':
                    $scope.errorText = 'Request Header Fields Too Large';
                    break;
                case '434':
                    $scope.errorText = 'Requested host unavailable';
                    break;
                case '449':
                    $scope.errorText = 'Retry With';
                    break;
                case '451':
                    $scope.errorText = 'Unavailable For Legal Reasons';
                    break;
                case '456':
                    $scope.errorText = 'Unrecoverable Error';
                    break;
                case '500':
                    $scope.errorText = 'Internal Server Error';
                    break;
                case '501':
                    $scope.errorText = 'Not Implemented';
                    break;
                case '502':
                    $scope.errorText = 'Bad Gateway';
                    break;
                case '503':
                    $scope.errorText = 'Service Unavailable';
                    break;
                case '504':
                    $scope.errorText = 'Gateway Timeout';
                    break;
                case '505':
                    $scope.errorText = 'HTTP Version Not Supported';
                    break;
                case '506':
                    $scope.errorText = 'Variant Also Negotiates';
                    break;
                case '507':
                    $scope.errorText = 'Insufficient Storage';
                    break;
                case '508':
                    $scope.errorText = 'Loop Detected';
                    break;
                case '509':
                    $scope.errorText = 'Bandwidth Limit Exceeded';
                    break;
                case '510':
                    $scope.errorText = 'Not Extended';
                    break;
                case '511':
                    $scope.errorText = 'Network Authentication Required';
                    break;
                default:
                	$scope.errorText = 'Unknown error';
                	break;
            }
        }
    }
]);
