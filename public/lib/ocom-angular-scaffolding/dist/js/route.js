/**
 * Route definitions connecting URL fragments to views and controllers.
 */
angular.module('scaffolding').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  var baseUrl = $('body').data('template-url');
  
  // Default route
  $urlRouterProvider.otherwise("/list");
  
  $stateProvider
  	.state('list', {
  		url:"/list?offset&max&sort&order&q&searchField&filter&fresh?label",  		
  		templateUrl: baseUrl + '/list',  		
  		controller: "ListCtrl"      
    })
    .state('create', {
    	url:"/create",
    	templateUrl: baseUrl + '/create',
    	controller: "CreateCtrl"      
    })  
    .state('edit', {
    	url: "/edit/:id",    	
    	templateUrl: baseUrl + '/edit',
    	controller: "EditCtrl"      
    })
    .state('show', {
    	url: "/show/:id",    	
    	templateUrl: baseUrl + '/show',
    	controller: "ShowCtrl"      
    });
}]);