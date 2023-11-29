import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  AppSidebarModule,
  AppFooterModule,
  AppBreadcrumbModule,
} from '@coreui/angular';
import { MenuModule } from '../menu/menu.module';
import { HeaderComponent } from './admin-layout/header/header.component';
import { ApplicationStateModule } from '../application-state/application-state.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AdminLayoutComponent, PublicLayoutComponent, HeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    // AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    MenuModule,
    AppFooterModule,
    SharedModule,
    ApplicationStateModule,
    BsDropdownModule.forRoot(),
    AppBreadcrumbModule.forRoot()
  ],
  exports: [AdminLayoutComponent, PublicLayoutComponent]
})
export class LayoutModule { }
