class FSql extends Observable {
    constructor(con) {
        super();
        this.con = con;
    }

    set connection(c) {
        this.con = c;
    }




}