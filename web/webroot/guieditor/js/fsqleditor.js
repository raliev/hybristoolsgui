function createFSQLEditor(textareaDom) {
    let res = CodeMirror.fromTextArea(textareaDom, {
            mode : "text/x-mariadb",
            indentWithTabs : true,
            smartIndent : true,
            lineNumbers : true,
            matchBrackets : true,
            autofocus : true,
            extraKeys : {
                "Ctrl-Space" : "autocomplete"
            },
            hintOptions : {
                tables : {
                    users : {
                        name : null,
                        score : null,
                        birthDate : null
                    },
                    countries : {
                        name : null,
                        population : null,
                        size : null
                    }
                }
            }
        });
    return res;
}