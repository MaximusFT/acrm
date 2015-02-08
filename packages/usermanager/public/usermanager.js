'use strict';

var myapp = angular.module('mean.usermanager', ['ui.bootstrap', 'cgBusy', 'ngClipboard']);

myapp.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath('//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf');
  }]);