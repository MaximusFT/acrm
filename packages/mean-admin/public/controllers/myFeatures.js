'use strict';
angular.module('mean.mean-admin').controller('MyFeaturesController', ['$scope', '$log', '$http', 'Global',
    function($scope, $log, $http, Global) {
        $scope.init = function() {
            $http.get('/api/getMyFeatures').success(function(data) {
                //$log.info(data);
                /*if (data && data.chatFeature)
                    $scope.features.push({
                        title: 'FinChat',
                        description: 'Corporate chat for analysts and clients',
                        name: 'chatFeature',
                        link: '#!/chat'
                    });
                if (data && data.curManagerFeature)
                    $scope.features.push({
                        title: 'Currency Manager',
                        description: 'Manager for currency predictions and other',
                        name: 'curManagerFeature',
                        link: '#!/manager/currency'
                    });*/
                $scope.features = data;
            });
        };
    }
]);
