class HUtils {
    static getTypeCode(pk) {
        pk = "" + pk;
        let pkTest = /^[1-9]\d{8,}$/i;
        if (! pkTest.test(pk)) {
            return -1;
        }
        let l = parseInt(pk, 10);
        if (! l) {
            return -1;
        }
        let res = l & 32767;
        return res;
    }
}