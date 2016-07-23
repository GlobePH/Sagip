/** 
 * ListCtrl - Manage the LIST
 */
angular.module('scaffolding').controller ("ListCtrl", ['$scope', 'ListCtrlDefault', '$state', 'Grails', '$rootScope', 'alerts', "$timeout", function ($scope, ListCtrlDefault, $state, Grails, $rootScope, alerts, $timeout) {			
	ListCtrlDefault.setup($scope);
	
	//TODO - Remove if you are creating a custom version of this controller
	CommonController ($scope);
    
    if(typeof formScopeSetup === 'function') { // Check if function exist
    	formScopeSetup($scope, "list");
	}
    //TODO - End of remove section
}]);
