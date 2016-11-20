guieditorApp.controller('connectionController', function($scope, messageSrvc) {
    $scope.setConnectionName = function(name) {
        $scope.name = name;
        let cs = Settings.instance.getConnectionSettingsByName($scope.name);
        $scope.type = cs.type;
        $scope.currConfig = cs;
    }
    $scope.errors = messageSrvc.getAllErrorMessagesAndClear();
    $scope.connectionName = $scope.name = Settings.instance.connectionName;
    $scope.connections = Settings.instance.connections;
    $scope.setConnectionName($scope.name);

    let constructProperties = function() {
        return {
            type: $scope.type,
            params: $scope.currConfig
        }
    }

    $scope.test = function() {
        var $btn = $(".js-test-button").button("testing");
        let cf = new ConnectionFactory();
        let con = cf.constructConnection(constructProperties());
        con.testAsync().then(() => {
            $btn.button("success");
        }).catch(() => {
            $btn.button("error");
        });
    }

    $scope.save = function() {
        let cf = new ConnectionFactory();
        let p = constructProperties();
        let con = cf.constructConnection(p);
        Settings.saveConnectionSettingsByName($scope.name, p);
        Settings.instance.connectionName = $scope.connectionName = $scope.name;

        Settings.instance.connection = con;
        Settings.instance.save();
    }

    $scope.changeType = function() {
        //$scope.currConfig = configs[$scope.type];
    }

    $scope.addNewConnection = function() {
        let idx = 0;
        let newConnPrefix = "NEW CONNECTION";
        function getNewConnName() {
            return newConnPrefix + (idx == 0 ? "" : + idx);
        }
        while(Settings.instance.getConnectionSettingsByName(getNewConnName())) {
            idx ++;
        }
        Settings.instance.saveConnectionSettingsByName(getNewConnName(), Settings.DEFAULT_LOCAL_HAC);
    }

});