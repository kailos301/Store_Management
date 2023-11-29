import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { MynextLogin } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-last-mile-wrapper',
  templateUrl: './store-last-mile-wrapper.component.html',
  styleUrls: ['./store-last-mile-wrapper.component.scss']
})
export class StoreLastMileWrapperComponent implements OnInit {

  mynextSection = 'mynext-dashboard';
  destroyed$ = new Subject<void>();
  invalidCredentials: boolean;
  myNextData: any;

  constructor(private store: Store<any>) { }

  ngOnInit(): void {
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID && s.settings.DELIVERY_PROVIDER_MYNEXT_API_KEY) {
        this.myNextData = {
          DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: s.settings.DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID,
          DELIVERY_PROVIDER_MYNEXT_API_KEY: s.settings.DELIVERY_PROVIDER_MYNEXT_API_KEY,
          DELIVERY_PROVIDER_MYNEXT_ENABLE: s.settings.DELIVERY_PROVIDER_MYNEXT_ENABLE
        };
        this.mynextSection = 'mynext-connect';
      } else {
        this.store.dispatch(new MynextLogin('', ''));
        this.mynextSection = 'mynext-dashboard';
        this.myNextData = {
          DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: undefined,
          DELIVERY_PROVIDER_MYNEXT_API_KEY: undefined,
          DELIVERY_PROVIDER_MYNEXT_ENABLE: false
        };
      }
    });
  }

  /**
   * @method myNextCredentials to show mynext login form
   * @returns void
   */
  myNextCredentials(): void {
    this.mynextSection = 'mynext-login';
  }

  /**
   * @method updateStoreSettings to update store settings
   * @params myNextSettings
   * @returns void
   */
  updateStoreSettings(myNextSettings): void {
    this.store.dispatch(new UpdateStoreSettings(myNextSettings));
  }
}
