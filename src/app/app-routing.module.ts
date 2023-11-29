import { StripeVerificationComponent } from './stripe-verification.component';
import { StripeVerificationGuard } from './stripe-verification.guard';
import { PartnerRegistrationSuccessComponent } from './auth/partner-registration-success/partner-registration-success.component';
import { InvitationComponent } from './auth/invitation/invitation.component';
import { ErrorComponent } from './error/error.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationLoginDetailsComponent } from './auth/registration-login-details/registration-login-details.component';
import { RegistrationGuard } from './auth/registration.guard';
import { AccountVerificationComponent } from './auth/account-verification/account-verification.component';
import { LoginGuard } from './auth/login.guard';
import { PasswordResetComponent } from './auth/password-reset/password-reset.component';
import { PasswordUpdateComponent } from './auth/password-update/password-update.component';
import { UpdatePasswordGuard } from './auth/update-password.guard';
import { Error500Component } from './error/error500.component';
import { PartnerRegistrationComponent } from './auth/partner-registration/partner-registration.component';
import { GlobalErrorGuard } from './error/global-error.guard';
import { RegisterSuccessComponent } from './auth/register-success/register-success.component';
import { ResetSuccessComponent } from './auth/reset-success/reset-success.component';
import { PartnerLoginGuard } from './auth/partner-login.guard';
import { RegistrationUserDetailsComponent } from './auth/registration-user-details/registration-user-details.component';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { StoreIntegrationsHubriseComponent } from './stores/store-integrations/store-integrations-hubrise/store-integrations-hubrise.component';



const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
    pathMatch: 'full'
  },
  {
    path: 'stripe/verification',
    component: StripeVerificationComponent,
    canActivate: [StripeVerificationGuard]
  },
  {
    path: 'manager',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard, PartnerLoginGuard]
  },
  {
    path: 'user-login',
    component: UserLoginComponent
  },
  {
    path: 'register',
    component: RegistrationLoginDetailsComponent,
    canActivate: [RegistrationGuard]
  },
  {
    path: 'register-user-details',
    component: RegistrationUserDetailsComponent
  },
  {
    path: 'register/success',
    component: RegisterSuccessComponent,
  },
  {
    path: 'partners',
    component: PartnerRegistrationComponent,
    canActivate: [RegistrationGuard]
  },
  {
    path: 'partners/success',
    component: PartnerRegistrationSuccessComponent
  },
  {
    path: 'register/invitation',
    component: InvitationComponent
  },
  {
    path: 'account/verification',
    component: AccountVerificationComponent
  },
  {
    path: 'password/reset',
    component: PasswordResetComponent
  },
  {
    path: 'password/reset/success',
    component: ResetSuccessComponent
  },
  {
    path: 'password/update',
    component: PasswordUpdateComponent,
    canActivate: [UpdatePasswordGuard]
  },
  {
    path: 'not-found',
    component: ErrorComponent
  },
  {
    path: 'error',
    component: Error500Component
  },
  {
    path: 'hubrise-user-login',
    component: StoreIntegrationsHubriseComponent
  },
  {
    path: '**',
    component: ErrorComponent,
    canActivate: [GlobalErrorGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
