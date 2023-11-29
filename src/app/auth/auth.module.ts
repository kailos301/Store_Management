import {ApiModule} from '../api/api.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {AuthRoutingModule} from './auth-routing.module';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {StoreModule} from '@ngrx/store';
import {authReducer} from './+state/auth.reducer';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './+state/auth.effects';
import {LocalStorageService} from '../local-storage.service';
import {storageMetaReducer} from '../storage.metareducer';
import {AUTH_LOCAL_STORAGE_KEY, AUTH_STORAGE_KEYS, AUTH_CONFIG_TOKEN} from './auth.tokens';
import {RegistrationLoginDetailsComponent} from './registration-login-details/registration-login-details.component';
import {EmailFormComponent} from './email-form/email-form.component';
import {AccountVerificationComponent} from './account-verification/account-verification.component';
import {PasswordResetComponent} from './password-reset/password-reset.component';
import {PasswordUpdateComponent} from './password-update/password-update.component';
import {SharedModule} from '../shared/shared.module';
import {HeaderComponent} from './header/header.component';
import {InvitationComponent} from './invitation/invitation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {PartnerRegistrationSuccessComponent} from './partner-registration-success/partner-registration-success.component';
import {RegisterSuccessComponent} from './register-success/register-success.component';
import {ResetSuccessComponent} from './reset-success/reset-success.component';
import {PartnerRegistrationComponent} from './partner-registration/partner-registration.component';
import {RegistrationLoginDetailsFormComponent} from './registration-login-details-form/registration-login-details-form.component';
import { RegistrationUserDetailsComponent } from './registration-user-details/registration-user-details.component';
import { RegistrationUserDetailsFormComponent } from './registration-user-details-form/registration-user-details-form.component';
import {PasswordAuthComponent} from './password-auth/password-auth.component';
import { UserLoginComponent } from './user-login/user-login.component';

export function getAuthConfig(saveKeys: string, localStorageKey: string, storageService: LocalStorageService) {
  return {
    metaReducers: [storageMetaReducer(({tokens}) => ({tokens}), localStorageKey, storageService)]
  };
}

@NgModule({
  declarations: [
    LoginComponent,
    UserLoginComponent,
    RegistrationLoginDetailsComponent,
    EmailFormComponent,
    AccountVerificationComponent,
    PasswordResetComponent,
    RegisterSuccessComponent,
    PartnerRegistrationComponent,
    ResetSuccessComponent,
    PasswordAuthComponent,
    PasswordUpdateComponent,
    InvitationComponent,
    HeaderComponent,
    PartnerRegistrationSuccessComponent,
    RegistrationLoginDetailsFormComponent,
    RegistrationUserDetailsComponent,
    RegistrationUserDetailsFormComponent
  ],
  providers: [
    AuthEffects,
    {provide: AUTH_LOCAL_STORAGE_KEY, useValue: '__auth_storage__'},
    {provide: AUTH_STORAGE_KEYS, useValue: 'auth'},
    {
      provide: AUTH_CONFIG_TOKEN,
      deps: [AUTH_STORAGE_KEYS, AUTH_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getAuthConfig
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    ApiModule,
    SharedModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    MatSelectModule,
    MatIconModule,
    StoreModule.forFeature('auth', authReducer, AUTH_CONFIG_TOKEN),
    EffectsModule.forFeature([AuthEffects]),
    EffectsModule.forFeature([AuthEffects])
  ],
  exports: [
    PasswordAuthComponent
  ]
})

export class AuthModule {
}
