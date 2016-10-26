class FSql extends Observable {
    constructor(con) {
        super();
        this.con = con;
    }

    set connection(c) {
        this.con = c;
    }

    execute(fsql, params) {
        let data = {query: fsql};
        if (params) {
            $.extend(data, params);
        }
        if (! data.catalogName) {
            delete data.catalogName;
        }
        if (! data.catalogVersion) {
            delete data.catalogVersion;
        }
        if (! data.language) {
            delete data.language;
        }
        let url = this.con.fsqlUrl;
        $.ajax({
            url: url,
            data: data
        }).then((data) => {
            let table = this.con.convertFsqlResult(data);
            this.emit("fsqlDone", table, fsql, params);
        });
    }



}