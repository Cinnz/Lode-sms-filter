import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, AlertController, AlertOptions, Platform, ModalController } from 'ionic-angular';

import { AndroidPermissions } from '@ionic-native/android-permissions';

import { SmsModule } from '../../providers/sms-module/sms-module';
import { Sms } from '../../providers/classes/sms';
import { Utils } from '../../providers/app-utils';

declare var SMS: any;

class ShortcutSyntax {
  id: string;
  name: string;
  filterStatus: boolean;

  constructor() {
    this.id = "";
    this.name = "";
    this.filterStatus = false;
  }

  onResponseData(data) {
    this.id = data.id;
    this.name = data.name;
  }
}

class SmsItem {
  time: number = 0;
  timeStr: string = "";
  sms: Array<Sms> = [];

  constructor() {

  }

  onResponseData(time: number) {
    let date = new Date(time).setHours(0, 0, 0, 0);
    this.time = date;
    this.timeStr = Utils.getViewDate(new Date(this.time));
  }

  addSms(sms: Sms) {
    this.sms.push(sms);
  }


}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  current: number = 0;
  range: number = 10;
  next: number = this.current + this.range;

  mSms: Array<Sms> = [];
  mSmSItems: Array<SmsItem> = [];

  filterTypes: Array<ShortcutSyntax> = [];
  mDatas = {};

  constructor(public navCtrl: NavController,
    public mSmsModule: SmsModule,
    public mAlertController: AlertController,
    public mModalController: ModalController,
    public platform: Platform,
    public mChangeDetectorRef: ChangeDetectorRef,
    public androidPermissions: AndroidPermissions) {
  }


  ionViewWillEnter() {
    if (this.platform.is("mobile")) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
        success => console.log('Permission granted'),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS)
      );

      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_SMS]);

      this.startWatchSms();
    }

    if (this.filterTypes.length == 0) {
      this.mSmsModule.getSmsSyntax().forEach(element => {
        let syntax = new ShortcutSyntax();
        syntax.onResponseData(element);

        this.filterTypes.push(syntax);
      });
      this.mSmsModule.clearSms();
      [
        {
          body: "km ListSms",
          date_sent: 1520653801000,
          address: "+84973950482"
        },
        {
          body: "khuyến maiabc1, abc2, abc3, zxy, abc4",
          date_sent: 1520639401000,
          address: "+84973950482"
        },
        {
          body: "abc1, abc2, abc3, zxy, abc4",
          date_sent: 1520506201000,
          address: "+84973950482"
        },
        {
          body: "codeabc1, abc2, abc3, zxy, abc4",
          date_sent: 1520333401000,
          address: "+84973950482"
        },
        {
          body: "lo15x20d",
          date_sent: 1520322601000,
          address: "+84973950482"
        },
        {
          body: "l24 45 10n",
          date_sent: 1519995001000,
          address: "+84973950482"
        },
        {
          body: "ghi e con lo 57, 68 x 3n",
          date_sent: 1519883401000,
          address: "+84973950482"
        },
        {
          body: "Lo 51x15, De 23x100, Lo 636x30",
          date_sent: 1519858201000,
          address: "+84973950482"
        },
        {
          body: "De 13 x 200, 52 x 50, 121 x 20. Lo 99 x 20, 33 x 100, 49 94 23 x 5. Xien quay 01.12.53, 12.23.34 x 30, 22.54.81.34 x 10. Xien 56.78x 100",
          date_sent: 1519426201000,
          address: "+84973950482"
        }
      ].forEach(element => {
        let sms = new Sms();
        sms.onResponseData(element);

        this.mSmsModule.addSms(sms);
      });
    }


    this.getSms();

    console.log(this.mSms);
    

  }

  ngOnDestroy() {
    this.stopWatchSms();
  }

  startWatchSms() {
    this.platform.ready().then((readySource) => {
      if (SMS) SMS.startWatch(success => {
        console.log('start watch success!');
        document.addEventListener('onSMSArrive', (ev) => {
          this.onSmsIsComing(ev['data'])
        });
      }, err => {
        console.log('start watch fail!');
      })
    })
  }

  stopWatchSms() {
    this.platform.ready().then((readySource) => {
      if (SMS) SMS.stopWatch(success => {
        console.log('stop watch success!');
        document.removeEventListener('onSMSArrive', () => { });
      }, err => {
        console.log('start watch fail!');
      })
    })
  }

  onSmsIsComing(data) {
    console.log("incoming SMS", data);
    let newSms = new Sms();
    newSms.onResponseData(data);

    this.mSmsModule.unshiftSms(newSms);
    this.getSms();

    this.mChangeDetectorRef.detectChanges();
  }

  ReadMoreSMS() {
    if (this.platform.is("mobile")) {
      this.platform.ready().then((readySource) => {

        let filter = {
          box: 'inbox', // 'inbox' (default), 'sent', 'draft'
          indexFrom: this.current, // start from index 0
          maxCount: this.next, // count of SMS to return each time
        };

        if (SMS) SMS.listSMS(filter, (ListSms) => {
          console.log("range: " + this.current + " - " + this.next);

          console.log("Sms", ListSms);

          this.mSmsModule.clearSms();
          ListSms.forEach(element => {
            let sms = new Sms();
            sms.onResponseData(element);
            this.mSmsModule.addSms(sms);
          });

          this.getSms();

          this.next += this.range;
        },
          Error => {
            console.log('error list sms: ' + Error);
          });
      });
    }
  }

  getSms() {
    let id = "";
    this.filterTypes.forEach(element => {
      id += element.filterStatus ? element.id : "";
    })

    if (id.length > 0) {
      this.mSmsModule.filterSmS(id);
      this.mSms = this.mSmsModule.getResultSms();
    }
    else {
      this.mSms = this.mSmsModule.getSmS();
    }
    this.arrangeByDate();
  }

  /**
   * Các tin nhắn trong điện thoại đã tự động được sắp xếp theo thời gian
   * => Chỉ cần gom các tin nhắn theo ngày
   */
  arrangeByDate() {
    this.mSmSItems = [];

    this.mSms.forEach(sms => {
      if (this.mSmSItems.length == 0
        || (sms.time - this.mSmSItems[this.mSmSItems.length - 1].time > 86400000)
        || (sms.time - this.mSmSItems[this.mSmSItems.length - 1].time < 0)) {
        let smsItem = new SmsItem();
        smsItem.onResponseData(sms.time);
        smsItem.addSms(sms);
        this.mSmSItems.push(smsItem);
      }
      else {
        let smsItem = this.mSmSItems[this.mSmSItems.length - 1];
        smsItem.addSms(sms);
      }
    });
  }

  showOptions() {
    let alert = this.mAlertController.create({
      title: 'Lọc tin nhắn',
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'OK',
        handler: (data) => {
          this.filterTypes.forEach(element => {
            element.filterStatus = false;
          })
          if (data.length > 0) {
            data.forEach(element => {
              for (let i = 0; i < this.filterTypes.length; i++) {
                if (element == this.filterTypes[i].id) {
                  this.filterTypes[i].filterStatus = true;
                }
              }
            });
          }
          this.getSms();
        }
      }]
    });

    this.filterTypes.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: 'lọc theo ' + element.name,
        value: element.id,
        checked: element.filterStatus
      });
    });

    alert.present();
  }

  obj = {
    id: 0,
    name: "nam"
  }

  onClickSms(sms: Sms) {
    if (sms.lo.length > 0
      || sms.db.length > 0
      || sms.xien.length > 0
      || sms.xienQuay.length > 0) {
      console.log(sms);
    }

    this.navCtrl.push("SmsEditorPage", { sms: sms })

  }

}
