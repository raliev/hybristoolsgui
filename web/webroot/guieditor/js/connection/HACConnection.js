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
        this.emit("connectionSuccess");

        this.executePromise("select {code}, {pk} from {ComposedType}").then((res) => {
            let types = res.table.data.map((row) => row[0].text);
            this.codeToType = res.table.data.reduce(function(o, row, i) {
                o[row[1]] = row[0];
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

    failedLogIn() {
        this.emit("connectionError");
        this.reportError("connection to HAC FAILED");
    }

    executePromise(fsql, params) {
        return new Promise((resolve, reject) => {
            let me = this;
            $.ajax({
               url: this._url + "/console/flexsearch/execute",
               data: {
                    flexibleSearchQuery: fsql,
                    sqlQuery: "",
                    maxCount: 10000,
                    user: this.user,
                    locale: (params ? params.language : null) || "en",
                    commit: false
               },
               type: 'POST',
               dataType: "json",
               contentType: "application/x-www-form-urlencoded",
               headers: {
                    "X-CSRF-TOKEN": this.currentCsrf
               }
            }).then(function(json) {
                let headers = json.headers.map((h) => {return {caption: h}})
                let data = [];
                json.resultList.forEach((row) => {
                    data.push(row.map((r) => {return {text: r}}));
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