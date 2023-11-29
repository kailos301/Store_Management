import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodesLocationComponent } from './qr-codes-location.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [QrCodesLocationComponent],
  imports: [
    CommonModule, SharedModule
  ],
  exports: [QrCodesLocationComponent]
})
export class QrCodesModule { }
