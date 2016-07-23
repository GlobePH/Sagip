/** 
 * CreateCtrl - Manage the Create screen
 */

angular.module('scaffolding').controller ("CreateCtrl", ['$scope','CreateCtrlDefault', '$state', 'Grails', 'alerts', function ($scope, CreateCtrlDefault, $state, Grails, alerts) {
	CreateCtrlDefault.setup($scope);
	
	//TODO - Remove if you are creating a custom version of this controller
	CommonController ($scope);
    
    if(typeof formScopeSetup === 'function') { // Check if function exist
    	formScopeSetup($scope, "create");
	}
    //TODO - End of remove section
}]);