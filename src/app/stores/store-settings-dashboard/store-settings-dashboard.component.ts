import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientStore } from '../stores';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { helpPage } from 'src/app/shared/help-page.const';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-store-settings-dashboard',
  templateUrl: './store-settings-dashboard.component.html',
  styleUrls: ['./store-settings-dashboard.component.scss']
})
export class StoreSettingsDashboardComponent implements OnInit {

  isActive = false;
  store$: Observable<ClientStore>;
  settingsHelpPage = helpPage.settingsStoreDetails;
  storeid = 0;
  defaultUrl = '';
  isHelpIconShow = true;
  constructor(private store: Store<StoresState>, private route: Router, private activeRoute: ActivatedRoute) {
  }
  ngOnInit() {
    this.storeid = this.activeRoute.snapshot.params.id;
    this.defaultUrl = '/manager/stores/' + this.storeid + '/settings';
    this.isActive = (this.defaultUrl === this.route.url);
    this.route.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.isActive = (val.url === this.defaultUrl);


      }
    });
    const tempUrl = this.route.url.split('/');
    this.changeHelpTitle(tempUrl[tempUrl.length - 1]);
    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
  }
  changeHelpTitle(type: string) {
    switch (type) {
      case 'details':
      case 'store-edit':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreDetails;
          this.isHelpIconShow = true;
        });
        break;
      case 'ordering':
      case 'edit':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreOrdering;
          this.isHelpIconShow = true;
        });
        break;
      case 'payment':
      case 'payment-methods':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStorePayment;
          this.isHelpIconShow = true;
        });
        break;
      case 'pickup':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStorePickup;
          this.isHelpIconShow = true;
        });
        break;
      case 'delivery':
      case 'address':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreDelivery;
          this.isHelpIconShow = true;
        });
        break;
      case 'locations':
      case 'table':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreLocations;
          this.isHelpIconShow = true;
        });
        break;
      case 'catalog':
      case 'default-catalog':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreCatalog;
          this.isHelpIconShow = true;
        });
        break;
      case 'OrderingRule':
      case 'ordering-rules':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreOrderingRule;
          this.isHelpIconShow = true;
        });
        break;
      case 'schedules':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreSchedules;
          this.isHelpIconShow = true;
        });
        break;
      case 'discountvouchers':
      case 'discount-voucher':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreDiscountVouchers;
          this.isHelpIconShow = true;
        });
        break;
      case 'marketing':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreMarketing;
          this.isHelpIconShow = true;
        });
        break;
        case 'domainandapps':
        case 'store-domain':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreDomainsAndApps;
          this.isHelpIconShow = true;
        });
        break;
        case 'integrations':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreIntegrations;
          this.isHelpIconShow = true;
        });
        break;
    }
  }
}
