import { NgxPrintModule } from 'ngx-print-anzap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreCombineOrdersDialogComponent, StoreOrdersComponent } from './store-orders/store-orders.component';
import { StoreOrderRoutingModule } from './store-order-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { storeOrdersReducer, storeOrdersInitialState } from './+state/store-order.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreOrderEffects } from './+state/store-order.effects';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { StoreOrderDetailsComponent } from './store-order-details/store-order-details.component';
import { StoreOrderViewComponent } from './store-order-view/store-order-view.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { MatDialogModule } from '@angular/material/dialog';
import { storesLocationReducer, storesLocationInitialState } from '../store-location/+state/store-location.reducer';
import { StoreLocationEffects } from '../store-location/+state/store-location.effects';

@NgModule({
  declarations: [
    StoreOrdersComponent,
    StoreOrderDetailsComponent,
    StoreOrderViewComponent,
    StoreCombineOrdersDialogComponent
  ],
  imports: [
    NgxPrintModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatDialogModule,
    TimepickerModule.forRoot(),
    ButtonsModule,
    StoreOrderRoutingModule,
    StoreModule.forFeature('orders', storeOrdersReducer, {initialState: storeOrdersInitialState}),
    StoreModule.forFeature('storesLocation', storesLocationReducer, {initialState: storesLocationInitialState}),
    EffectsModule.forFeature([StoreOrderEffects, StoreLocationEffects]),
    BsDropdownModule.forRoot()
  ]
})
export class StoreOrderModule { }
