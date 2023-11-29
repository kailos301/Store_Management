import { PasswordChangeComponent } from './password-change/password-change.component';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';
import { UserGuard } from './user.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactusComponent } from './contactus/contactus.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { SocialAccountsComponent } from './social-accounts/social-accounts.component';
import { PasswordCreateComponent } from './password-create/password-create.component';



const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'update' },
  { path: 'update', component: ProfileUpdateComponent, canActivate: [UserGuard] },
  { path: 'delete', component: DeleteUserComponent, canActivate: [UserGuard] },
  { path: 'password/update', component: PasswordChangeComponent },
  { path: 'password/create', component: PasswordCreateComponent },
  { path: 'social-accounts/update', component: SocialAccountsComponent, canActivate: [UserGuard] },
  { path: 'contactus', component: ContactusComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserGuard]
})
export class AccountRoutingModule { }
