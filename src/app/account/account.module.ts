import { ReactiveFormsModule } from '@angular/forms';
import {PasswordChangeComponent } from './password-change/password-change.component';
import { AccountEffects } from './+state/account.effects';
import { AccountService } from './account.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';
import { SharedModule } from '../shared/shared.module';
import { AccountRoutingModule } from './account.routing.module';
import { StoreModule } from '@ngrx/store';
import {accountReducer, accountInitialState} from './+state/account.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { ContactusComponent } from './contactus/contactus.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { DeleteUserPopupComponent } from './delete-user-popup/delete-user-popup.component';
import { SocialAccountsComponent } from './social-accounts/social-accounts.component';
import {PasswordCreateComponent} from './password-create/password-create.component';

@NgModule({
  declarations: [
    ProfileUpdateComponent,
    PasswordChangeComponent,
    PasswordCreateComponent,
    ContactusComponent,
    DeleteUserComponent,
    DeleteUserPopupComponent,
    SocialAccountsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AccountRoutingModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    StoreModule.forFeature('account', accountReducer, {initialState: accountInitialState}),
    EffectsModule.forFeature([AccountEffects])
  ],
  providers: [AccountEffects, AccountService]
})
export class AccountModule { }
