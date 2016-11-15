class Settings extends Observable {
    constructor() {
        super();
        if (chrome && chrome.storage) {
            this.storage = {
                set: function(key, value) {
                    let o = {};
                    o[key] = value;
                    chrome.storage.sync.set(o);
                },
                get: function(key, fn) {
                    chrome.storage.sync.get(key, fn);
                },
                getAll: function(keys, fn) {
                    chrome.storage.sync.get(keys, fn);
                },
                enabled: true
            };
        } else {
            this.storage = {
                set: function(key, value) {
                    store.set(key, value);
                },

                get: function(key, fn) {
                    fn(store[key]);
                },

                getAll: function(keys, fn) {
                    let result = {};
                    keys.forEach((k) => {
                        let stored = store.get(k);
                        if (stored) {
                            result[k] = stored;
                        }
                    });
                    fn(result);
                },

                enabled: true
            }

        }
        this.sqlHistory = null;
        this.lastSql = null;
        this.refResolving = null;
        this.maxSqlHistory = 10;
        this.init();
    }

    init() {
        if (! this.defaultConnectionSettings) {
            this.defaultConnectionSettings = Settings.DEFAULT_CONNECTION_SETTINGS;
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
            let con;
            try {
                con = cf.constructConnection(this.defaultConnectionSettings);
            } catch (e) {
                con = cf.constructConnection(Settings.DEFAULT_CONNECTION_SETTINGS);
            }
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
        if (! this.storage.enabled) {
            console.error("no local storage");
            return;
        }
        this.storage.set("defaultConnectionSettings", this.defaultConnectionSettings);
        this.storage.set("lastSql", this.lastSql);
        this.storage.set("sqlHistory", this.sqlHistory);
        this.storage.set("refResolving", this.refResolving);
    }

    loadPromise() {
        return new Promise((resolve, reject) => {
                this.storage.getAll(["defaultConnectionSettings", "lastSql", "sqlHistory", "refResolving"], (vObj) => {
                    for (let k in vObj) {
                        this[k] = vObj[k];
                    }
                    resolve();
                });
            }
        );
    }

    load_deprecated() {
        if (! this.storage.enabled) {
            console.error("no local storage");
            return;
        }
        let toApply = ["defaultConnectionSettings", "lastSql", "sqlHistory", "refResolving"];
        toApply.forEach((prop) => {
            let v = this.storage.get(prop);
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

    static get DEFAULT_CONNECTION_SETTINGS() {
        return {
           type: "htools",
           params: {
               url: "https://localhost:9002/tools"
           }
        };
    }
}

