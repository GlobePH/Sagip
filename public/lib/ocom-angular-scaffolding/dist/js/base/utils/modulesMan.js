/* MODULES Manager
 * Allow easy adding of modules to projects
 */

var mainModules = ['ui.router', 'grailsService',
                   'chieffancypants.loadingBar', 'angular-growl',
                   'ngynSelectKey', 'ui.bootstrap.alert', 
                   'alertsService', 'oitozero.ngSweetAlert',
                   'ui.bootstrap.pagination', 'ui.bootstrap.tpls', 
                   'listModule', 'datePicker', 'mathFilters',     
                   'ocom',
                   'ocomFormsModule', 'tableModule'];

function addMainModule(newModule) {
	mainModules = _.union (mainModules, [newModule]);	
}