var guieditorApp = angular.module('guieditorApp', ['ngRoute']);

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

guieditorApp.controller('contactController', function($scope) {
    $scope.message = 'Message from contact controller';
});

angular.element(document).ready(function () {
    let s = Settings.instance;
    s.loadPromise().then(function() {
        window.guiSettings = s;
        angular.bootstrap(document.body, ["guieditorApp"]);
    });
});