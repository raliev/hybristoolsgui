class Settings extends Observable {
    constructor() {
        super();
        this.sqlHistory = null;
        this.lastSql = null;
        this.refResolving = null;
        this.maxSqlHistory = 10;
        this.load();
        this.init();
    }

    init() {
        if (! this.defaultConnectionSettings) {
            this.defaultConnectionSettings = {
                type: "htools",
                params: {
                    url: "https://localhost:9002/tools"
                }
            };
        }
        if (! this.lastSql) {
            this.lastSql = "SELECT {pk} FROM {CMSSite}";
        }
        if (! this.sqlHistory) {
            this.sqlHistory = [];
        }
        if (! this.refResolving) {
            this.refResolving = ["Category:code,name", "Media:code"];
        }
    }

    get connectionSettings() {
        return this.defaultConnectionSettings;
    }

    get connection() {
        if (! this._con) {
            let cf = new ConnectionFactory()
            let con = cf.constructConnection(this.defaultConnectionSettings);
            this._con = con;
        }
        return this._con;
    }

    set connection (c) {
        if (this._con) {
            this._con.close();
        }
        this._con = c;
        this.emit("reconnect", c);
    }

    save() {
        if (! store.enabled) {
            console.error("no local storage");
            return;
        }
        store.set("defaultConnectionSettings", this.defaultConnectionSettings);
        store.set("lastSql", this.lastSql);
        store.set("sqlHistory", this.sqlHistory);
        store.set("refResolving", this.refResolving);
    }

    load() {
        if (! store.enabled) {
            console.error("no local storage");
            return;
        }
        let toApply = ["defaultConnectionSettings", "lastSql", "sqlHistory", "refResolving"];
        toApply.forEach((prop) => {
            let v = store.get(prop);
            if (v) {
                this[prop] = v;
            }
        });
    }

    rememberSql(sql) {
        this.lastSql = sql;
        if (this.sqlHistory.indexOf(sql) == -1) {
            this.sqlHistory.push(sql);
            if (this.sqlHistory.length > this.maxSqlHistory) {
                this.sqlHistory.splice(0, 1);
            }
        }
        this.save("lastSql");
    }

    static get instance() {
        if (! this._instance) {
            this._instance = new Settings()
        }
        return this._instance;
    }
}

