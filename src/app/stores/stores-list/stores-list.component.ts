import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { getStoresList } from '../+state/stores.selectors';
import { Paging } from 'src/app/api/types/Pageable';
import { LoadStores, LoadStoresPage, SearchStores } from '../+state/stores.actions';
import { Router } from '@angular/router';
import { getProfile } from 'src/app/account/+state/account.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { UserState } from 'src/app/user/+state/user.reducer';
import { LoggedInUser } from 'src/app/auth/auth';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { LocalStorageService } from 'src/app/local-storage.service';

@Component({
  selector: 'app-stores-list',
  templateUrl: './stores-list.component.html'
})
export class StoresListComponent implements OnInit, OnDestroy {

  stores$: Observable<any>;
  stores: any;
  locale: string;
  timezone: string;
  private destroy$ = new Subject();

  tagVisible$: Observable<boolean>;
  aliasName: string;
  loggedInUser: LoggedInUser;

  constructor(private store: Store<StoresState>,
              private storageService: LocalStorageService,
              private userStore: Store<UserState>,
              private router: Router) { }

  ngOnInit() {
    this.stores$ = this.store.pipe(
      select(getStoresList),
      takeUntil(this.destroy$)
    );

    this.stores$.subscribe((stores) => {
      this.stores = stores;
    });

    this.aliasName = this.storageService.getSavedState('aliasName');
    this.userStore.pipe(
      select(getProfile),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state.country) {
        this.locale = state.country.defaultLocale + '-' + state.country.code;
        this.timezone = state.country.defaultTimeZone;
      }
    });
    this.tagVisible$ = this.store.pipe(
      select(getLoggedInUser), map(u => u.superAdmin)
    );
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    )
      .subscribe(l => this.loggedInUser = l);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadStoresPage(paging, !!this.aliasName ? this.aliasName : ''));
  }

  goToStorePage(store) {
    if (store.numberOfOffers > 0 && store.numberOfOrders > 0 && store.settings.ENABLE_ORDERING === true) {
      this.router.navigate(['/manager/stores/', store.id, 'orders']);
    } else {
      this.router.navigate(['/manager/stores/', store.id, 'catalog']);
    }

    if (store.numberOfOffers > 0 && store.numberOfOrders > 0 && store.settings.ENABLE_ORDERING === true) {
      this.router.navigate(['/manager/stores/', store.id, 'orders']);
    } else {
      if (this.loggedInUser.storeRoles[store.id] === 'STORE_STANDARD') {
        this.router.navigate(['/manager/stores/', store.id, 'orders']);
      } else {
        this.router.navigate(['/manager/stores/', store.id, 'catalog']);
      }
    }
  }

  searchStore(event) {
    if (event.target.value && event.target.value.length >= 6) {
      this.storageService.setSavedState(event.target.value, 'aliasName');
      this.store.dispatch(new SearchStores(event.target.value));
    } else if (event.target.value.length === 0) {
      this.storageService.removeSavedState('aliasName');
      this.store.dispatch(new LoadStores({ page: 0, size: 10 }, ''));
    }
  }
}
