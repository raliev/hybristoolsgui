class Settings extends Observable {
    constructor() {
        super();
        this.load();
        this.init();
    }

    init() {
        if (! this.defaultConnectionSettings) {
            this.defaultConnectionSettings = {
                type: "hybristools",
                params: {
                    url: "https://localhost:9002/tools"
                }
            };
        }
        if (! this.lastSql) {
            this.lastSql = "SELECT {pk} FROM {CMSSite}";
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
        this._con.close();
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
    }

    load() {
        if (! store.enabled) {
            console.error("no local storage");
            return;
        }
        let toApply = ["defaultConnectionSettings", "lastSql"];
        toApply.forEach((prop) => {
            let v = store.get(prop);
            if (v) {
                this[prop] = v;
            }
        });
    }

    rememberSql(sql) {
        this.lastSql = sql;
        this.save("lastSql");
    }

    static get instance() {
        if (! this._instance) {
            this._instance = new Settings()
        }
        return this._instance;
    }
}

