
/** 
 * Đề
*/
export class Db {
    private number: number;
    private value: number;
    private unit: number;

    constructor() {
        this.number = -1;
        this.value = -1;
        this.unit = 1000;
    }

    duplicateData(data){
        this.number = data.number;
        this.value = data.value;
        this.unit = data.unit;
    }

    setNumber(n: number) {
        this.number = n;
    }

    getNumber(){
        return this.number;
    }

    setValue(v: number) {
        this.value = v;
    }

    getValue(){
        return this.value;
    }

    /**
     * 
     * @param u Số tiền (Đơn vị: VND)
     */
    setUnit(u: number) {
        this.unit = u;
    }

}