class TypeSystem extends Observable {
    constructor(con) {
        super();
        this.con = con;
    }

    set connection(c) {
        this.con = c;
    }

    getType(pk) {
        let url = this.con.getObjectTypeUrl(pk);
        $.ajax({
            url: url
        }).then((data) => {
            let type = this.con.convertGetTypeResult(data);
            this.emit("getTypeDone", type);
        });
    }

    getTypeAttributes(type) {
        let url = this.con.getTypeInfoUrl(type);
        $.ajax({
            url: url
        }).then((data) => {
            let type = this.con.convertTypeInfo(data);
            this.emit("typeInfoDone", type);
        });

    }
}