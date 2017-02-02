function getPlainTxt(headers, data) {
    let res = [];
        headers.forEach(h => {
            res.push(h.caption);
            res.push("\t");
        });
    res.push("\n");
    data.forEach(row => {
        row.forEach(c => {
            res.push(c.text);
            res.push("\t");
        });
        res.push("\n");
    });
    return res.join("");
}

function getHtmlTable(headers, data, cls) {
    let res = [];
    res.push(`<table class='table ${cls}'>`);
    if (headers) {
        res.push("<tr>");
            headers.forEach(h => {
                res.push("<th>");
                res.push(h.caption);
                res.push("</th>");
            });
        res.push("</tr>");
    }
    data.forEach(row => {
        res.push("<tr>");
        row.forEach(c => {
            res.push("<td>");
            if (! c) {
                res.push("[blank]");
            } else if (c.type == "pk") {
                res.push("<span class='glyphicon pk'></span>");
                res.push("<span class='pk-value'>");
                res.push(c.text);
                res.push("</span>");
            } else {
                res.push(c.text);
            }

            if (c && c.typeName) {
                res.push("<span class='type-name'>");
                res.push(c.typeName);
                res.push("</span>");
            }
            res.push("</td>");
        });
        res.push("</tr>");
    });
    res.push("</table>");
    return res.join("");
}

function printStacktrace() {
  var stack = new Error().stack;
  console.log( stack );
}