import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreDiscountvoucherRoutingModule } from './store-discountvoucher-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { discountVoucherInitialState, storesDiscountVoucherReducer } from './+state/store-discountvoucher.reducer';
import { StoresEffects } from './+state/store-discountvoucher.effects';
import { StoreDiscountvoucherComponent } from './store-discountvoucher.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DiscountvoucherFormComponent } from './discountvoucher-form/discountvoucher-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [StoreDiscountvoucherComponent, DiscountvoucherFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ClipboardModule,
    StoreModule.forFeature('discountVoucher', storesDiscountVoucherReducer, { initialState: discountVoucherInitialState }),
    EffectsModule.forFeature([StoresEffects]),
    StoreDiscountvoucherRoutingModule
  ]
})
export class StoreDiscountvoucherModule { }
