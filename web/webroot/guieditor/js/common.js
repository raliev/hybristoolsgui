function getPlainTxt(headers, data) {
    let str = headers.map(el => el.caption + "\t");
    str.push("\n");
    data.forEach(row => {
        str = str.concat(row.map(c => (c.text + "\t")))
        str.push("\n");
    });
    return str.join("");
}