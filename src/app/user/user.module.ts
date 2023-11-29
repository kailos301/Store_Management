import { ReactiveFormsModule } from '@angular/forms';
import { UserEffects } from './+state/user.effects';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { userInitialState, usersReducer } from './+state/user.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BecomeAffiliateComponent } from '../user/become-affiliate/become-affiliate.component';
import { VouchersComponent } from '../user/vouchers/vouchers.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { UserRoutingModule } from './user.routing.module';
import { UserService } from './user.service';
import { accountInitialState, accountReducer } from '../account/+state/account.reducer';
import { AccountEffects } from '../account/+state/account.effects';
import { AccountService } from '../account/account.service';
import { VoucherComponent } from './overlay/voucher/voucher.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PartnerProgramComponent } from './partner-program/partner-program.component';
import { VoucherPaymentMethodComponent } from './voucher-payment-method/voucher-payment-method.component';
import { CommissionsComponent } from './commissions/commissions.component';
import { ThankyouComponent } from './thankyou/thankyou.component';

@NgModule({
  declarations: [BecomeAffiliateComponent, VouchersComponent, VoucherComponent, PartnerProgramComponent,
    VoucherPaymentMethodComponent, CommissionsComponent, ThankyouComponent],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    StoreModule.forFeature('account', accountReducer, { initialState: accountInitialState }),
    StoreModule.forFeature('user', usersReducer, { initialState: userInitialState }),
    EffectsModule.forFeature([UserEffects, AccountEffects])
  ],
  providers: [UserEffects, UserService, AccountEffects, AccountService]
})
export class UserModule {
}
