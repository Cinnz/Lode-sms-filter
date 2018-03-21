import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import { Utils } from '../app-utils';

import { Sms } from '../classes/sms';
import { SmsSyntax } from '../classes/sms-syntax';
import { Lo } from '../classes/ketqua/lo';
import { Db } from '../classes/ketqua/db';
import { Xien } from '../classes/ketqua/xien';
import { XienQuay } from '../classes/ketqua/xien-quay';
import { KetQuaCmd } from '../ketqua/ketqua-cmd';

@Injectable()
export class SmsModule {

  mSmsSyntax: Array<SmsSyntax> = [];
  fullSyntax = "";
  mMoneyUnits: Array<string> = [];
  mJoinCharaters: Array<string> = [];
  mSmS: Array<Sms> = [];
  resultSmS: Array<Sms> = [];

  constructor(public http: Http) {
    this.getDataConfig();
  }

  getDataConfig() {
    this.http.request("assets/data/sms.json").subscribe((data) => {
      this.setSmsSyntax(JSON.parse(data['_body']).syntax);
      this.setMoneyUnit(JSON.parse(data['_body']).units);
      this.setJoinCharacters(JSON.parse(data['_body']).join_char);
    });
  }

  setSmsSyntax(syntax) {
    syntax.forEach(element => {
      let smsSyntax = new SmsSyntax();
      smsSyntax.onResponseData(element);

      this.mSmsSyntax.push(smsSyntax);

      smsSyntax.keys.forEach(key => {
        this.fullSyntax += key + "|";
      });
    });

    this.fullSyntax = this.fullSyntax.slice(0, this.fullSyntax.length - 1);
  }

  setMoneyUnit(unit) {
    unit.forEach(element => {
      this.mMoneyUnits.push(element);
    });
  }

  setJoinCharacters(characters) {
    characters.forEach(element => {
      this.mJoinCharaters.push(element);
    });
  }

  getSmsSyntax() {
    return this.mSmsSyntax;
  }

  getSmS() {
    return this.mSmS;
  }

  clearSms() {
    this.mSmS = [];
  }

  addSms(sms: Sms) {
    this.onAddSms(sms);
    this.mSmS.push(sms);
  }

  unshiftSms(sms: Sms) {
    this.onAddSms(sms);
    this.mSmS.unshift(sms);
  }

  getResultSms() {
    return this.resultSmS;
  }

  onAddSms(sms: Sms) {
    this.onDataProcessing(sms)
  }

  onDataProcessing(sms: Sms) {
    let lower = Utils.bodauTiengViet(sms.fixedContent.toLowerCase());

    let datas = [];
    sms.reset();
    let current = lower;

    // Tách SMS thành các phần tương ứng với các loại lô, đề, xiên
    for (let i = 0; i < this.mSmsSyntax.length; i++) {
      let syntax = this.mSmsSyntax[i];

      let blocks = current.split(syntax.generalRegexp);

      if (blocks.length > 0) {
        current = blocks[0];
        for (let j = 1; j < blocks.length; j++) {
          let block = blocks[j];

          let parts = block.match(this.fullSyntax);

          let obj = {
            id: syntax.id,
            name: syntax.name,
            data: ""
          };

          if (parts) {
            current += block.slice(parts.index, block.length);
            obj.data = block.slice(0, parts.index);
          }
          else {
            obj.data = block;
          }

          datas.push(obj);
          this.onGetNumber(obj, sms);
        }
      }
    }
  }

  /**
   * Tách số và tiền ra
   */
  onGetNumber(obj, sms: Sms) {
    let patt = /[\d \, \. \-]+([x] |[x])\d+/g;

    // vd: 57, 68 x 3
    let clusters = obj.data.match(patt);

    if (clusters && clusters.length > 0) {

      clusters.forEach(element => {
        element = element.substring(element.match(/[\d]/).index);

        element = element.trim();
        let numberContainer = element.split(/[x] |[x]/)[0].trim();
        let value = element.split(/[x] |[x]/)[1];

        numberContainer = numberContainer.trim();

        if (obj.id == KetQuaCmd.LO_ID) {
          let numbers = numberContainer.match(/\d+/g);
          numbers.forEach(element => {
            let lo = new Lo();

            lo.setNumber(parseInt(element, 10));
            lo.setValue(parseInt(value, 10));

            sms.addLo(lo);
          });
        }
        else if (obj.id == KetQuaCmd.DB_ID) {
          let numbers = numberContainer.match(/\d+/g);
          numbers.forEach(element => {
            let db = new Db();

            db.setNumber(parseInt(element, 10));
            db.setValue(parseInt(value, 10));

            sms.addDb(db);
          });
        }
        /**
         * Lô xiên, xâu input phải có ít nhất 4 ký tự vì xiên nhỏ nhất là xiên 2
         * vd: 23.45
         */
        else if (obj.id == KetQuaCmd.XIEN_ID && numberContainer.length > 3) {
          let firstNumber = numberContainer.match(/\d+/);
          let secondNumber = numberContainer.substring(firstNumber.index + 2, numberContainer.length).match(/\d+/);
          /** 
           * ký tự tách giữa các con số trong cùng 1 nhóm
           * vd: 23.34, 56.78 => '.'
          */
          let splitUnit = numberContainer.substring(firstNumber.index + 2, secondNumber.index + firstNumber.index + 2);

          let splitPartUnit = "";

          for (let i = firstNumber.index; i < numberContainer.length; i++) {
            let isNan = isNaN(parseInt(numberContainer[i]));
            if (splitPartUnit && !isNan) {
              break;
            }
            else if ((numberContainer[i] != splitUnit && isNan)) {
              splitPartUnit += numberContainer[i];
            }
          }

          if (splitPartUnit.length > 0) {
            let parts = numberContainer.split(new RegExp(splitPartUnit, "g"));
            if (parts && parts.length > 0) {
              parts.forEach(element => {
                let numbers = element.match(/\d+/g);
                let xien = new Xien();

                // Xiên tối thiểu có 2 số
                if (numbers && numbers.length >= 2) {
                  numbers.forEach(element => {
                    xien.addNumber(parseInt(element, 10));
                  });
                  xien.setValue(parseInt(value, 10));
                  sms.addXien(xien);
                }
              });
            }
          }
          else {
            let xien = new Xien();
            let numbers = numberContainer.match(/\d+/g);

            if (numbers && numbers.length >= 2) {
              numbers.forEach(number => {
                xien.addNumber(parseInt(number, 10));
              });
              xien.setValue(parseInt(value, 10));

              sms.addXien(xien);
            }
          }
        }
        /**
         * Lô xiên quay, xâu input phải có ít nhất 6 ký tự vì xiên quay tối thiểu là gồm 3 số
         * vd: 23.45.56
         */
        else if (obj.id == KetQuaCmd.XIENQUAY_ID && numberContainer.length >= 6) {
          let firstNumber = numberContainer.match(/\d+/);
          let secondNumber = numberContainer.substring(firstNumber.index + 2, numberContainer.length).match(/\d+/);
          /** 
           * ký tự tách giữa các con số trong cùng 1 nhóm
           * vd: 23.34, 56.78 => '.'
          */
          let splitUnit = numberContainer.substring(firstNumber.index + 2, secondNumber.index + firstNumber.index + 2);

          let splitPartUnit = "";

          for (let i = firstNumber.index; i < numberContainer.length; i++) {
            let isNan = isNaN(parseInt(numberContainer[i]));
            if (splitPartUnit && !isNan) {
              break;
            }
            else if ((numberContainer[i] != splitUnit && isNan)) {
              splitPartUnit += numberContainer[i];
            }
          }

          if (splitPartUnit.length > 0) {
            /**
             * Tách thành các nhóm
             * vd: 23.34, 56.78 => '23.34' và '56.78
             */
            let parts = numberContainer.split(new RegExp(splitPartUnit, "g"));

            if (parts && parts.length > 0) {
              parts.forEach(element => {
                /**
                 * Tách số từ nhóm
                 * vd: 23.34 => 23 và 34
                 */
                let numbers = element.match(/\d+/g);
                let xien = new XienQuay();

                // Xiên quay tối thiểu có 3 số
                if (numbers && numbers.length >= 3) {
                  numbers.forEach(element => {
                    xien.addNumber(parseInt(element, 10));
                  });
                  xien.setValue(parseInt(value, 10));
                  sms.addXienQuay(xien);
                }
              });
            }
          }
          // Trường hợp có 1 nhóm số duy nhất
          else {
            let numbers = numberContainer.match(/\d+/g);
            let xq = new XienQuay();
            if (numbers && numbers.length >= 3) {
              numbers.forEach(number => {
                xq.addNumber(parseInt(number, 10));
              });
              xq.setValue(parseInt(value, 10));

              sms.addXienQuay(xq);
            }
          }
        }
      });
    }
  }

  /**
   * 
   * @param id Chuỗi id của những loại tin nhắn muốn lọc
   * vd: id = "1": lô, id = "2": đb, id = "12": lô + đb
   */
  filterSmS(id: string) {
    this.resultSmS = [];
    let syntaxes: Array<SmsSyntax> = [];
    for (let i = 0; i < id.length; i++) {
      let mId = parseInt(id[i], 10);

      if (mId == KetQuaCmd.LO_ID) {

      }
    };

    this.mSmS.forEach(element => {
      if ((element.lo.length > 0 && id.indexOf(KetQuaCmd.LO_ID + "") > -1)
        || (element.db.length > 0 && id.indexOf(KetQuaCmd.DB_ID + "") > -1)
        || (element.xien.length > 0 && id.indexOf(KetQuaCmd.XIEN_ID + "") > -1)
        || (element.xienQuay.length > 0 && id.indexOf(KetQuaCmd.XIENQUAY_ID + "") > -1)) {
        this.resultSmS.push(element);
      }
    })

  }

}
