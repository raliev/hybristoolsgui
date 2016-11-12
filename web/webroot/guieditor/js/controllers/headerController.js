guieditorApp.controller('headerController', function($scope) {
    $scope.$on('$routeChangeSuccess', function(ev, current, previous) {
        switch(current.loadedTemplateUrl) {
            case "pages/contact.html":
                $scope.tab = "contact"; break;
            case "pages/connection.html":
                $scope.tab = "connection"; break;
            case "pages/flexsearch.html":
                $scope.tab = "sql"; break;
        }
    });
});