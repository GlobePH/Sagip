/**
 * This module defines the resource mappings required by Angular JS to map to a
 * standard Grails CRUD URL scheme that uses `"/$controller/$action?/$id?"`.
 */

angular.module('grailsService', ['ngResource']).factory('Grails', ['$resource', '$rootScope', '$state', 'alerts', function($resource, $rootScope, $state, alerts) {
	var baseUrl = $('body').data('base-url');

	var interceptor = {
			responseError : function (response) {				
				switch (response.status) {
		        case 404: // resource not found - return to the list and display message returned by the controller
		        	alerts.addMessages(response.statusText + " " + response.config.url , true);
		            $state.go ("list"); 
		            break;
		        case 409: // optimistic locking failure - display error message on the page
		        	alerts.error(response.data.messages, false);
		            break;
		        case 422: // validation error - display errors alongside form fields
		        	alerts.info("Some validation errors occurred, See below", false);
		            break;
		        case 500: // Exception 
		        	var message = response.statusText + " for '" + response.config.url + "'. "; // Default Message
		        	
		        	if (response.data && angular.isDefined(response.data.messages)) {        		
		        		alerts.addMessages(response.data.messages, false);        		        	
		        	}
		        	else {
		        		alerts.error(message + " Please contact support@ocom.com.au", false);
		        	}
		        	break;
		        default: // TODO: general error handling
				}
				
				$rootScope.$broadcast("http:error", response);				
			}
	};
	
	return $resource(baseUrl + ':action/:id', {id: '@id'}, {
		lookups: {method: 'POST', params: {action: 'lookups'}, interceptor:interceptor},
		list: {method: 'GET', params: {action: 'list'}, interceptor:interceptor},
		get: {method: 'POST', params: {action: 'get'}, interceptor:interceptor},
		save: {method: 'POST', params: {action: 'save'} , interceptor:interceptor},
		update: {method: 'POST', params: {action: 'update'} , interceptor:interceptor},
		'delete': {method: 'POST', params: {action: 'delete'} , interceptor:interceptor}
	});
}])

.config(["$httpProvider", function ($httpProvider) {
	//To Make IE happy.. From http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
	if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.common['If-Modified-Since'] = 'Sun, 10 Jun 2001 10:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.common.Pragma = 'no-cache';    
}]);

