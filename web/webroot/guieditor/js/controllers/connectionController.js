guieditorApp.controller('connectionController', function($scope) {
    $scope.url = Settings.instance.connection.params.url;

    let constructProperties = function() {
        return {
            type: "hybristools",
            params: {
                url: $scope.url,
            }
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
});