
/** 
 * Xiên
*/
export class Xien {
    private numbers: Array<number> = [];
    private value: number;
    private unit: number;

    constructor() {
        this.numbers = [];
        this.value = -1;
        this.unit = 1000;
    }

    duplicateData(data){
        data.numbers.forEach(element => {
            this.numbers.push(element);
        });
        this.value = data.value;
        this.unit = data.unit;
    }

    addNumber(n: number) {
        this.numbers.push(n);
    }

    getNumbers(){
        return this.numbers;
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