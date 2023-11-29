import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ClientStore, Order } from 'src/app/stores/stores';
import { Store, select } from '@ngrx/store';
import { SelectedStoreState } from '../+state/stores.reducer';
import { LocationService } from '../../location.service';
import { DomSanitizer } from '@angular/platform-browser';
import { getCurrentError, getSelectedStore, getCurrentCartState } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { NavigationStart, Router } from '@angular/router';
import { CheckExistingOrder } from '../+state/stores.actions';
import { UIError } from '../types/UIError';
import { isNewVersionAvailable } from 'src/app/application-state/+state/application-state.selectors';
import { LogService } from 'src/app/shared/logging/LogService';

@Component({
  selector: 'app-store-error',
  templateUrl: './store-error.component.html',
  styleUrls: ['./store-error.component.scss']
})
export class StoreErrorComponent implements OnInit, OnDestroy {

  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  cartState: Order;
  unsubscribe$: Subject<void> = new Subject<void>();
  errorMessage: string;
  errorMessageParams: any;
  errorCode: string;
  additionalInfo: string[];
  errorPageTitle: string;
  uiErrors: UIError[];
  isNewVersionAvailable$: Observable<boolean>;

  constructor(  private store: Store<SelectedStoreState>
              , private locationService: LocationService
              , private logger: LogService
              , private router: Router
              , private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.store.select(getSelectedStore)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(state => {
          if (state) {
            this.selectedStore = state;
          }
    });
    this.store.select(getCurrentCartState)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(state => {
          if (state) {
            this.cartState = state;
          }
    });
    this.store.select(getCurrentError)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.status !== 'INITIAL' && state.errorMessage !== 'public.global.errorUnexpected') {
          this.errorMessage = state.errorMessage;
          this.errorMessageParams = state.errorMessageParams;
          this.errorCode = state.errorCode;
          this.additionalInfo = state.additionalInfo;
          this.errorPageTitle = state.errorPageTitle;
          this.uiErrors = state.uiErrors;

          if (!!this.selectedStore && (this.selectedStore.id !== -1 || !!this.selectedStore.aliasName)) {
            const storeDetails = `Store id: ${this.selectedStore.id}, Store alias: ${this.selectedStore.aliasName}`;
            this.logger.error(
              'customer ui error',
              storeDetails,
              this.errorMessage,
              this.errorMessageParams,
              this.errorCode,
              this.additionalInfo,
              this.errorPageTitle,
              this.uiErrors,
            );
          } else {
            this.logger.error(
              'customer ui error',
              this.errorMessage,
              this.errorMessageParams,
              this.errorCode,
              this.additionalInfo,
              this.errorPageTitle,
              this.uiErrors,
            );
          }

        }
    });

    this.isNewVersionAvailable$ = this.store.pipe(select(isNewVersionAvailable));

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationStart) => {
        const isPaymentStarted = (window as any).isPaymentStarted;
        if (event.navigationTrigger === 'popstate' && isPaymentStarted) { // Prevent go back only if payment starts
          this.router.navigateByUrl(this.locationService.base_url('cart'));
        }
      });
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  OnGoToDashboard(event) {
    event.preventDefault();
    if (this.selectedStore && this.selectedStore.id && this.cartState && this.cartState.uuid) {
      this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.cartState.uuid, 'CHECKEXISTING'));
    }
    this.router.navigateByUrl(this.locationService.public_url());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
