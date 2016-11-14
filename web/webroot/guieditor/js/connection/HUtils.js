class HUtils {
    static getTypeCode(pk) {
        let l = parseInt(pk, 10);
        if (! l) {
            return -1;
        }
        let res = l & 32767l;
        return res;
    }
}