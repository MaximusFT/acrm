'use strict';

angular.module('mean.system').directive('xn-openable', [function() {
    return {
        restrict: 'CA',
        replace: false,
        transclude: false,
        /*scope: {
            index: '=index'
        },*/
        //template: '<a href="#"><img src="{{item.src}}" alt="{{item.alt}}" /></a>',
        link: function(scope, elem, attrs) {
            elem.bind('click', function() {
                console.log('click from directive');
                if(elem.hasClass('active'))
                    elem.removeClass('active');
                else
                    elem.addClass('active');
            });
        }
    };
}]);
