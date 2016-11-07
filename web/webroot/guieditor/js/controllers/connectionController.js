guieditorApp.controller('connectionController', function($scope) {
    let cs = Settings.instance.defaultConnectionSettings;
    let htoolsUrl = "https://localhost:9002/tools";
    let hacUrl = "https://localhost:9002/hac";
    let htoolsDefCfg = {
        url: "https://server1:9002/tools",
        type: "htools"
    }
    let hacDefCfg = {
        url: "https://server2:9002/hac",
        type: "htools",
        login: "admin",
        password: "nimda",
        user: "admin"
    }
    let configs = {
        "hac": hacDefCfg,
        "htools": htoolsDefCfg
    }
    if (cs) {
        $scope.type = cs.type;
    } else {
        $scope.type = "htools";
    }
    $scope.currConfig = configs[$scope.type];
    if (cs) {
        $.extend($scope.currConfig, cs.params);
    }

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
        Settings.instance.defaultConnectionSettings = p;
        Settings.instance.connection = con;
        Settings.instance.save();
    }

    $scope.changeType = function() {
        $scope.currConfig = configs[$scope.type];
    }
});