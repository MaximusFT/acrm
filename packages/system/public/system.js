'use strict';

angular.module('mean.system', ['mean-factory-interceptor', 'ngAudio', 'ngAnimate', 'ngCookies']).config(['$provide', function($provide) {
    $provide.decorator('$sniffer', ['$delegate', function($delegate) {
        $delegate.history = false;
        return $delegate;
    }]);
}]);
