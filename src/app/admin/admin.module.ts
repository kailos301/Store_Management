import { StoresModule } from './../stores/stores.module';
import { MenuModule } from './../menu/menu.module';
import { LayoutModule } from './../layout/layout.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminGlobalErrorComponent } from './admin-global-error/admin-global-error.component';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { ApplicationStateModule } from '../application-state/application-state.module';

@NgModule({
  declarations: [AdminGlobalErrorComponent],
  imports: [
    CommonModule,
    LayoutModule,
    MenuModule,
    AdminRoutingModule,
    StoresModule,
    SharedModule,
    UsersModule,
    ApplicationStateModule
  ]
})
export class AdminModule {

 }

