/* Provides The default Functions + Values for each Scope so that a custom contoller uses 
This service to provide the Default infrastructure and overwrites the custom stuff */

/* Default Implementation of the Show Controller 
 * Adds the following 
 * 	formState - variable - used to keep track of the ajax state of the screen.
 * 
 *  load - function - Get the data from the Grails controller
 *  loadLookups - function - Load lookup data
 *  delete - function - Delete the current item using Ajax
 *  close - return the state to the /list page
 */
angular.module('ocom', ['grailsService']).factory('ShowCtrlDefault', ['$state', 'Grails', 'alerts', 'SweetAlert', '$http', function ($state, Grails, alerts, SweetAlert, $http) {
	var serviceInstance = {};
	
	/* Default Show Controller */
	serviceInstance.setup = function ($scope) {
		alerts.changeScope($scope);
		
		$scope.formState = {loaded:false, loadedLookups:false, svaing:false};

	    $scope.load = function () {
	        Grails.get({id: $state.params.id}, function(instance) {
		    	$scope.instance = instance;
		        $scope.item = instance.item;
		    	if (!instance.status) {
		    		alerts.error ("Failed to load Default", false);
		    		$scope.item = {};
		    	}
	            $scope.formState.loaded = true;
	        }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.load();
	    
	    $scope.loadLookups = function() {
		    // Load lists for Selects
		    Grails.lookups({id: $state.params.id}, function(lists, headers) {
		    	for (var key in lists) {
		    		// Merge into the controllers
		    		if (key.indexOf("$") !== 0)
		    			$scope[key] = lists[key];
		    	}
		    	    	
		    	$scope.formState.loadedLookups = true;
		    }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.loadLookups();

	    $scope.delete = function(instance) {
	    	SweetAlert.swal({
			   title: "Are you sure?",
			   text: "Are you sure you want to delete this?",
			   type: "warning",
			   showCancelButton: true,
			   confirmButtonColor: "#DD6B55",
			   confirmButtonText: "Yes, delete it!",
			   closeOnConfirm: true}, 
			function(isConfirmed){
				   if (isConfirmed) {		
					   $scope.formState.saving = true;
					   instance.$delete(function(response) {
				    		alerts.addMessages (response.messages, true);			    		
				            $scope.formState.saving = false;
				            
				            $scope.form.$setPristine();
				            $scope.close();	            
				        }, function (response) {
				        	$scope.formState.saving = false; // Release "Saving"
				        });
				   }	    	
			});    	    	
	    };
	    
	    $scope.close = function() {
	    	$state.go("list");
	    };
	    
	    $scope.doAction = function (actionName, params, callBack) {
	    	var baseUrl = $('body').data('base-url');
	    	
	    	return $http.post (baseUrl + actionName, params).then (function(result) {
	    		alerts.addMessages (result.messages, true);	    		
	    		if (callBack)
	    			callBack(result);
	    	});
	    };
	};

	return serviceInstance;
}]);

/* Default Implementation of the Create Controller 
 * Adds the following 
 *  item - variable - the Current Item we are editing 
 *  instance - variable - the $resource data with Messages+Status values..
 *  formState - variable - The State of the form so we can detect ajax calls etc.	
 * 
 *  load - function - load the 'default' values for an item from the Grails controller
 *  lookups - function - load the Lookups (SELECT's) values from the Grails controller
 *  templateURI - function - Get the Template URI to use
 *  close - function - Return to the /list page 
 *  doSave - function - Called by the save functions to do actual saving
 *  save - function - Save the current item to Grails
 *  saveAndClose - function - Save the current item to Grails then calls Close
 *  saveAndNew - function - Save the current item to Grails then creates a NEW Item to edit by reloading
 *  
 *  EVENTS: - Override these functions to provide custom behaviour.
 *  
 *  validate - function - Used to validate before Update must return true to Update - default = true, Overwrite to provide 'custom' validation
 *  onBeforeValidate - function - called before Validation - Overwrite to provide custom behaviour before validation 
 *  onBeforeSave - function - called before saving - Overwrite to provide custom behaviour before saving
 *  onAfterSave - function - called after Saving - Overwrite to provide custom behaviour after saving
 */
angular.module('ocom').factory('CreateCtrlDefault', ['$state', 'Grails', 'alerts', '$http', function ($state, Grails, alerts, $http) {
	var serviceInstance = {};
	
	/* Default Create controller Scope*/
	serviceInstance.setup = function ($scope) {
		alerts.changeScope($scope);
		alerts.clearMessages();
		
	    $scope.instance = new Grails();
	    
	    /* The State of Ajax Class
	     * loaded - Is the 'item' loaded from the server
	     * loadedLookups - has loadLookups completed
	     * saving - Is an Save underway
		*/
	    $scope.formState = {loaded:false, loadedLookups:false, saving:false};

	    $scope.load = function () {
		    Grails.get({id:0}, function(item) {
		    	$scope.instance = item;
		        $scope.item = item.item;
		        $scope.formState.loaded = true;	        
		    }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.load();
		    
	    $scope.loadLookups = function() {
		    // Load lists for Selects
		    Grails.lookups({id:0}, function(lists, headers) {
		    	for (var key in lists) {
		    		// Merge into the controllers
		    		if (key.indexOf("$") !== 0)
		    			$scope[key] = lists[key];
		    	}
		    	    	
		    	$scope.formState.loadedLookups = true;
		    }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.loadLookups();
	    
	    $scope.templateURI = function() {
	    	return $('body').data('template-url');
	    };
	    
	    $scope.close = function () {
	    	$state.go('list');
	    };

	    // Alias for backwards compatibility
	    $scope.doUpdate = function (instance, success) {
	    	$scope.doSave(instance, success);
	    };
	    
	    $scope.doSave = function (instance, success) {
	    	$scope.onBeforeValidate(instance.item);
	    	if ($scope.validate(instance.item)) {
		    	$scope.formState.saving = true;
		    	alerts.clearMessages();
		    	$scope.onBeforeSave(instance.item);
		    	instance.$save(function(response) {
		    		$scope.onAfterSave(response);
		            
		            $scope.formState.saving = false;
	
		            $scope.instance = response;
		            $scope.item = response.item;
		            
		            alerts.addMessages (response.messages, true);
		            
		            if (response.status) {
		            	success(response.item);
		            }
		        }, function (response) {
		        	$scope.formState.saving = false; // Release "Saving"
		        });
	    	}
	    };
	    
	    $scope.save = function(instance) {
	        $scope.doSave (instance, function(item){
	        	$scope.form.$setPristine();        	
	            $state.go('edit', {id:item.id});
	        });       
	        return false;
	    };
	    
	    $scope.saveAndClose = function(instance) {
	        $scope.doSave (instance, function(item){
	        	$scope.form.$setPristine();
	        	$scope.close();
	        }); 
	    };

	    $scope.saveAndNew = function(instance) {
	    	$scope.doSave (instance, function(item){
	        	$scope.form.$setPristine();
	        	$state.go('create', {}, {reload:true}); //TODO - Just do a get/0 and work from there....
	        });
	    }; 
	    
	    $scope.onBeforeValidate = function (item) {};
	    $scope.onBeforeSave = function (item) {};
	    $scope.onAfterSave = function (item) {};
	    
	    //TODO Overwrite this function to provide "custom" validation
	    $scope.validate = function (item) {
	    	return true; 
	    };
	    
	    $scope.doAction = function (actionName, params, callBack) {
	    	var baseUrl = $('body').data('base-url');
	    	
	    	return $http.post (baseUrl + actionName, params).then (function(result) {
	    		alerts.addMessages (result.messages, true);	    		
	    		if (callBack)
	    			callBack(result);
	    	});
	    };
	};

	return serviceInstance;
}]);

/* Default Implementation of the Edit Controller 
 * Adds the following 
 *  item - variable - the Current Item we are editing 
 *  instance - variable - the $resource data with Messages+Status values..
 *  formState - variable - The State of the form so we can detect ajax calls etc.	
 *   
 *  load - function - Get the item from the Grails controller to edit
 *  loadLookups - function - Get the Lookups (SELECT's) values from the Grails controller
 *  templateURI - function - Get the Template URI to use
 *  close - function - Return to the /list page *  
 *  
 *  doUpdate - function - Called by the update functions to do actual update
 *  update - function - Update the current item to Grails
 *  updateAndClose - function - Update the current item to Grails then calls Close
 *  updateAndNew - function - Update the current item to Grails then creates a NEW Item to edit by reloading
 *  delete - function - Delete the current item using Ajax
 *  
 *  EVENTS: - Override these functions to provide custom behaviour.
 *  
 *  validate - function - Used to validate before Update must return true to Update - default = true, Overwrite to provide 'custom' validation
 *  onBeforeValidate - function - called before Validation - Overwrite to provide custom behaviour before validation 
 *  onBeforeUpdate - function - called before Updating - Overwrite to provide custom behaviour before updating
 *  onAfterUpdate - function - called after Updating - Overwrite to provide custom behaviour after updating
 *  onAfterDelete - function - called after Deleting- Overwrite to provide custom behaviour after deleting

 */
angular.module('ocom').factory('EditCtrlDefault', ['$state', 'Grails', 'alerts', 'SweetAlert', '$http', function ($state, Grails, alerts, SweetAlert, $http) {
	var serviceInstance = {};
		
	/* Default Edit controller Scope*/
	serviceInstance.setup = function ($scope) {
		alerts.changeScope($scope);
		alerts.clearMessages();
		
	    $scope.formState = {loaded:false, loadedLookups:false, saving:false};

	    $scope.load = function () {
	        Grails.get({id: $state.params.id}, function(instance) {
		    	$scope.instance = instance;
		        $scope.item = instance.item;
		    	if (!instance.status) {
		    		alerts.error ("Failed to load Default", false);
		    		$scope.item = {};
		    	}
	            $scope.formState.loaded = true;
	        }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.load();
	        
	    $scope.loadLookups = function() {
		    // Load lists for Selects
		    Grails.lookups({id: $state.params.id}, function(lists, headers) {
		    	for (var key in lists) {
		    		// Merge into the controllers
		    		if (key.indexOf("$") !== 0)
		    			$scope[key] = lists[key];
		    	}
		    	    	
		    	$scope.formState.loadedLookups = true;
		    }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.loadLookups();
	    
	    $scope.templateURI = function() {
	    	return $('body').data('template-url');
	    };
	    
	    $scope.close = function () {
	    	$state.go('list');
	    };
	    
	    $scope.doUpdate = function (instance, success) {
	    	$scope.onBeforeValidate(instance.item);
	    	
	    	if ($scope.validate(instance.item)) {
		    	$scope.formState.saving = true;
		    	alerts.clearMessages();
		    	
		    	$scope.onBeforeUpdate(instance.item);
		    	instance.$update(function(response) {
		    		$scope.onAfterUpdate(response);
		    		
		            $scope.formState.saving = false;
	
		            $scope.instance = response;
		            $scope.item = response.item;
		            
		            alerts.addMessages (response.messages, true);
		            
		            if (instance.status) {
		            	success();
		            }
		        }, function (response) {
		        	$scope.formState.saving = false; // Release "Saving"
		        });
	    	}
	    };
	    
	    $scope.update = function(instance) {
	    	$scope.doUpdate(instance, function(item) {
		        $scope.form.$setPristine();	  
		        alerts.showNow();
		    });
	    };

	    $scope.updateAndClose = function (instance) {
	    	$scope.doUpdate(instance, function(item) {
	            $scope.form.$setPristine();
	            $scope.close();
	        });
	    };	  
	    
	    $scope.delete = function(instance) {
	    	SweetAlert.swal({
			   title: "Are you sure?",
			   text: "Are you sure you want to delete this?",
			   type: "warning",
			   showCancelButton: true,
			   confirmButtonColor: "#DD6B55",
			   confirmButtonText: "Yes, delete it!",
			   closeOnConfirm: true}, 
			function(isConfirmed){
				   if (isConfirmed) {		
					   $scope.formState.saving = true;
					   instance.$delete(function(response) {
						    $scope.onAfterDelete(response);
						    
				    		alerts.addMessages (response.messages, true);			    		
				            $scope.formState.saving = false;
				            
				            $scope.form.$setPristine();
				            $scope.close();	            
				        }, function (response) {
				        	$scope.formState.saving = false; // Release "Saving"
				        });
				   }	    	
			});    	    	
	    };
	    
	    //TODO Overwrite these functions to provide "custom" behaviour
	    $scope.validate = function (item) {
	    	return true; 
	    };
	    $scope.onBeforeValidate = function (item) {};
	    $scope.onBeforeUpdate = function (item) {};
	    $scope.onAfterUpdate = function (item) {};
	    $scope.onAfterDelete = function (item) {};
	    
	    $scope.doAction = function (actionName, params, callBack) {
	    	var baseUrl = $('body').data('base-url');
	    	
	    	return $http.post (baseUrl + actionName, params).then (function(result) {
	    		alerts.addMessages (result.messages, true);	    		
	    		if (callBack)
	    			callBack(result);
	    	});
	    };
	};	

	return serviceInstance;
}]);

/* Default Implementation of the List Controller 
 * Adds the following 
 *  listLoaded - variable - Set to true when the list is loaded
 *  
 *  loadList - function - Load the list from Grails using the $routeParams
 *  
 *  fields - variable - the List of Fields to show on the Filter Select (Overwritten by lookups)
 *  maxRanges - variable - The Array of maximum page size for the List at the bottom (Overwritten by lookups)
 *  
 *  listOptions - variable - the Object to edit/update for filtering the list
 *  loadLookups - function - function - Get the Lookups (SELECT's) values from the Grails controller
 *  
 *  refreshList - function - reload the list from Grails using the listOptions
 *  changeMax - function - Change the maximum value in the listOptions then refreshList
 *  selectPage - function - Change the page shown in the listOptions then refreshList
 *  pageChanged - function - calls selectPage to update page changed.
 *  show - function - open the selected item in the /edit/ page
 *  
 *  itemClass - function - Use to detect inactive Items in the table and apply the right class to the row.
 */
angular.module('ocom').factory('ListCtrlDefault', ['$state', 'Grails', '$rootScope', 'alerts', '$timeout', '$http', function ($state, Grails, $rootScope, alerts, $timeout, $http) {
	var serviceInstance = {};
		
	/* Default List controller Scope*/
	serviceInstance.setup = function ($scope) {
		$scope.listLoaded = false;
		
		if ($rootScope.previousList && !$state.params.fresh) {
			var previous = $rootScope.previousList;
			$rootScope.previousList = null;
			$state.go ("list", previous, {reload:true});
			return; // Nothing else
		} else {
			$state.params.fresh = false; // Make sure it's not part of the process now
			$rootScope.previousList =$state.params;
		}
		
	    alerts.changeScope($scope);
		
		$scope.loadList = function() {		
		    Grails.list($state.params, function(result, headers) {	    	
		    	$scope.listResult = result;	    	
		        $scope.list = result.list;
		        $scope.listOptions.total = result.total;
		        $scope.listOptions.currentPage = Math.ceil($scope.listOptions.offset / $scope.listOptions.max)+1;
		        
		        $scope.listLoaded = true;	  		
		    }, errorHandler.curry($scope, $state, alerts));
		};
		$scope.loadList();
	    
	    $scope.fields = [
	         			{name:"-- All --", value:""},
	         			{name:"ID", value:"id"}
	         			];
	    
	    $scope.maxRanges = [10, 20, 50, 100];
	    
	    $scope.listOptions = {
	    		searchField : $state.params.searchField || "",
	    		q : $state.params.q || "",
	    		sort: $state.params.sort || "",
	    	    order: $state.params.order || "asc",
	    	    total: 0,
	    	    max : parseInt($state.params.max) || 10,
	    		offset : parseInt($state.params.offset) || 0,
	    		currentPage : 0,
	    		label: $state.params.label,
	    		filter: $state.params.filter
	    };  
	    
	    $scope.loadLookups = function() {
		    Grails.lookups({id: null}, function(lists, headers) {
		    	for (var key in lists) {
		    		// Merge into the controllers
		    		if (key.indexOf("$") !== 0)
		    			$scope[key] = lists[key];
		    	}
		    	
		    	// If no filter selected change to default
		    	if ($scope.filters && !$scope.listOptions.filter) {
		    		angular.forEach ($scope.filters, function(filter) {
		    			if (angular.isDefined(filter.default)) {
		    				if (filter.default) {
		    					$scope.listOptions.filter = filter.id; // Set Default
		    				}
		    			}
		    		});
		    	}
		  	    
		    }, errorHandler.curry($scope, $state, alerts));
	    };
	    $scope.loadLookups();
	        
	    $scope.refreshList = function() {
	    	var options = angular.copy ($scope.listOptions);
	    	
	    	delete options.total;
	    	delete options.currentPage;

	    	$rootScope.previousList = null;// Forget from last time - it's changed
	    	$state.go ("list", options, {reload:true}); //$location.path("/list").search (options);
	    };

	    $scope.changeOptionAndRefresh = function (field, value) {
	    	$scope.listOptions[field] = value;
	    	$scope.refreshList(); // Update When changed.
	    };
	    
	    $scope.changeMax = function (max) {
	    	$scope.changeOptionAndRefresh("max", max);
	    };
	    
	    $scope.selectPage = function (page) {
	    	$scope.changeOptionAndRefresh("offset", $scope.listOptions.max * (page-1));
	    };
	    
	    $scope.pageChanged = function() {
	    	$scope.selectPage ($scope.listOptions.currentPage);
	    };
	    
	    $scope.show = function(item) {    	
	    	$state.go("edit", {id:item.id}); 
	    };
	    
	    $scope.itemClass = function (item) {
	    	var result = [];
	    	if (angular.isDefined(item.activeStartDate) && angular.isDefined(item.activeEndDate)) {
	    		var now = new Date();
	    		
	    		var startDate = new Date(item.activeStartDate);
	    		var endDate = null;
	    		if (item.activeEndDate !== null)
	    			endDate = new Date(item.activeEndDate);
	    		if (startDate <= now) {
	    			if (endDate === null) {
	    				result.push ("rowActive");
	    			}
	    			else {
	    				if (endDate >= now) {
	    					result.push ("rowActive");
	    				}
	    				else {
	    					result.push ("rowInactive");
	    				}
	    			}
	    		}
	    		else {
	    			result.push ("rowInactive");
	    		}
	    	}
	    	
	    	return result;
	    };
	    
	    $scope.doAction = function (actionName, params, callBack) {
	    	var baseUrl = $('body').data('base-url');
	    	
	    	return $http.post (baseUrl + actionName, params).then (function(result) {
	    		alerts.addMessages (result.messages, true);
	    		$scope.refreshList();
	    		if (callBack)
	    			callBack(result);
	    	});
	    };
	};
	
	return serviceInstance;
}]);