class ConnectionFactory {
    constructor() {
        this._drivers = {
            "hybristools":  {
                cls: ToolsConnection,
                params: ["url"]
            }
        }
    }

    get drivers () {
        return this._drivers.keys();
    }

    /**
     * Construct connection based on the specified settings.
     * @config type string type of the connection.
     * @config params map with parameter settings.
     *
     */
    constructConnection(cfg) {
        let driver = this._drivers[cfg.type];
        let connection = new driver.cls(cfg.params);
        return connection;
    }

}