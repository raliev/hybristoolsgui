/**
 * @event typeSystemReady
 **/
class ToolsConnection extends Observable {
    constructor(cfg) {
        super();
        this._url = cfg.url;
    }

    get type() {
        return "htools";
    }

    init() {
        let url = this.fsqlUrl;
        $.ajax({
            url: url,
            data: {query: "select {code} from {ComposedType}"}
        }).then((data) => {
            let table = this.convertFsqlResult(data);
            let types = table.data.map((row) => row[0].text);
            this.emit("typeSystemReady", types);
        });

        $.ajax({
            url: url,
            data: {query: "SELECT {pk} FROM {CatalogVersion}"}
        }).then((data) => {
            let table = this.convertFsqlResult(data);
            this.emit("catalogsReady", table.data);
        });

        $.ajax({
            url: url,
            data: {query: "SELECT {pk} FROM {Language}"}
        }).then((data) => {
            let table = this.convertFsqlResult(data);
            this.emit("languagesReady", table.data);
        });
        this.inited = true;
        this.emit("connectionSuccess", this.availableOptions);
    }

    get url () {
        return this._url;
    }

    get params () {
        return {
            url: this._url
        }
    }

    get fsqlUrl () {
        return this.url + "/flexiblesearch/execute/";
    }

    getTypeDescriptionUrl (type) {
        return this.url + "/typesystem/type/" + type + "/attributes";
    }

    getObjectTypeUrl (pk) {
        return this.url + "/typesystem/pk/" + pk;
    }

    getTypeInfoUrl(type) {
        return this.url + "/typesystem/type/" + type + "/attributes"
    }

    getTypePromise(pk) {
        return new Promise((resolve, reject) => {
            let url = this.getObjectTypeUrl(pk);
            $.ajax({
                url: url
            }).then((data) => {
                let type = this.convertGetTypeResult(data);
                resolve(type);
            });
        });
    }

    getTypeAttributesPromise(type) {
        return new Promise((resolve, reject) => {
            let url = this.getTypeInfoUrl(type);
            $.ajax({
                url: url
            }).then((data) => {
                let type = this.convertTypeInfo(data);
                resolve(type);
            });
        });
    }

    loadObject(pk) {
        this.getTypePromise(pk).then((type) => {
            return this.getTypeAttributesPromise(type);
        }).then((info) => {
            let attributes = info.attributes;
            let list = attributes.filter((i) => {return ! i.collection}).map((i) => {return i.name});
            let sql = `select {pk} from {${info.name}} where {pk} = '${pk}'`;
            this.executePromise(sql, {fields: list.join(",")}).then((res) => {
                this.emit("loadObjectDone", res.table, res.fsql, res.params);
            });
        });
    }

    /**
     * @return object with properties:
     *  - headers
     *      [{caption},..]
     *  - data
     *      [[{text},{text}], [..]]
     */
    convertFsqlResult(raw) { //convert from raw text
        let lines = raw.split('\n');
        let headers = lines[0].split('\t');
        let data = [];
        let maxColumns = 0;
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            let row = line.split('\t').map((i) => {
                let typeCode = HUtils.getTypeCode(i);
                return {text: i, type: typeCode != -1 ? "pk" : "string"}
            });
            maxColumns = maxColumns > row.length ? maxColumns : row.length;
            data.push(row);
        }
        for (let i = headers.length; i < maxColumns; i++) {
            headers.push("-");
        }
        headers = headers.map((i) => {return {caption: i}});
        return {
            headers: headers,
            data: data
        }
    }

    convertGetTypeResult(raw) {
        return raw;
    }

    convertTypeInfo(raw) {
        let lines = raw.split('\n');
        let collectAttrs = false;
        let attributes = [];
        let typeName = null;
        for (let i = 0; i < lines.length; i++) {
            let l = lines[i];
            if (l.startsWith("Type: ")) {
                typeName = l.split(":")[1].trim();
            }
            if (l.startsWith(" *")) {
                collectAttrs = true;
                continue;
            }
            if (! collectAttrs) {
                continue;
            }
            let cols = l.split('\t');
            if (cols[0] == "classificationIndexString") { //TODO analyze deeply
                continue;
            }
            let attr = {
                name: cols[0],
                type: cols[1],
                collection: cols[1].endsWith("Coll") || cols[1].endsWith("List") //TODO analyze deeply
            };
            attributes.push(attr);
        }
        return {
            name: typeName,
            attributes: attributes
        }
    }

    testAsync() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this._url
            }).then((data) => {
                if (data && data.indexOf("hybristoolsserver") != -1) {
                    resolve();
                } else {
                    reject();
                }
            }, (data) => {
                console.error(data);
                reject(data);
            });
        });
    }

    close() {

    }

    connect() {
        if (! this.inited) {
            this.init();
        }
    }

    execute(fsql, params) {
        this.executePromise(fsql, params).then((res) => {
            this.emit("fsqlDone", res.table, res.fsql, res.params);
        })
    }

    executePromise(fsql, params) {
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

        let url = this.fsqlUrl;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                data: data
            }).then((data) => {
                let table = this.convertFsqlResult(data);
                resolve({
                    table: table,
                    fsql: fsql,
                    params: params});
            });
        })
    }

    get availableOptions() {
        return {
            catalog: true,
            language: true,
            ref: true
        };
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