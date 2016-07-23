function toArray(element) {
    return Array.prototype.slice.call(element);
}

Function.prototype.curry = function() {
    if (arguments.length < 1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = toArray(arguments);
    return function() {
        return __method.apply(this, args.concat(toArray(arguments)));
    };
};

/**
 * Generic $resource error handler used by all controllers.
 */
function errorHandler($scope, $state, alerts, response) {
//    switch (response.status) {
//        case 404: // resource not found - return to the list and display message returned by the controller
//        	alerts.addMessages(response.data.messages, true);
//            $state.go ("list"); 
//            break;
//        case 409: // optimistic locking failure - display error message on the page
//        	alerts.error(response.data.messages, false);
//            break;
//        case 422: // validation error - display errors alongside form fields
//        	alerts.info("Some validation errors occurred, See below", false);
//            break;
//        case 500: // Exception 
//        	var message = response.statusText + " for '" + response.config.url + "'. "; // Default Message
//        	
//        	if (response.data && angular.isDefined(response.data['messages'])) {        		
//        		alerts.addMessages(response.data.messages, false);        		        	
//        	}
//        	else {
//        		alerts.error(message + " Please contact support@ocom.com.au", false);
//        	}
//        default: // TODO: general error handling
//    }
    
    //$scope.formState = {loaded:false, loadedLookups:false, saving:false};
    if ($scope !== null && angular.isDefined($scope.formState)) {
	    if ($scope.formState.saving) 
	    	$scope.formState.saving = false; // Release "Saving"
    }
}