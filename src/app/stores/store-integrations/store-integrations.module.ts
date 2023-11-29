import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreIntegrationsRoutingModule } from './store-integrations-routing.module';
import { StoreLastMileWrapperComponent } from './store-last-mile-wrapper/store-last-mile-wrapper.component';
import { StoreLastMileLoginComponent } from './store-last-mile-login/store-last-mile-login.component';
import { StoreLastMileMynextComponent } from './store-last-mile-mynext/store-last-mile-mynext.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreIntegrationsHubriseComponent } from './store-integrations-hubrise/store-integrations-hubrise.component';
import { StoreIntegrationsComponent } from './store-integrations.component';
import { StoreIntegrationsPowersoftComponent } from './store-integrations-powersoft/store-integrations-powersoft.component';


@NgModule({
  declarations: [
    StoreIntegrationsComponent,
    StoreLastMileWrapperComponent,
    StoreLastMileLoginComponent,
    StoreLastMileMynextComponent,
    StoreIntegrationsHubriseComponent,
    StoreIntegrationsPowersoftComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreIntegrationsRoutingModule,
    ReactiveFormsModule
  ]
})
export class StoreIntegrationsModule { }
