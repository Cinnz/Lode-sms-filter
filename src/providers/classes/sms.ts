import { Lo } from './ketqua/lo';
import { Db } from './ketqua/db';
import { Xien } from './ketqua/xien';
import { XienQuay } from './ketqua/xien-quay';

export class Sms {
    id: number;
    address: string;
    phoneNumber: string;
    content: string;
    fixedContent: string;
    time: number;
    lo: Array<Lo> = [];
    db: Array<Db> = [];
    xien: Array<Xien> = [];
    xienQuay: Array<XienQuay> = [];

    constructor() {
        this.id = -1;
        this.address = "";
        this.phoneNumber = "";
        this.content = "";
        this.fixedContent = "";
        this.time = 0;
    }

    onResponseData(data) {
        this.id = data._id;
        this.address = data.address;
        this.phoneNumber = data.service_center;
        this.content = data.body;
        this.fixedContent = data.body;
        this.time = data.date_sent;
    }

    duplicateData(data) {
        this.id = data.id;
        this.address = data.address;
        this.phoneNumber = data.phoneNumber;
        this.content = data.content;
        this.fixedContent = data.fixedContent;
        this.time = data.time;
        data.lo.forEach(element => {
            let lo = new Lo();
            lo.duplicateData(element);

            this.lo.push(lo);
        });
        data.db.forEach(element => {
            let db = new Db();
            db.duplicateData(element);

            this.db.push(db);
        });
        data.xien.forEach(element => {
            let xien = new Xien();
            xien.duplicateData(element);

            this.xien.push(xien);
        });
        data.xienQuay.forEach(element => {
            let xq = new XienQuay();
            xq.duplicateData(element);

            this.xienQuay.push(xq);
        });
    }

    editFixedContent(content: string){
        this.fixedContent = content;
    }

    addLo(lo: Lo) {
        this.lo.push(lo);
    }

    addDb(db: Db) {
        this.db.push(db);
    }

    addXien(xien: Xien) {
        this.xien.push(xien);
    }

    addXienQuay(xq: XienQuay) {
        this.xienQuay.push(xq);
    }

    reset(){
        this.lo = [];
        this.db = [];
        this.xien = [];
        this.xienQuay = [];
    }
}