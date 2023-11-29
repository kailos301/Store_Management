import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Paging } from 'src/app/api/types/Pageable';
import { DayType, Utils } from 'src/app/stores/utils/Utils';
import { LocalStorageService } from 'src/app/local-storage.service';
import { helpPage } from 'src/app/shared/help-page.const';
import { DownloadCustomersList, LoadCustomersPage, LoadCustomersSuccess } from '../+state/stores.actions';
import { getCustomersList, getSelectedStore } from '../+state/stores.selectors';
import { getProfile } from 'src/app/account/+state/account.selectors';

@Component({
  selector: 'app-store-customer',
  templateUrl: './store-customer.component.html',
  styleUrls: ['./store-customer.component.scss']
})
export class StoreCustomerComponent implements OnInit, OnDestroy {
  storeid: number;
  storeCustomersHelpPage = helpPage.customers;
  customers$: Observable<any>;
  customers: any;
  mynextCredentialsForm: any;
  destroyed$ = new Subject<void>();
  storeId: number;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  customerStatus: string;
  sortingcolumn: string;
  sortDir = 1;
  customercountColumn: boolean;
  isSortingForAll: string;
  locale: string;
  timezone: string;

  constructor(private store: Store<any>,
              private storageService: LocalStorageService,
              private route: ActivatedRoute,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.customercountColumn = true;
    this.customerName = this.storageService.getSavedState('customerName') ? this.storageService.getSavedState('customerName') : '';
    this.customerEmail = this.storageService.getSavedState('customerEmail') ? this.storageService.getSavedState('customerEmail') : '';
    this.customerPhoneNumber = this.storageService.getSavedState('customerPhoneNumber')
                               ? this.storageService.getSavedState('customerPhoneNumber')
                               : '';
    this.sortingcolumn = this.storageService.getSavedState('sortingColumn') ? this.storageService.getSavedState('sortingColumn') : '';
    this.customerStatus = this.sortingcolumn.split(',')[0];
    this.isSortingForAll = this.sortingcolumn.split(',')[1];
    this.sortingcolumn = this.sortingcolumn ? this.sortingcolumn.split(',')[0] + ',' + this.sortingcolumn.split(',')[2] : '';
    this.storeId = this.route.snapshot.parent.params.id;
    this.store.dispatch(
      new LoadCustomersPage(
        this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber,
        this.sortingcolumn ? this.sortingcolumn : 'orderCount,desc',
        this.storageService.getSavedState('paging') ? this.storageService.getSavedState('paging') : { page: 0, size: 10 }
      )
    );
    this.customers$ = this.store.pipe(select(getCustomersList), takeUntil(this.destroyed$));
    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getProfile)
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([state, loggedInUser]) => {
        if (state && loggedInUser) {
          if (state.id > 0) {
            this.locale = state.address.country.defaultLocale + '-' + state.address.country.code;
            this.timezone = state.timeZone;
          }
        }
      });
  }
  paginate(paging: Paging) {
    this.storageService.setSavedState(paging, 'paging');
    this.sortingcolumn = this.storageService.getSavedState('sortingColumn') ? this.storageService.getSavedState('sortingColumn') : '';
    this.sortingcolumn = this.sortingcolumn ? this.sortingcolumn.split(',')[0] + ',' + this.sortingcolumn.split(',')[2] : '';
    this.store.dispatch(
      new LoadCustomersPage(
        this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, this.sortingcolumn, paging
      )
    );
  }
  onSortClick(event, colName) {
    this.customercountColumn = false;
    const target = event.currentTarget;
    const classList = target.classList;
    if (classList.contains('fa-sort-down')) {
      this.customerStatus = colName;
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, colName + ',asc',
          this.storageService.getSavedState('paging') ? this.storageService.getSavedState('paging') : { page: 0, size: 10 }
        )
      );
      classList.remove('fa-sort-down');
      classList.remove('fa-sort');
      classList.add('fa-sort-up');
      this.isSortingForAll = classList.value;
      this.storageService.setSavedState(colName + ',' + this.isSortingForAll + ',asc', 'sortingColumn');
      this.sortDir = -1;
    } else {
      this.customerStatus = colName;
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, colName + ',desc',
          this.storageService.getSavedState('paging') ? this.storageService.getSavedState('paging') : { page: 0, size: 10 }
        )
      );
      classList.remove('fa-sort');
      classList.remove('fa-sort-up');
      classList.add('fa-sort-down');
      this.isSortingForAll = classList.value;
      this.storageService.setSavedState(colName + ',' + this.isSortingForAll + ',desc', 'sortingColumn');
      this.sortDir = 1;
    }
  }
  downloadCustomersList(): void {
    this.store.pipe(take(1), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.store.dispatch(new DownloadCustomersList(this.storeId, '', '', ''));
      });
  }
  searchCustomerName(event) {
    this.storageService.setSavedState(event.target.value, 'customerName');
    this.sortingcolumn = this.storageService.getSavedState('sortingColumn') ? this.storageService.getSavedState('sortingColumn') : '';
    this.sortingcolumn = this.sortingcolumn ? this.sortingcolumn.split(',')[0] + ',' + this.sortingcolumn.split(',')[2] : '';
    if (event.target.value) {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, event.target.value, this.customerPhoneNumber, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
    else {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
  }
  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }
  get DayType(): typeof DayType {
    return DayType;
  }
  searchCustomerEmail(event) {
    this.sortingcolumn = this.storageService.getSavedState('sortingColumn') ? this.storageService.getSavedState('sortingColumn') : '';
    this.sortingcolumn = this.sortingcolumn ? this.sortingcolumn.split(',')[0] + ',' + this.sortingcolumn.split(',')[2] : '';
    this.storageService.setSavedState(event.target.value, 'customerEmail');
    if (event.target.value) {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, event.target.value, this.customerName, this.customerPhoneNumber, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
    else {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
  }
  searchcustomerPhone(event) {
    this.sortingcolumn = this.storageService.getSavedState('sortingColumn') ? this.storageService.getSavedState('sortingColumn') : '';
    this.sortingcolumn = this.sortingcolumn ? this.sortingcolumn.split(',')[0] + ',' + this.sortingcolumn.split(',')[2] : '';
    this.storageService.setSavedState(event.target.value, 'customerPhoneNumber');
    if (event.target.value) {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, event.target.value, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
    else {
      this.store.dispatch(
        new LoadCustomersPage(
          this.storeId, this.customerEmail, this.customerName, this.customerPhoneNumber, this.sortingcolumn, { page: 0, size: 10 }
        )
      );
    }
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
