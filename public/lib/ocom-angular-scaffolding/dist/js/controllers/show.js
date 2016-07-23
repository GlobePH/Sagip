/** 
 * ShowCtrl - Manage the Show screen
 */

angular.module('scaffolding').controller ("ShowCtrl", ['$scope', 'ShowCtrlDefault', '$state', 'Grails', 'alerts', 'SweetAlert', function ($scope, ShowCtrlDefault, $state, Grails, alerts, SweetAlert) {
	ShowCtrlDefault.setup($scope);

	//TODO - Remove if you are creating a custom version of this controller
	CommonController ($scope);
    
    if(typeof formScopeSetup === 'function') { // Check if function exist
    	formScopeSetup($scope, "show");
	}
    //TODO - End of remove section
}]);