class FSql extends Observable {
    constructor(serverCfg) {
        super();
        this.serverCfg = serverCfg;
    }

    execute(fsql, params) {
        let data = {query: fsql};
        if (params) {
            $.extend(data, params);
        }
        let url = this.serverCfg.fsqlUrl;
        $.ajax({
            url: url,
            data: data
        }).then((data) => {
            let table = this.serverCfg.convertFsqlResult(data);
            this.emit("fsqlDone", table, fsql, params);
        });
    }



}