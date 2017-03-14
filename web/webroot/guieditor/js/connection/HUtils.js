class HUtils {
    static getTypeCode(pk) {
        if (("" + pk).length < 9) {
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