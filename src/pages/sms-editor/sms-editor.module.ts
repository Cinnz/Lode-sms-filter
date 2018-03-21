import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SmsEditorPage } from './sms-editor';

@NgModule({
  declarations: [
    SmsEditorPage,
  ],
  imports: [
    IonicPageModule.forChild(SmsEditorPage),
  ],
})
export class SmsEditorPageModule {}
