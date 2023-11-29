import { StoreSubscriptionsModule } from './store-subscriptions/store-subscriptions.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoresListComponent } from './stores-list/stores-list.component';
import { StoresRoutingModule } from './stores-routing.module';
import { StoresEffects } from './+state/stores.effects';
import {
  storesReducer,
  storesUsersReducer,
  usersInitialState,
  aliasAvailabilityReducer,
  storeCustomersReducer,
  customersInitialState
} from './+state/stores.reducer';
import { ApiModule } from '../api/api.module';
import { SharedModule } from '../shared/shared.module';
import { StoreCreateComponent } from './store-create/store-create.component';
import { StoreFormComponent } from './store-form/store-form.component';
import { StoreUpdateComponent } from './store-update/store-update.component';
import { StoreSettingsDashboardComponent } from './store-settings-dashboard/store-settings-dashboard.component';
import { StoreUsersComponent, StoreInviteDialogComponent } from './store-users/store-users.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StoreSettingsUpdateComponent } from './store-settings-update/store-settings-update.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { userInitialState, usersReducer } from '../user/+state/user.reducer';
import { UserEffects } from '../user/+state/user.effects';
import { UserService } from '../user/user.service';
import { StoreStatisticsComponent } from './store-statistics/store-statistics.component';
import { StoreStatisticsGuard } from './store-statistics.guard';
import { ChartsModule } from 'ng2-charts';
import { AuthModule } from '../auth/auth.module';
import { LocalStorageService } from '../local-storage.service';
import { storageMetaReducer } from '../storage.metareducer';
import { STORES_LOCAL_STORAGE_KEY, STORES_CONFIG_TOKEN } from './stores.tokens';
import { StoreShareComponent } from './store-share/store-share.component';
import { DeleteDialogComponent } from './store-catalog/overlay/delete-dialog/delete-dialog.component';
import { accountReducer, accountInitialState } from '../account/+state/account.reducer';
import { AccountEffects } from '../account/+state/account.effects';
import { AccountService } from '../account/account.service';
import { StorePickupMethodsComponent } from './store-pickup-methods/store-pickup-methods.component';
import { StoreAddressDeliveryComponent } from './store-address-delivery/store-address-delivery.component';
import { StoreZoneComponent } from './store-zone/store-zone.component';
import { StoreZoneViewComponent } from './store-zone-view/store-zone-view.component';
import { StoreSuccessComponent } from './store-success/store-success.component';
import { StoreDefaultCatalogComponent } from './store-default-catalog/store-default-catalog.component';
import { StoreMarketingComponent } from './store-marketing/store-marketing.component';
import { StoreTableOrderingComponent } from './store-table-ordering/store-table-ordering.component';
import { StoreBillingComponent } from './store-billing/store-billing.component';
import { StoreSubscriptionsComponent } from './store-subscriptions/store-subscriptions.component';
import { StoreInvoiceComponent } from './store-subscriptions/store-invoice/store-invoice.component';
import {  BillingInvoicesComponent } from './billing-invoices/billing-invoices.component';
import { BillingDetailsComponent } from './billing-details/billing-details.component';
import { StoreCustomerComponent } from './store-customer/store-customer.component';
import { StoreDomainComponent } from './store-domain/store-domain.component';
import { StoreDeleteComponent } from './store-delete/store-delete.component';
import { StoreDeletePopupComponent } from './store-delete-popup/store-delete-popup.component';
import { StoreCatalogModule } from './store-catalog/store-catalog.module';

export function getStoresConfig(
  localStorageKey: string,
  storageService: LocalStorageService
) {
  return {
    metaReducers: [
      storageMetaReducer(
        ({ selectedStore, storesUserExperience }) => ({ selectedStore, storesUserExperience }),
        localStorageKey,
        storageService
      )
    ]
  };
}

@NgModule({
  declarations: [
    StoresListComponent,
    StoreCreateComponent,
    StoreFormComponent,
    StoreUpdateComponent,
    StoreUsersComponent,
    StoreInviteDialogComponent,
    StoreSettingsUpdateComponent,
    StoreSettingsDashboardComponent,
    StoreSubscriptionsComponent,
    StoreSettingsUpdateComponent,
    DeleteDialogComponent,
    StoreStatisticsComponent,
    StoreShareComponent,
    StorePickupMethodsComponent,
    StoreAddressDeliveryComponent,
    StoreInvoiceComponent,
    StoreBillingComponent,
    StoreZoneComponent,
    StoreZoneViewComponent,
    StoreSuccessComponent,
    StoreDefaultCatalogComponent,
    StoreMarketingComponent,
    StoreTableOrderingComponent,
    BillingInvoicesComponent,
    BillingDetailsComponent,
    StoreCustomerComponent,
    StoreDomainComponent,
    StoreDeleteComponent,
    StoreDeletePopupComponent
  ],
  imports: [
    CommonModule,
    StoresRoutingModule,
    ApiModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    StoreModule.forFeature('customers', storeCustomersReducer, { initialState: customersInitialState }),
    StoreModule.forFeature('account', accountReducer, { initialState: accountInitialState }),
    StoreModule.forFeature('user', usersReducer, { initialState: userInitialState }),
    StoreModule.forFeature('stores', storesReducer, STORES_CONFIG_TOKEN),
    StoreModule.forFeature('users', storesUsersReducer, {
      initialState: usersInitialState
    }),
    StoreModule.forFeature('validateAliasAvailable', aliasAvailabilityReducer),
    MatExpansionModule,
    DragDropModule,
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    ChartsModule,
    MatIconModule,
    EffectsModule.forFeature([StoresEffects, UserEffects, AccountEffects]),
    StoreSubscriptionsModule,
    AuthModule,
    StoreCatalogModule
  ],
  providers: [
    UserEffects,
    UserService,
    AccountEffects,
    AccountService,
    StoreStatisticsGuard,
    { provide: STORES_LOCAL_STORAGE_KEY, useValue: '__stores_storage__' },
    {
      provide: STORES_CONFIG_TOKEN,
      deps: [STORES_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getStoresConfig
    }
  ],
  exports: [StoresListComponent],
})
export class StoresModule { }
