'use strict';

angular.module('mean.passmanager').directive('imgUpload', function($upload, $log) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var validFileExtensions = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];

            element.bind('change', function(event) {
                //var files = event.target.files;
                //element.scope()[attrs.imgSelected](files);
                var files = [];
                angular.forEach(event.target.files, function(file) {
                    console.log(file);
                    if (file.size / 1048576 > 2) {
                        element.scope()[attrs.onSizeLimitReach](file.name, Math.round(file.size / 1048576 * 100) / 100);
                    } else if (validFileExtensions.indexOf(file.name.split('.').pop()) === -1) {
                        element.scope()[attrs.onInvalidExtension](file.name);
                    } else {
                        scope.upload = $upload.upload({
                            url: 'api/uploadImg',
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            },
                            file: file
                        }).progress(function(evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function(data, status, headers, config) {
                            if (data.success) {
                                /*if (angular.isDefined(attrs.uploadFileCallback)) {
                                    scope.uploadFileCallback({
                                        file: data.file
                                    });
                                }*/
                                files.push({
                                    file: data.file,
                                    preview: data.preview
                                });
                            }
                            if (files.length === event.target.files.length) {
                                if (angular.isDefined(attrs.imgUpload)) {
                                    /*scope.uploadCallback({
                                        files: files
                                    });*/
                                    element.scope()[attrs.imgUpload](files);
                                }
                            }
                        });
                    }
                });
            });
        }
    };
});
