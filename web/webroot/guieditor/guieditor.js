var guieditorApp = angular.module('guieditorApp', ['ngRoute']);

guieditorApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl : 'guieditor/pages/flexsearch.html',
        controller  : 'flexsearchController'
    })
    .when('/contact', {
        templateUrl : 'guieditor/pages/contact.html',
        controller  : 'contactController'
    });
});

guieditorApp.controller('flexsearchController', function($scope) {
    let serverConfig = new ServerConfig({
        url: "https://localhost:9002/tools"
    });
    let fsql = new FSql(serverConfig);
    let typeSystem = new TypeSystem(serverConfig);
    fsql.addListener("fsqlDone", (table, fsql, params) => {
        if (params && params.fields) {
            let objTable = [];
            for (let i = 0; i < table.headers.length; i++) {
                objTable.push([{text: table.headers[i].caption}, table.data[0][i]]);
            }
            $scope.objTable = objTable;
        } else {
            $scope.headers = table.headers;
            $scope.data = table.data;
        }
        $scope.$apply();
    });
    typeSystem.addListener("getTypeDone", (type) => {
        $scope.objType = type;
        typeSystem.getTypeAttributes(type);
        $scope.$apply();
    });
    typeSystem.addListener("typeInfoDone", (info) => {
        let attributes = info.attributes;
        let list = attributes.filter((i) => {return ! i.collection}).map((i) => {return i.name});
        let sql = `select {pk} from {${info.name}} where {pk} = '${$scope.objPk}'`;
        //$scope.objTable = list.map((i) => {return [{text: i}, {text: "value"}]});
        fsql.execute(sql, {fields: list.join(",")});
        $scope.$apply();
    });
    $scope.fsqlField = "SELECT {pk} FROM {CMSSite}";
    $scope.headers = [];
    $scope.data = [];

    $scope.execute = function() {
        fsql.execute($scope.fsqlField);
    }

    $scope.openObject = function(pk) {
        $scope.objPk = pk;
        typeSystem.getType(pk);
    }
});

guieditorApp.controller('contactController', function($scope) {
    $scope.message = 'Message from contact controller';
});