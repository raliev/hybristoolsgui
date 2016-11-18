guieditorApp.controller('flexsearchController', function($scope) {
    let sqlEditor = createFSQLEditor($(".fsql")[0]);
    //to app level:
    let settings = Settings.instance;
    if (settings.lastSql) {
        sqlEditor.setValue(settings.lastSql);
    }
    let conn = settings.connection;
    conn.connect();

    //end to app level
    //let typeSystem = new TypeSystem(conn);
    settings.addListener("reconnect", (c) => {
        //typeSystem.connection = c;
        c.connect();
    });
    $scope.itemsPerPage = 100;
    $scope.getPageRange = function() {
        let pageCnt = Math.ceil($scope.allData.length / $scope.itemsPerPage);
        let res = [];
        for (let i = 0; i < pageCnt; i++) {
            res.push(i + 1);
        }
        return res;
    }
    $("#results_table, #object_properties_table").on("click", (e) => {
        let t = $(e.target);
        if (t.hasClass("pk-value")) {
            let pk = t.html();
            $scope.openObject(pk);
        }
    });
    $scope.setPage = function(idx) {
        $scope.pageIdx = idx;
        $scope.data = $scope.allData.slice(idx * $scope.itemsPerPage,
            idx * $scope.itemsPerPage + $scope.itemsPerPage);
        let el = $("#results_table");
        let html = getHtmlTable($scope.headers, $scope.data, "results-table");
        el.html(html);
    }
    conn.addListener("loadObjectDone", (table, fsql, params) => {
        $scope.objType = params.typeName;
        $scope.objPk = params.pk;
        let objTable = [];
        for (let i = 0; i < table.headers.length; i++) {
            objTable.push([{text: table.headers[i].caption}, table.data[0][i]]);
        }
        let el = $("#object_properties_table");
        let html = getHtmlTable(null, objTable, "results-table");
        el.html(html);
        $scope.showObjectPanel = true;
        $scope.$apply();
    });

    conn.addListener("fsqlDone", (table, fsql, params) => {
        $(".js-execute-btn").button("success");
        $scope.headers = table.headers;
        $scope.allData = table.data;
        $scope.setPage(0);
        $scope.pageRange = $scope.getPageRange();
        $("#textarea_results").html(getPlainTxt(table.headers, table.data));
        $scope.$apply();
    });
/*
    typeSystem.addListener("getTypeDone", (type) => {
        $scope.objType = type;
        typeSystem.getTypeAttributes(type);
        $scope.$apply();
    });
*/

/*
    typeSystem.addListener("typeInfoDone", (info) => {
        $scope.showObjectPanel = true;
        let attributes = info.attributes;
        let list = attributes.filter((i) => {return ! i.collection}).map((i) => {return i.name});
        let sql = `select {pk} from {${info.name}} where {pk} = '${$scope.objPk}'`;
        conn.execute(sql, {fields: list.join(",")});
        $scope.$apply();
    });
*/

    conn.addListener("typeSystemReady", (types) => {
        FSQLEditorParams.tables = types.reduce(
            (prev, curr) => {prev[curr] = {}; return prev},
        {});
    });

    conn.addListener("catalogsReady", (catalogsAndVersion) => {
        $scope.catalogsAndVersions = catalogsAndVersion;
        $scope.$apply();
    });
    conn.addListener("languagesReady", (languages) => {
            $scope.languages = languages;
            $scope.$apply();
    });

    $scope.execute = function() {
        $scope.headers = [];
        $scope.data = [];
        let sql = sqlEditor.getValue();
        Settings.instance.rememberSql(sql);
        $(".js-execute-btn").button("execute");

        let params = {
            catalogName: $scope.catalog,
            catalogVersion: $scope.version,
            language: $scope.language
        };
        if (settings.refResolving && settings.refResolving.length) {
            params.ref = settings.refResolving.join(" ");
        }
        conn.execute(sql, params);
        $scope.history = settings.sqlHistory;
    }

    $scope.openObject = function(pk) {
        $scope.objPk = pk;
        conn.loadObject(pk);
    }

    $scope.setFSql = function(sql) {
        sqlEditor.setValue(sql);
    }

    $scope.catalog = null;
    $scope.version = null;
    $scope.language = null;
    $scope.getCatalog = function() {
        return $scope.catalog == null ? "Dflt Catalog" : $scope.catalog;
    }
    $scope.getVersion = function() {
        return $scope.version == null ? "Dflt Version" : $scope.version;
    }
    $scope.getLanguage = function() {
        return $scope.language == null ? "Dflt Lang" : $scope.language;
    }
    $scope.selectCatalogVersion = function(catalog, version) {
        $scope.catalog = catalog;
        $scope.version = version;
    }
    $scope.fsqlField = "SELECT {pk} FROM {CMSSite}";
    $scope.showObjectPanel = false;
    $scope.headers = [];
    $scope.data = [];
    $scope.history = settings.sqlHistory.concat();
    $scope.refResolving = settings.refResolving;
    $scope.removeRefResolving = function(idx) {
        $scope.refResolving.splice(idx, 1);
    }
    $scope.addRefResolving = function() {
        $scope.refResolving.push("");
    }
    $scope.saveSettings = function() {
        settings.save();
    }
});