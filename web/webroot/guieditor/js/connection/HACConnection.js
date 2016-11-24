class HACConnection extends Observable {
    constructor(cfg) {
        super();
        this._url = cfg.url;
        this.login = cfg.login;
        this.password = cfg.password;
        this.user = cfg.user || "admin",
        this.currentCsrf = null;
        this.inited = false;
    }

    get type() {
        return "hac";
    }


    reportError(er) {
        console.error(er);
        this.emit("connectionError");
    }

    init() {
/*
var login = "admin";
var password = "nimda";
var url = "https://localhost:9002/hac";
*/
        let login = this.login || "admin";
        let password = this.password || "nimda";
        let url = this._url;
        let reportError = this.reportError;
        let debug = function(m) {
            console.log(m);
        }
        let me = this;
        function loadLogin() {
            debug("login form load")
            return $.ajax({
                url: url + "/login.jsp",
                type: "GET",
                dataType: "html"
            });
        }

        function doLogin(htmlForm) {
            let csrfRe = /<input type="hidden"[\s.]*name="_csrf"[\s.]*value="([^"]+)"/gm;
            let m = csrfRe.exec(htmlForm);
            if (! m) {
                reportError("Incorrect login form. Check hybris/hac version.");
                return null;
            }
            let csrf = m[1];
            return $.ajax({
               url: url + "/j_spring_security_check",
               data: `j_username=${login}&j_password=${password}&_csrf=${csrf}`,
               type: 'POST',
               dataType: "html",
               contentType: "application/x-www-form-urlencoded"
           });
        }

        function checkLoginCorrect(html) {
            if (html.indexOf('<div id="loginInfo">') != -1) {
                me.loggedIn(html);
            } else {
                me.failedLogIn(html);
            }
        }

        loadLogin().then(doLogin).then(checkLoginCorrect).catch((data) => {
            if (data && data.status == 404) {
                this.reportError("No page found. Doublecheck URL provided, make sure that HAC login form is opened at URL/login.jsp.");
            } else {
                this.emit("connectionError");
            }

        });
        this.inited = true;
    }


    loggedIn(html) {
        console.log("connection to HAC established");
        let csrfRe = /<meta name="_csrf" content="([^"]+)"/gm;
        let m = csrfRe.exec(html);
        if (! m) {
            this.reportError("Incorrect main page. Check hybris/HAC version.");
            this.failedLogIn(html);
        }
        this.currentCsrf = m[1];
        this.emit("connectionSuccess", this.availableOptions);

        this.executePromise("SELECT internalcode, itemtypecode FROM composedtypes", {sql: true}).then((res) => {
            let types = res.table.data.map((row) => row[0].text);
            this.codeToType = res.table.data.reduce(function(prev, curr, index, arr) {
                prev[curr[1].text] = curr[0].text; return prev;
            }, {});
            this.emit("typeSystemReady", types);
        });
        this.executePromise(`select {c.id}, {v.version} from {
                             Catalog AS c
                             JOIN CatalogVersion AS v on {v.catalog} = {c.pk}
                             }`).then((res) => {
            this.emit("catalogsReady", res.table.data);
        });
        this.executePromise("SELECT {isocode} FROM {Language}").then((res) => {
            this.emit("languagesReady", res.table.data);
        });
    }

    get availableOptions() {
        return {
            catalog: false,
            language: true,
            ref: false
        };
    }

    failedLogIn() {
        this.emit("connectionError");
        this.reportError("connection to HAC FAILED");
    }

    executePromise(fsql, params) {
        return new Promise((resolve, reject) => {
            let me = this;
            let data = {};
            if (params && params.sql) {
                data.sqlQuery = fsql;
            } else {
                data.flexibleSearchQuery = fsql;
            }
            $.extend(data, {
               maxCount: 10000,
               user: this.user,
               locale: (params ? params.language : null) || "en",
               commit: false
            });
            $.ajax({
               url: this._url + "/console/flexsearch/execute",
               data: data,
               type: 'POST',
               dataType: "json",
               contentType: "application/x-www-form-urlencoded",
               headers: {
                    "X-CSRF-TOKEN": this.currentCsrf
               }
            }).then(function(json) {
                if (json.exception) {
                    me.emit("error", json.exception.message);
                    console.error(json.exception.message);
                    //TODO handle error
                    reject(json.exceptionStackTrace);
                    return;
                }

                let headers = json.headers.map((h) => {return {caption: h}})
                let data = [];
                let pkTest = /^\d{5,}$/i;
                json.resultList.forEach((row) => {
                    data.push(row.map((c) => {
                        if (me.codeToType && pkTest.test(c)) {
                            let typeCode = HUtils.getTypeCode(c);
                            let typeName = me.codeToType[typeCode];
                            if (typeCode != -1 && typeName) {
                                return {
                                    text: c,
                                    type: "pk",
                                    typeCode: typeCode,
                                    typeName: typeName
                                }
                            }
                        } else {
                            return {text: c}
                        }

                    }));
                });
                resolve({
                    table: {headers: headers,data: data},
                    fsql: fsql,
                    params: params
                });
            });
        });
    }

    execute(fsql, params) {
        this.executePromise(fsql, params).then((res) => {
            this.emit("fsqlDone", res.table, res.fsql, res.params)
        });
    }

    loadObject(pk) {
        let typeCode = HUtils.getTypeCode(pk);
        let typeName = this.codeToType[typeCode];
        console.log(typeCode + " " + typeName);
        let fsql = `SELECT * FROM {${typeName}*} WHERE {pk} = '${pk}'`;
        this.executePromise(fsql).then(res => {
            res.params = {};
            res.params.objectResult = true;
            res.params.typeName = typeName;
            res.params.pk = pk;
            this.emit("loadObjectDone", res.table, res.fsql, res.params);
        });
    }

    testAsync() {
        return new Promise((resolve, reject) => {
            this.init();
            this.addListener("connectionSuccess", () => {
                resolve();
            });
            this.addListener("connectionError", () => {
                reject();
            });
        });
    }

    close() {
        //
    }

    connect() {
        if (! this.inited) {
            this.init();
        }
    }


}