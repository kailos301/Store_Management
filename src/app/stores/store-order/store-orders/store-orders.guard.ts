import { take } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Initialize, LoadStoreOrdersSortFilter } from '../+state/store-order.actions';
import {
  LoadNotificationSubscriptionStatus,
  ToggleNotificationPermitted,
  InitializeStoreUserExperience
} from '../../+state/stores.actions';
import { PushNotificationService } from 'src/app/shared/push-notification.service';
import { initialTabPaging, initialTabSortFilterParams } from '../../+state/stores.reducer';
import { getSelectedStoreState } from '../../+state/stores.selectors';
import { select } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { Initialize as InitializeStoreLocations, LoadStoreLocations } from '../../store-location/+state/store-location.actions';
@Injectable({
  providedIn: 'root'
})
export class StoreOrdersGuard implements CanActivate {

  constructor(private store: Store<any>, private pushNotificationService: PushNotificationService) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    // Initilaizing store order list...
    this.store.dispatch(new Initialize());

    // Initialize store user experience...
    this.store.dispatch(new InitializeStoreUserExperience(id));

    this.pushNotificationService.currentSubscription().pipe(take(1)).subscribe(
      s => this.store.dispatch(new LoadNotificationSubscriptionStatus(id, s)),
      _ => this.store.dispatch(new LoadNotificationSubscriptionStatus(id, null)));

    this.store.dispatch(new ToggleNotificationPermitted(this.pushNotificationService.isSupported()));

    // Load all store locations for order search...
    this.store.dispatch(new InitializeStoreLocations());
    this.store.dispatch(new LoadStoreLocations(id, { page: 0, size: 10000 }));

    return true;
  }

}
