class TypeSystem extends Observable {
    constructor(serverCfg) {
        super();
        this.serverCfg = serverCfg;
    }

    getType(pk) {
        let url = this.serverCfg.getObjectTypeUrl(pk);
        $.ajax({
            url: url
        }).then((data) => {
            let type = this.serverCfg.convertGetTypeResult(data);
            this.emit("getTypeDone", type);
        });
    }

    getTypeAttributes(type) {
        let url = this.serverCfg.getTypeInfoUrl(type);
        $.ajax({
            url: url
        }).then((data) => {
            let type = this.serverCfg.convertTypeInfo(data);
            this.emit("typeInfoDone", type);
        });

    }
}