import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StorePaymentMethodsComponent } from './store-payment-methods.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StorePaymentMethodsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StorePaymentMethodsRoutingModule { }
