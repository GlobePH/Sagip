( function( angular ) {
  'use strict';

  var listModule = angular.module( 'tableModule', [] );
  
  listModule.directive('sortable', function() {
	  return {
	      restrict: 'AE',
	      replace: false,
	      scope: {
	    	  listOptions: '=ngModel',
	    	  changed:'&changed'
	      },
	      transclude: true,
	      // require: '^ngModel',
	      template: "<span><a href=\"\" ng-transclude></a><i ng-show='currentAsc' class='glyphicon glyphicon-chevron-up pull-right'></i><i ng-show='currentDesc' class='glyphicon glyphicon-chevron-down pull-right'></i></span>",
		  link: function(scope, elem, attrs, ngModel) {	  
			  
			  var sortField = "";
			  if (scope.listOptions) {
				  sortField = scope.listOptions.sort;
			  }
    		  scope.currentAsc = (sortField==attrs.sortable && scope.listOptions.order=='asc');
    		  scope.currentDesc = (sortField==attrs.sortable && scope.listOptions.order=='desc');
    		  
    	      elem.bind('click', function() {
    	        scope.$apply(function() {
    	        	if (scope.listOptions.sort == attrs.sortable) {
    	        		if (scope.listOptions.order == "asc")
    	            		scope.listOptions.order = "desc";
    	            	else
    	            		scope.listOptions.order = "asc";
    	        	}
    	        	else {
    	        		scope.listOptions.sort = attrs.sortable;
    	        		scope.listOptions.order = "asc";
    	        	}
    	        });
    	        scope.changed();
    	      });    	      
    	    }
	  };
  });

  listModule.directive('tableFilter', function() {
	  var strVar="";
      strVar += "<div class=\"well form-inline\" style=\"padding:5px; margin-bottom:0px;\">";
      strVar += " 	<form class=\"form-group\" data-ng-submit=\"refreshList()\">";
      strVar += "		<div class=\"form-group\">";
      strVar += "			<input class=\"form-control input-medium\" type=\"search\" ng-model=\"listOptions.q\" placeholder=\"Search\"\/>";
      strVar += "			<select class=\"form-control input-medium\" ng-model=\"listOptions.searchField\" ng-options=\"field.value as field.name for field in fields\" ><\/select>		";
      strVar += "			<a href=\"\" ng-click=\"refreshList()\" class=\"btn btn-default input-medium\" ng-if=\"fields\"><span class=\"glyphicon glyphicon-search\"><\/span><\/a>";
      strVar += "			<a ui-sref=\"create\" class=\"btn btn-primary input-medium\">New<\/a>";
      strVar += "		<\/div>";
      strVar += "	<\/form>";
      strVar += "	<span ng-transclude><\/span>";
      strVar += "	<div class=\"form-group pull-right\" ng-if=\"filters != null\">";
      strVar += "		<select class=\"form-control\" ng-model=\"listOptions.filter\" ng-options=\"filter.id as filter.name for filter in filters\" ng-change=\"refreshList()\"><\/select>";
      strVar += "	<\/div>";
      strVar += "<\/div>";
	  return {
	      restrict: 'AE',
	      replace: true,
	      transclude: true,
	      template: strVar
	  };
  });
} )( window.angular );