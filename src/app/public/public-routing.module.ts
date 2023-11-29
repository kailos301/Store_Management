import { BasketEnabledGuard } from './basket-enabled.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicLayoutComponent } from '../layout/public-layout/public-layout.component';
import { StoreLoadingComponent } from './store/store-loading/store-loading.component';
import { StoreDashboardComponent } from './store/store-dashboard/store-dashboard.component';
import { StoreItemDetailsComponent } from './store/store-item-details/store-item-details.component';
import { StoreCheckoutComponent } from './store/store-checkout/store-checkout.component';
import { StoreCheckoutPaymentComponent } from './store/store-checkout/store-checkout-payment/store-checkout-payment.component';
import { StoreLoadingGuard } from './store-loading.guard';
import { AdminStoreLoadingGuard } from './admin-store-loading.guard';
import { AdminBasketEnabledGuard } from './admin-basket-enabled.guard';



const routes: Routes = [
  { path: '', component: StoreLoadingComponent, canActivate: [StoreLoadingGuard, BasketEnabledGuard]},
  { path: 'location/:locationid', component: StoreLoadingComponent, canActivate: [StoreLoadingGuard, BasketEnabledGuard]},
  { path: ':storeAlias', component: StoreLoadingComponent, canActivate: [AdminStoreLoadingGuard, AdminBasketEnabledGuard]},
  // { path: 'catalog', component: StoreDashboardComponent},
  // { path: 'dashboard', component: StoreDashboardComponent},
  // { path: 'item', component: StoreItemDetailsComponent},
  // { path: 'checkout', component: StoreCheckoutComponent},
  // { path: 'payment', component: StoreCheckoutPaymentComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
