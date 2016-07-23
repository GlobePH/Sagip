angular.module('scaffolding').config(["$httpProvider", function ($httpProvider) { 
    $httpProvider.defaults.transformResponse.push(function(responseData){
    	//SW: Not required.. Ses Directives/select-key.js
    	//convertDateStringsToDates(responseData);
       return responseData;
   });
}]);

angular.module('scaffolding').value('$strapConfig', {
  datepicker: {
    language: 'en',
    format: 'dd/mm/yyyy',
    todayBtn: "linked",
    clearBtn: true,
    autoClose: true,
    type: "date"
  }
});

angular.module('scaffolding').config(['growlProvider', '$httpProvider', function(growlProvider, $httpProvider) {
	growlProvider.onlyUniqueMessages(true);
	growlProvider.globalTimeToLive({success: 1000, error: -1, warning: 3000, info: 4000});
	$httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
}]);

angular.module('scaffolding').constant('dateTimeConfig', {
	  template: function (attrs) {
	    return '' +
	        '<div ' +
	        'date-picker="' + attrs.ngModel + '" ' +
	        (attrs.view ? 'view="' + attrs.view + '" ' : '') +
	        (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') +
	        (attrs.template ? 'template="' + attrs.template + '" ' : '') +
	        (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
	        'class="dropdown-menu"></div>';
	  },
	  format: 'dd/MM/yyyy',
	  views: ['date', 'year', 'month', 'hours', 'minutes'],
	  dismiss: true,
	  position: 'relative'
	});