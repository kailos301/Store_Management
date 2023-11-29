import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreIntegrationsComponent } from './store-integrations.component';
import { StoreIntegrationsGuard } from './store-integrations.guard';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: StoreIntegrationsComponent,
    canActivate: [StoreIntegrationsGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreIntegrationsRoutingModule { }
