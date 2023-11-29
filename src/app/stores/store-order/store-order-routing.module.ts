import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreOrdersComponent } from './store-orders/store-orders.component';
import { StoreOrdersGuard } from './store-orders/store-orders.guard';
import { StoreOrderViewComponent } from './store-order-view/store-order-view.component';
import { StoreOrderGuard } from './store-order-view/store-order.guard';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreOrdersComponent, canActivate: [StoreOrdersGuard] },
  { path: ':orderUuid', component: StoreOrderViewComponent, canActivate: [StoreOrderGuard] },
  {
    path: 'capture',
    loadChildren: () => import('../../public/public.module').then(m => m.PublicModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreOrderRoutingModule { }
