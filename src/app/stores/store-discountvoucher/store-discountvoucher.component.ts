import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { UpdateStoreSettings } from '../+state/stores.actions';
import { getSelectedStore } from '../+state/stores.selectors';
import { ClientStore } from '../stores';
import { LoadDiscountVouchers } from './+state/store-discountvoucher.actions';
import { DiscountVoucherState } from './+state/store-discountvoucher.reducer';
import { getDiscountVoucherList } from './+state/store-discountvoucher.selectors';
import { SaveDiscountVoucherView } from './store-discountvoucher.helpers';

@Component({
  selector: 'app-store-discountvoucher',
  templateUrl: './store-discountvoucher.component.html',
  styleUrls: ['./store-discountvoucher.component.scss']
})
export class StoreDiscountvoucherComponent implements OnInit, OnDestroy {
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;
  vouchers$: Observable<PageableResults<SaveDiscountVoucherView>>;
  storeId$: Observable<number>;
  store$: Observable<ClientStore>;
  destoryed$ = new Subject<void>();
  isVoucherQuestion: boolean;
  constructor(private voucherState: Store<DiscountVoucherState>,
              private translateSer: TranslateService,
              private clipBoardSer: ClipboardService,
              private route: Router) { }


  ngOnInit() {
    this.store$ = this.voucherState.pipe(select(getSelectedStore));
    this.storeId$ = this.store$.pipe(map(s => s.id));
    this.vouchers$ = this.voucherState.pipe(select(getDiscountVoucherList));
    this.storeLocaleTimeZone$ = this.store$.pipe(
      map(s => ({
        locale: s.address.country.defaultLocale + '-' + s.address.country.code,
        timezone: s.timeZone
      }))
    );
    this.store$.pipe(takeUntil(this.destoryed$)).subscribe(vou => {
      this.isVoucherQuestion =
        vou.settings.VOUCHER_AT_CHECKOUT_ENABLED === undefined || vou.settings.VOUCHER_AT_CHECKOUT_ENABLED == null
          ? false
          : vou.settings.VOUCHER_AT_CHECKOUT_ENABLED;
    });
  }
  ngOnDestroy() {
    this.destoryed$.next();
    this.destoryed$.complete();
  }

  toActiveText(isActive: boolean) {
    return isActive ? this.translateSer.instant('admin.global.yes') : this.translateSer.instant('admin.global.no');
  }
  toConsumedText(isConsumed) {
    return isConsumed ? this.translateSer.instant('admin.global.consumed') : this.translateSer.instant('admin.global.available');
  }
  toTypeText(type) {
    return type === 'ONE_TIME_USE' ? this.translateSer.instant('admin.store.voucher.typeSingleuse') : this.translateSer.instant('admin.store.voucher.typeMultipleuse');
  }
  toValue(voucher: SaveDiscountVoucherView, currency) {
    return voucher.discountType === 'MONETARY' ? voucher.discount + ' ' + currency.isoCode : voucher.discount + ' %';
  }
  toInitialValue(voucher: SaveDiscountVoucherView, currency) {
    return voucher.discountType === 'MONETARY'
            && voucher.type === 'ONE_TIME_USE'
            && voucher.initialValue ? voucher.initialValue  + ' ' + currency.isoCode : '';
  }
  onVoucherClick(event, voucher) {
    if (event.target.id === 'copyVoucherCode') {
      this.clipBoardSer.copy(voucher.code);
    } else {
      this.route.navigate(['/manager/stores', voucher.storeId, 'settings', 'discount-voucher', voucher.id]);
    }
  }
  paginate(paging: Paging) {
    this.storeId$.pipe(takeUntil(this.destoryed$)).subscribe(id => {
      this.voucherState.dispatch(new LoadDiscountVouchers(id, paging));
    });
  }
  onVoucherQuestionChange($event) {
    this.voucherState.dispatch(new UpdateStoreSettings({ VOUCHER_AT_CHECKOUT_ENABLED: $event.target.checked }));
  }
}
