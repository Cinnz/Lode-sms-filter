import { Utils } from '../app-utils';
/** 
 * Quy ước để lọc số lô, đề từ tin nhắn
*/
export class SmsSyntax {
    id: string;
    name: string;
    keys: Array<string> = [];
    regexp: Array<RegExp> = [];

    generalRegexp: RegExp;

    constructor() {
        this.id = "";
        this.name = "";
        this.generalRegexp = new RegExp("");
    }

    onResponseData(data) {
        this.id = data.id;
        this.name = data.name;

        let regkey = "";
        data.keys.forEach(element => {
            let key = element.toLowerCase();
            key = Utils.bodauTiengViet(key);

            regkey += key + "|"
            this.keys.push(key);
            this.regexp.push(new RegExp("(" + key + ")", "g"));
        });
        regkey = regkey.slice(0, regkey.length - 1);


        this.generalRegexp = new RegExp(regkey, "g");
    }
}