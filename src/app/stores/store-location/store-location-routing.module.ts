import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreLocationComponent } from './store-location.component';
import { StoreLocationsListGuard } from './store-locations-list.guard';
import { StoreLocationGuard } from './store-location.guard';
import { StoreLocationManageComponent } from './store-location-manage/store-location-manage.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreLocationComponent, canActivate: [StoreLocationsListGuard] },
  { path: ':locationId/manage', component: StoreLocationManageComponent, canActivate: [StoreLocationGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreLocationRoutingModule { }
