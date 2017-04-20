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
                setAllPromise: function(obj) {
                    return new Promise(function(resolve, reject) {
                        chrome.storage.sync.set(obj, resolve);
                    });
                },
                enabled: true
            };
        } else {
            this.storage = {
                set: function(key, value) {
                    store.set(key, value);
                },
                setAllPromise: function(obj) {
                    return new Promise(function(resolve, reject) {
                        for(let k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                store.set(k, obj[k]);
                            }
                        }
                        resolve();
                    });
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
        this.queries = null;
        this.lastSql = null;
        this.refResolving = null;
        this.maxSqlHistory = 10;
        this.connectionName = "Default local hac";
        this.connections = {
            "Default local hac": Settings.DEFAULT_LOCAL_HAC,
            "Default local tools": {
                url: "https://server1:9002/tools",
                type: "htools"
            }
        };
        this.init();
    }

    init() {
        if (! this.lastSql) {
            this.lastSql = "SELECT {pk} FROM {CMSSite}";
        }
        if (! this.sqlHistory) {
            this.sqlHistory = [];
        }
        if (! this.refResolving) {
            this.refResolving = ["Category:code,name", "Media:code"];
        }
        if (! this.queries) {
            this.queries = {};
        }
    }

    get connectionSettings() {
        return this.defaultConnectionSettings;
    }

    getConnectionSettingsByName(name) {
        return this.connections[name] || this.DEFAULT_LOCAL_HAC
    }

    saveConnectionSettingsByName(name, cfg) {
        this.connections[name] = cfg;
    }

    get connection() {
        if (! this._con) {
            let cf = new ConnectionFactory()
            let con;
            try {
                con = cf.constructConnection(this.getConnectionSettingsByName(this.connectionName));
            } catch (e) {
                con = cf.constructConnection(Settings.DEFAULT_LOCAL_HAC);
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

    saveAllPromise() {
        if (! this.storage.enabled) {
            console.error("no local storage");
            return;
        }
        return this.storage.setAllPromise({
            "connectionName": this.connectionName,
            "connections": this.connections,
            "lastSql": this.lastSql,
            "sqlHistory": this.sqlHistory,
            "refResolving": this.refResolving,
            "queries": this.queries
        });
    }

    save() {
        this.saveAllPromise();
    }

    loadPromise() {
        return new Promise((resolve, reject) => {
                this.storage.getAll(["connectionName", "connections", "lastSql", "sqlHistory", "refResolving", "queries"], (vObj) => {
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

    saveQuery(name, sql) {
        this.queries[name] = sql;
        this.save("queries");
    }

    deleteQuery(name) {
        delete this.queries[name];
    }

    getQuery(name) {
        return this.queries[name];
    }

    static get instance() {
        if (! this._instance) {
            this._instance = new Settings()
        }
        return this._instance;
    }

    static get DEFAULT_LOCAL_HAC() {
        return {
            url: "https://server2:9002/hac",
            type: "hac",
            login: "admin",
            password: "nimda",
            user: "admin"
        };
    }

    static get DEFAULT_NEW_CONNECTION_NAME() {
        return "New connection";
    }
}

