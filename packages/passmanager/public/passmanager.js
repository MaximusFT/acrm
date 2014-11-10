'use strict';

var myapp = angular.module('mean.passmanager', ['cgBusy', 'ngClipboard']);

myapp.config(['ngClipProvider', function (ngClipProvider) {
			ngClipProvider.setPath('//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf');
		}
	]);