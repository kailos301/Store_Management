import { getSelectedStore } from '../../+state/stores.selectors';
import { Router, ActivatedRoute } from '@angular/router';
import { getSelectedStoreLocation, getSelectedStoreLocationStatus } from '../+state/store-location.selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ClientStoreLocationRequest } from '../store-location';
import { UpdateStoreLocation, DeleteStoreLocation, CreateStoreLocation } from '../+state/store-location.actions';

@Component({
  selector: 'app-store-location-manage',
  templateUrl: './store-location-manage.component.html',
  styleUrls: ['./store-location-manage.component.scss']
})
export class StoreLocationManageComponent implements OnInit, OnDestroy {

  storeId$: Observable<number>;
  locationId$: Observable<number>;
  locationLabel$: Observable<string>;
  locationRequest$: Observable<ClientStoreLocationRequest>;
  locationStatus: string;
  destroyed$ = new Subject<void>();
  locationId: any;
  newLocation: ClientStoreLocationRequest = { label: '' };

  constructor(private store: Store<any>, private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {

    const params = this.activeRoute.params as {[key: string]: any};
    this.locationId = params._value.locationId;

    this.storeId$ = this.store.pipe(
      select(getSelectedStore),
      filter(s => s.id > 0),
      map(s => s.id)
    );

    this.locationId$ = this.store.pipe(
      select(getSelectedStoreLocation),
      filter(l => !!l),
      map(l => l.id)
    );

    this.locationLabel$ = this.store.pipe(
      select(getSelectedStoreLocation),
      filter(l => !!l),
      map(l => l.label)
    );

    this.locationRequest$ = this.store.pipe(
      select(getSelectedStoreLocation),
      map(l => ({
        id: l.id, label: l.label.toUpperCase(), comment: l.comment, description: l.description, locationType: l.locationType,
        openTap: l.openTap, customerPinCode: l.customerPinCode, openedAt: l.openedAt, status: l.status, tapId: l.tapId
      }))
    );

    this.store
      .pipe(
        select(getSelectedStoreLocationStatus),
        takeUntil(this.destroyed$),
      )
      .subscribe(s => {
        this.locationStatus = s;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  update(location: ClientStoreLocationRequest) {
    this.store.dispatch(new UpdateStoreLocation(location));
  }

  create(location: ClientStoreLocationRequest) {
    this.store.dispatch(new CreateStoreLocation([location]));
  }

  cancel() {
    const params = this.activeRoute.params as {[key: string]: any};
    this.router.navigate(['/manager/stores', params._value.id, 'locations']);
  }

  delete() {
    const params = this.activeRoute.params as {[key: string]: any};
    this.store.dispatch(new DeleteStoreLocation(params._value.locationId));
  }

}
