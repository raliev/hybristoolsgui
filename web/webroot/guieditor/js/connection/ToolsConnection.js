/**
 * @event typeSystemReady
 **/
class ToolsConnection extends Observable {
    constructor(cfg) {
        super();
        this._url = cfg.url;
        this.init();
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


    convertFsqlResult(raw) { //convert from raw text
        let lines = raw.split('\n');
        let headers = lines[0].split('\t');
        let data = [];
        let maxColumns = 0;
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            let row = line.split('\t').map((i) => {return {text: i}});
            row[row.length - 1].type = "pk"; //consider last column as a pk
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

    close() {}

}