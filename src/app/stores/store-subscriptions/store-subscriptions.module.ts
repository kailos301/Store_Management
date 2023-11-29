import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { storesSubscriptionsReducer, storesSubscriptionsInitialState } from './+state/store-subscriptions.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreSubscriptionsEffects } from './+state/store-subscriptions.effects';
import { SubscriptionPurchaseComponent } from './subscription-purchase/subscription-purchase.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExtendSubscriptionPurchaseComponent } from './extend-subscription-purchase/extend-subscription-purchase.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [SubscriptionPurchaseComponent, ExtendSubscriptionPurchaseComponent],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    StoreModule.forFeature('storeSubscriptions', storesSubscriptionsReducer, { initialState: storesSubscriptionsInitialState }),
    EffectsModule.forFeature([StoreSubscriptionsEffects]),
    SharedModule
  ],
  exports: []
})
export class StoreSubscriptionsModule { }
