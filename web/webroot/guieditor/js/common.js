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

function getHtmlTable(headers, data) {
    let res = [];
    res.push("<table class='table'>");
    res.push("<tr>");
        headers.forEach(h => {
            res.push("<th>");
            res.push(h.caption);
            res.push("</th>");
        });
    res.push("</tr>");
    data.forEach(row => {
        res.push("<tr>");
        row.forEach(c => {
            res.push("<td>");
            res.push(c.text);
            res.push("</td>");
        });
        res.push("</tr>");
    });
    res.push("</table>");
    return res.join("");
}