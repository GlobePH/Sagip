( function( angular ) {
  'use strict';

  var datePickerModule = angular.module('datePicker', ['mgcrea.ngStrap.timepicker', 'mgcrea.ngStrap.datepicker']);

  
  datePickerModule.directive('clearDate', function($parse) {
	  return {
	      restrict: 'EA',
	      replace: true,
	      require: 'ngModel',
	      template:"<a class=\"btn btn-sm\"><span class=\"glyphicon glyphicon-remove\"></span></a>",
	      link: function (scope, elem, attrs, ctrl) {
	    	  elem.bind('click',  function() {	   	    		  
	    		  ctrl.$setViewValue("");
	              ctrl.$render();
	              
	              scope.$apply(); 
	        	  	              
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
  datePickerModule.directive('setToday', function($parse) {
	  return {
	      restrict: 'EA',
	      replace: true,
	      require: 'ngModel',
	      template:"<a class=\"btn btn-sm\"><span class=\"glyphicon glyphicon-calendar\"></span></a>",
	      link: function (scope, elem, attrs, ctrl) {
	    	  elem.bind('click',  function() {	    			    		  	    		      		  	        	  
	    		  ctrl.$setViewValue(new Date());
	              ctrl.$render();
	              
	              scope.$apply(); 
	        	  
	    		  return false;
	    	  });	    	  	    
	      }
	    };
  });
  
//  datePickerModule.directive( 'notUndefined', ['$parse', '$timeout', function( $parse, $timeout ) {
//    return {
//      restrict: 'AE',
//      priority: '100',
//      scope: {
//    	  ngModel:'='
//      },
//      require: ['?ngModel'],
//      link: function( scope, elm, attrs, controllers ) {
//        /*
//        * Watch the underlying collection for changes and cause reselection
//        */
////        scope.$watch( function() { return scope.ngModel; }, function() {
////          if ( angular.isUndefined(scope.ngModel) ) {
////        	  scope.$apply(function() {
////        		  scope.ngModel = "";
////        	  });
////          }
////        }, true );
//
////        /*
////        * Push on a formatter to watch changes to the underlying model
////        */
////        ngModelController.$formatters.push( function( val ) {
////          modelValue = val;
////          replaceModelValue();
////          return val;
////        } );
//      }
//    };
//  }] );

} )( window.angular );