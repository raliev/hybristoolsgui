guieditorApp.controller('flexsearchController', function($scope) {
    let sqlEditor = createFSQLEditor($(".fsql")[0]);
    //to app level:
    let settings = Settings.instance;
    if (settings.lastSql) {
        sqlEditor.setValue(settings.lastSql);
    }
    let conn = settings.connection;

    //end to app level
    let fsql = new FSql(conn);
    let typeSystem = new TypeSystem(conn);
    settings.addListener("reconnect", (c) => {
        fsql.connection = c;
        typeSystem.connection = c;
    });
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
    $scope.execute = function() {
        let sql = sqlEditor.getValue();
        Settings.instance.rememberSql(sql);
        fsql.execute(sql);
        $scope.history = settings.sqlHistory;
    }

    $scope.openObject = function(pk) {
        $scope.objPk = pk;
        typeSystem.getType(pk);
    }

    $scope.setFSql = function(sql) {
        sqlEditor.setValue(sql);
    }

    $scope.fsqlField = "SELECT {pk} FROM {CMSSite}";
    $scope.headers = [];
    $scope.data = [];
    $scope.history = settings.sqlHistory.concat();
});