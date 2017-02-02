var guieditorApp = angular.module("guieditorApp", ["ngRoute"]);
guieditorApp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

guieditorApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl : 'pages/flexsearch.html',
        controller  : 'flexsearchController'
    })
    .when('/contact', {
        templateUrl : 'pages/contact.html',
        controller  : 'contactController'
    })
    .when('/connection', {
        templateUrl : 'pages/connection.html',
        controller  : 'connectionController'
    });

});

guieditorApp.factory("messageSrvc", function() {
  return {
    errorMessages: [],

    addErrorMessage: function(message) {
        this.errorMessages.push(message);
    },

    getAllErrorMessagesAndClear: function() {
        let res = this.errorMessages.concat();
        this.errorMessages.length = 0;
        return res;
    }
  }
});

guieditorApp.controller('contactController', function($scope) {
    $scope.message = 'Message from contact controller';
});

//angular.element(document).ready(function () {
//    let s = Settings.instance;
//    s.loadPromise().then(function() {
//        window.guiSettings = s;
//        angular.bootstrap(document.body, ["guieditorApp"]);
//    });
//});