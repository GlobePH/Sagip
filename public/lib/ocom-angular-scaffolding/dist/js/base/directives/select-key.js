// From https://github.com/configit/ngyn


( function( angular ) {
  'use strict';

  var ngynSelectKey = angular.module( 'ngynSelectKey', [] );
  
  ngynSelectKey.directive( 'select', ['$parse', '$timeout', function( $parse, $timeout ) {
    return {
      restrict: 'E',
      priority: '100',
      require: ['?ngModel', '?select'],
      link: function( scope, elm, attrs, controllers ) {
        var ngModelController = controllers[0];
        var selectController = controllers[1];
        if ( !attrs.key || !selectController ) {
          return;
        }

        /*
        * Unfortunately the selectController doesn't expose the collection it is bound to,
        * so we have to emulate the steps it takes to get at the collection
        */
        var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
        var optionsExp = attrs.ngOptions;
        var match = optionsExp.match( NG_OPTIONS_REGEXP );
        var valuesFn = $parse( match[7] );
        var key = attrs.key;
        var keyParser = $parse( key );
        var modelValue;

        /*
        * retrieve the related element(s) (based on key)
        * and use that in place of the supplied object
        */
        function replaceModelValue() {
          var collection = valuesFn( scope );

          var mappedVals = [];
          angular.forEach( collection, function( v ) {
            angular.forEach( angular.isArray( modelValue ) ? modelValue : [modelValue], function( v2 ) {
              if ( keyParser( v ) === keyParser( v2 ) ) {
                //console.log('mapped', v2, 'to', v, 'based on', key );
                mappedVals.push( v );
              }
            } );
          } );
          if ( mappedVals.length > 0 ) {        	  
	        	var value = angular.isArray( modelValue ) ? mappedVals : mappedVals[0];
	        	
	        	var modelGetter = $parse(attrs.ngModel);
	        	var modelSetter = modelGetter.assign;
	        	modelSetter(scope, value);	        	        	 
          }
        }

        /*
        * Watch the underlying collection for changes and cause reselection
        */
        scope.$watch( function() { return valuesFn( scope ); }, function() {
          if ( angular.isDefined( modelValue ) ) {
            replaceModelValue();
          }
        }, true );

        /*
        * Push on a formatter to watch changes to the underlying model
        */
        ngModelController.$formatters.push( function( val ) {
          modelValue = val;
          replaceModelValue();
          return val;
        } );
      }
    };
  }] );

  /**
   * Parses "repeat" attribute.
   *
   * Taken from AngularJS ngRepeat source code
   * See https://github.com/angular/angular.js/blob/v1.2.15/src/ng/directive/ngRepeat.js#L211
   * 
   * Stolen again from ui-select code.	
   */

  ngynSelectKey.service('keyOptionsParser', ['$parse', function($parse) {
    var self = this;

    /**
     * Example:
     * expression = "address in addresses | filter: {street: $select.search} track by $index"
     * itemName = "address",
     * source = "addresses | filter: {street: $select.search}",
     * trackByExp = "$index",
     */
    self.parse = function(expression) {

      var match = expression.match(/^\s*(?:([\s\S]+?)\s+as\s+)?([\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

      if (!match) {
    	var keyMinErr = angular.$$minErr("key");   	  
        throw keyMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
                expression);
      }

      var result = {
  	    itemName: match[2], // (lhs) Left-hand side,
  	    source: $parse(match[3]),
  	    trackByExp: match[4],
  	    modelMapper: $parse(match[1] || match[2])
  	  };
  	
  	  if (result.trackByExp) {
  	    var propMatch = result.trackByExp.match(/\S+\.(\S+)/);
  	
  	    if (propMatch) {
  	      result.trackByProp = propMatch[1];
  	    }
  	  }
  	
  	  return result;
    };
  }]);

  
  ngynSelectKey.directive( 'keyOptions', ['$parse', '$timeout', 'keyOptionsParser', function( $parse, $timeout, keyOptionsParser ) {
    return {
      restrict: 'A',
      priority: '100',
      require: ['?ngModel', '?ngOptions'],
      link: function( scope, elm, attrs, controllers ) {
        var ngModelController = controllers[0];        
        
        var optionsExp = attrs.keyOptions || attrs.ngOptions;
        var parseResults = keyOptionsParser.parse(optionsExp);
        
        var key = attrs.key || parseResults.trackByProp;        
        var keyParser = $parse( key );

        if ( !key || !ngModelController ) {
            return;
        }
        
        var modelValue;

        /*
        * retrieve the related element(s) (based on key)
        * and use that in place of the supplied object
        */
        function replaceModelValue() {
          var collection = parseResults.source( scope );

          var mappedVals = [];
          angular.forEach( collection, function( v ) {
            angular.forEach( angular.isArray( modelValue ) ? modelValue : [modelValue], function( v2 ) {
              if ( keyParser( v ) === keyParser( v2 ) ) {
                //console.log('mapped', v2, 'to', v, 'based on', key );
                mappedVals.push( v );
              }
            } );
          } );
          if ( mappedVals.length > 0 ) {        	  
	        	var value = angular.isArray( modelValue ) ? mappedVals : mappedVals[0];
	        	
	        	var modelGetter = $parse(attrs.ngModel);
	        	var modelSetter = modelGetter.assign;
	        	modelSetter(scope, value);	        	        	 
          }
        }

        /*
        * Watch the underlying collection for changes and cause reselection
        */
        scope.$watch( function() { return parseResults.source( scope ); }, function() {
          if ( angular.isDefined( modelValue ) ) {
            replaceModelValue();
          }
        }, true );

        /*
        * Push on a formatter to watch changes to the underlying model
        */
        ngModelController.$formatters.push( function( val ) {
          modelValue = val;
          replaceModelValue();
          return val;
        } );
      }
    };
  }] );
} )( window.angular );