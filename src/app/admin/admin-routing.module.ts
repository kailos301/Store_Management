import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';
import { LoggedInUserGuard } from './loggedinuser.guard';
import { NavigationGuard } from './navigation.guard';
import { AdminGlobalErrorComponent } from './admin-global-error/admin-global-error.component';

const routes: Routes = [
  {
      path: '',
      component: AdminLayoutComponent,
      canActivate: [LoggedInUserGuard],
      children: [
        { path: '', pathMatch: 'full', canActivate: [NavigationGuard]},
        {
          path: 'profile',
          loadChildren: () => import('../account/account.module').then(m => m.AccountModule)
        },
        {
          path: 'user',
          loadChildren: () => import('../user/user.module').then(m => m.UserModule)
        },
        { path: 'expectederror', component : AdminGlobalErrorComponent}
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
