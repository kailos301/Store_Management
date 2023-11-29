import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ClientStore, OrderItem } from 'src/app/stores/stores';
import { Store, select } from '@ngrx/store';
import { SelectedStoreState } from '../+state/stores.reducer';
import { LocationService } from '../../location.service';
import { DomSanitizer } from '@angular/platform-browser';
import { getSelectedStore, getCartState } from '../+state/stores.selectors';
import { NavigationStart, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-store-empty-cart',
  templateUrl: './store-empty-cart.component.html',
  styleUrls: ['./store-empty-cart.component.scss']
})
export class StoreEmptyCartComponent implements OnInit, OnDestroy {

  selectedStore$: Observable<ClientStore>;
  cartItems: OrderItem[];
  unsubscribe$: Subject<void> = new Subject<void>();
  isAdminOrderUpdate = false;

  constructor(
    private store: Store<SelectedStoreState>,
    private locationService: LocationService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.store
      .select(getCartState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        const cartState = state.cartState;
        this.cartItems = cartState.data.orderItems;
        if (this.cartItems && this.cartItems.length > 0 && (cartState.data.status === 'DRAFT' || this.isAdminOrderUpdate)) {
          this.router.navigateByUrl(`${this.locationService.public_url()}#cart`);
        }
      });

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate') {
          this.router.navigateByUrl(this.locationService.public_url());
        }
      });
    this.isAdminOrderUpdate = this.locationService.isAdminOrderUpdate();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  OnGoToDashboard(event) {
    event.preventDefault();
    this.router.navigateByUrl(this.locationService.public_url());
  }

}
