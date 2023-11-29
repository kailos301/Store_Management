import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiscountvoucherFormComponent } from './discountvoucher-form/discountvoucher-form.component';
import { DiscountvoucherFormGuard } from './discountvoucher-form/discountvoucher-form.guard';
import { StoreDiscountvoucherComponent } from './store-discountvoucher.component';
import { StoreDiscountvoucherGuard } from './store-discountvoucher.guard';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreDiscountvoucherComponent, canActivate: [StoreDiscountvoucherGuard] },
  { path: ':voucherId', component: DiscountvoucherFormComponent, canActivate: [DiscountvoucherFormGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreDiscountvoucherRoutingModule { }
