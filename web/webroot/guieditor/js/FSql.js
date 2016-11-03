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
        if (! params.fields) {
            let fieldsArr = this.getFields(fsql);
            if (fieldsArr && fieldsArr.length > 0) {
                data["fields"] = fieldsArr.join(",");
            }
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

    getFields(fsql) {
        let re = /select(.+)from/ig;
        let arr = re.exec(fsql);
        let fieldsStr = null;
        if (arr && arr.length > 1) {
            fieldsStr = arr[1];
        }
        if (! fieldsStr) {
            return null;
        }
        let fieldsRe = /\{([^}]+)\}/ig;
        let fieldsArr = [];
        let m;
        do {
            m = fieldsRe.exec(fieldsStr);
            if (m) {
                fieldsArr.push(m[1]);
            }
        } while (m);
        return fieldsArr;
    }



}