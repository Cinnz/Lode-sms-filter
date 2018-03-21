import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { SmsModule } from '../../providers/sms-module/sms-module';
import { Sms } from '../../providers/classes/sms';

class ShowItem {
  number: string;
  value: number;

  constructor() {
    this.number = "";
    this.value = 0;
  }

  setUpNumber(number: string) {
    this.number = "" + number;
  }

  addNumber(number: string) {
    this.number += ", " + number;
  }

  setValue(value: number) {
    this.value = value;
  }
}


@IonicPage()
@Component({
  selector: 'page-sms-editor',
  templateUrl: 'sms-editor.html',
})
export class SmsEditorPage {

  mSms: Sms = new Sms();
  root: Sms;

  mLo: Array<ShowItem> = [];
  mDb: Array<ShowItem> = [];
  mXien: Array<ShowItem> = [];
  mXienQuay: Array<ShowItem> = [];

  constructor(public navCtrl: NavController,
    public mAlertController: AlertController,
    public mSmsModule: SmsModule,
    public navParams: NavParams) {
    if (navParams.data['sms']) {
      this.root = navParams.data['sms'];
      this.mSms.duplicateData(this.root);
      // this.mSms.editFixedContent(this.root.content);
      this.reviewChange();
    }
  }

  ionViewDidEnter() {
  }

  reviewChange() {
    this.mSmsModule.onDataProcessing(this.mSms);
    this.onResponseData();
  }

  onResponseData() {
    this.resetData();
    this.inProcessingLoto();
    this.inProcessingDb();
    this.inProcessingXien();
    this.inProcessingXienQuay();
  }

  inProcessingLoto() {
    this.mSms.lo.forEach(element => {
      if (this.mLo.length == 0) {
        let item = new ShowItem();
        item.setUpNumber("" + element.getNumber());
        item.setValue(element.getValue());
        this.mLo.push(item);
      }
      else {
        let isNew = true;
        for (let i = 0; i < this.mLo.length; i++) {
          if (this.mLo[i].value == element.getValue()) {
            this.mLo[i].addNumber((element.getNumber() < 10) ? "0" + element.getNumber() : "" + element.getNumber());
            isNew = false;
            break;
          }
        }
        if (isNew) {
          let item = new ShowItem();
          item.setUpNumber("" + element.getNumber());
          item.setValue(element.getValue());
          this.mLo.push(item);
        }
      }
    });
  }

  inProcessingDb() {
    this.mSms.db.forEach(element => {
      if (this.mDb.length == 0) {
        let item = new ShowItem();
        item.setUpNumber("" + element.getNumber());
        item.setValue(element.getValue());
        this.mDb.push(item);
      }
      else {
        let isNew = true;
        for (let i = 0; i < this.mDb.length; i++) {
          if (this.mDb[i].value == element.getValue()) {
            this.mDb[i].addNumber((element.getNumber() < 10) ? "0" + element.getNumber() : "" + element.getNumber());
            isNew = false;
            break;
          }
        }
        if (isNew) {
          let item = new ShowItem();
          item.setUpNumber("" + element.getNumber());
          item.setValue(element.getValue());
          this.mDb.push(item);
        }
      }
    });
  }

  inProcessingXien() {
    this.mSms.xien.forEach(element => {
      let number = "";

      element.getNumbers().forEach(num => {
        number += ((num < 10) ? ("0" + num) : ("" + num)) + "-";
      });
      number = number.slice(0, number.length - 1);

      if (this.mXien.length == 0) {
        let item = new ShowItem();
        item.setUpNumber(number);
        item.setValue(element.getValue());
        this.mXien.push(item);
      }
      else {
        let isNew = true;
        for (let i = 0; i < this.mXien.length; i++) {
          if (this.mXien[i].value == element.getValue()) {
            this.mXien[i].addNumber(number);
            isNew = false;
            break;
          }
        }
        if (isNew) {
          let item = new ShowItem();
          item.setUpNumber(number);
          item.setValue(element.getValue());
          this.mXien.push(item);
        }
      }
    });
  }

  inProcessingXienQuay(){
    this.mSms.xienQuay.forEach(element => {
      let number = "";
      element.getNumbers().forEach(num => {
        number += ((num < 10) ? ("0" + num) : ("" + num)) + "-";
      });
      number = number.slice(0, number.length - 1);

      if (this.mXienQuay.length == 0) {
        let item = new ShowItem();
        item.setUpNumber(number);
        item.setValue(element.getValue());
        this.mXienQuay.push(item);
      }
      else {
        let isNew = true;
        for (let i = 0; i < this.mXienQuay.length; i++) {
          if (this.mXienQuay[i].value == element.getValue()) {
            this.mXienQuay[i].addNumber(number);
            isNew = false;
            break;
          }
        }
        if (isNew) {
          let item = new ShowItem();
          item.setUpNumber(number);
          item.setValue(element.getValue());
          this.mXienQuay.push(item);
        }
      }
    });
  }

  resetData() {
    this.mLo = [];
    this.mDb = [];
    this.mXien = [];
    this.mXienQuay = [];
  }

  onClickSave() {
    this.root.editFixedContent(this.mSms.fixedContent);
    this.mSmsModule.onDataProcessing(this.root);
    this.navCtrl.pop();
  }

  onClickReset() {
    let alert = this.mAlertController.create({
      title: 'Reset tin nhắn',
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'OK',
        handler: (data) => {
          this.mSms.editFixedContent(this.root.content);
          this.reviewChange();
        }
      }]
    });

    alert.present();
  }

}
