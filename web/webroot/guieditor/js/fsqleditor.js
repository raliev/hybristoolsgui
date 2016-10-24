var sqlKeywords = "alter and as asc between by count create delete desc distinct drop from group having in insert into is join like not on or order select set table union update values where limit ";
  // turn a space-separated list into an array
  function set(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }

  CodeMirror.defineMIME("text/x-fsql", {
    name: "sql",
    client: set("charset clear connect edit ego exit go help nopager notee nowarning pager print prompt quit rehash source status system tee"),
    keywords: set(sqlKeywords),
    builtin: set("bool boolean bit blob decimal double float long longblob longtext medium mediumblob mediumint mediumtext time timestamp tinyblob tinyint tinytext text bigint int int1 int2 int3 int4 int8 integer float float4 float8 double char varbinary varchar varcharacter precision date datetime year unsigned signed numeric"),
    atoms: set("false true null unknown"),
    operatorChars: /^[{}*+\-%<>!=&|^]/,
    dateSQL: set("date time timestamp"),
    support: set("ODBCdotTable decimallessFloat zerolessFloat binaryNumber hexNumber doubleQuote nCharCast charsetCast commentHash commentSpaceRequired")
//    hooks: {
//    ,
//      "@":   hookVar,
//      "`":   hookIdentifier,
//      "\\":  hookClient
//    }
  });


let FSQLEditorParams = {
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
};
function createFSQLEditor(textareaDom) {

    let res = CodeMirror.fromTextArea(textareaDom, {
            mode : "text/x-fsql",
            indentWithTabs : true,
            smartIndent : true,
            lineNumbers : true,
            matchBrackets : true,
            autofocus : true,
            extraKeys : {
                "Ctrl-Space" : "autocomplete"
            },
            hintOptions : FSQLEditorParams
        });
    return res;
}
