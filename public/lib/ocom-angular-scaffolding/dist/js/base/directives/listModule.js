
( function( angular ) {
  'use strict';

  var listModule = angular.module( 'listModule', [] );
  
  listModule.directive('listAppend', function() {
	  return {
	      restrict: 'A',
	      scope: {
	    	   list: '=', // The List/Array to append to
	    	   item: '@', // The item to add ie {} or {value:0'} 
	    	   listIndex: '=' // The Index to append at, so put 0 to put at start of list..
	      },
	      link: function (scope, elem, attrs) {
	    	  elem.bind('click',  function() {
	    		  var theList = scope.list;	    		  

	    		  if (angular.isUndefined(theList)) {
	    			  scope.list = [];
	    			  theList = scope.list;
	    		  }
	    		  
	    		  var newItem = angular.copy(scope.$eval(scope.item));
	    		  if (newItem !== null) 	
	    			  scope.$apply(function() {
	    				  if (angular.isDefined(scope.insertIndex))
	    					  theList.splice(scope.insertIndex, 0, newItem);
	    				  else
	    					  theList.push (newItem);
	    			  });	 	    		 
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
  function findIndex(listIndex, list, item) {
	if (angular.isDefined(listIndex)) {
		return listIndex;
	}  
	
	return list.indexOf(item);
  }
  
  listModule.directive('listRemove', function() {
	  return {
	      restrict: 'A',
	      scope: {
	    	   list: '=', // The List/Array to append to
	    	   item: '=', // The Item in the array to Remove
	    	   listIndex: '=' // The Index of the Item to remove.
	      },
	      link: function (scope, elem, attrs) {
	    	  elem.bind('click',  function() {
	    		  var list = scope.list;
	    		  
	    		  var index = findIndex(scope.listIndex, list, scope.item);
	    		  if (index > -1) {
	    			  scope.$apply(function() {
	    				list.splice(index,1);
	    			  });
	    		  }	
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
  listModule.directive('listMoveUp', function() {
	  return {
	      restrict: 'A',
	      scope: {
	    	   list: '=', // The List/Array to Move Up
	    	   item: '=', // The Item in the array to Move Up
	    	   listIndex: '=' // The Index of the Item to Move Up.
	      },
	      link: function (scope, elem, attrs) {
	    	  elem.bind('click',  function() {
	    		  var list = scope.list;
	    		  
	    		  var index = findIndex(scope.listIndex, list, scope.item);
	    		  if (index > 0) {
	    			  scope.$apply(function() {	    			
	    				var original = list[index-1];
	    				list[index-1] = list[index];
	    				list[index] = original;
	    			  });
	    		  }		
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
  listModule.directive('listMoveDown', function() {
	  return {
	      restrict: 'A',
	      scope: {
	    	   list: '=', // The List/Array to Move Down
	    	   item: '=', // The Item in the array to Move Down
	    	   listIndex: '=' // The Index of the Item to Move Down.
	      },
	      link: function (scope, elem, attrs) {
	    	  elem.bind('click',  function() {
	    		  var list = scope.list;
	    		  
	    		  var index = findIndex(scope.listIndex, list, scope.item);
	    		  if (index < list.length-1) {
	    			  scope.$apply(function() {
	    			 	var original = list[index+1];
	    			 	list[index+1] = list[index];
	    			 	list[index] = original;
	    			  });
	    		  }		
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
} )( window.angular );