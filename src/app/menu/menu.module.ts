import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { StoreModule } from '@ngrx/store';
import { menuReducer, menuInitialState } from './+state/menu.reducer';
import { AppHeaderModule, AppSidebarModule } from '@coreui/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  declarations: [MenuComponent],
  imports: [
    CommonModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    StoreModule.forFeature('menu', menuReducer, {initialState: menuInitialState}),
  ],
  exports: [MenuComponent]
})
export class MenuModule { }
