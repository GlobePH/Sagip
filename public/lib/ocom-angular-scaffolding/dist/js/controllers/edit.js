/** 
 * EditCtrl - Manage the Edit screen
 */

angular.module('scaffolding').controller ("EditCtrl", ['$scope', 'EditCtrlDefault', '$state', 'Grails', 'alerts', 'SweetAlert', function ($scope, EditCtrlDefault, $state, Grails, alerts, SweetAlert) {
	EditCtrlDefault.setup($scope);
    
	//TODO - Remove if you are creating a custom version of this controller
	CommonController ($scope);
    
    if(typeof formScopeSetup === 'function') { // Check if function exist
    	formScopeSetup($scope,"edit");
	}
    //TODO - End of remove section
}]);