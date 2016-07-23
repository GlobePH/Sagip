( function( angular ) {
  'use strict';

  angular.module( 'mathFilters', [] )  
  	// From http://cacodaemon.de/index.php?id=55
  	// Usage {{ array |subByKey:'key' }}
	.filter('sumByKey', function () {
	    return function (data, key) {
	        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
	            return 0;
	        }
	
	        var sum = 0;
	        for (var i = data.length - 1; i >= 0; i--) {
	        	var val = parseInt(data[i][key]);
	        	if (!isNaN(val))
	        		sum += val;
	        }
	
	        return sum;
	    };
	});

} )( window.angular );