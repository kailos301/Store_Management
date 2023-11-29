import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClearHubriseData, HubriseLogin, HubriseLogout, UpdateStoreSettings } from '../../+state/stores.actions';
import { getHubriseLogin, getHubriseLogout, getSelectedStore } from '../../+state/stores.selectors';
import { environment as envConst } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LogService } from 'src/app/shared/logging/LogService';

@Component({
  selector: 'app-store-integrations-hubrise',
  templateUrl: './store-integrations-hubrise.component.html',
  styleUrls: ['./store-integrations-hubrise.component.scss']
})
export class StoreIntegrationsHubriseComponent implements OnInit, OnDestroy {

  storeId: number;
  accountName: string;
  country: string;
  destroyed$ = new Subject<void>();
  hubriseAuthCode: string;
  hubriseSettingsForm: FormGroup;
  invalidCredentials: boolean;
  isDashboard: boolean;
  isConnected: boolean;
  popup: Window;

  onMessage = function(event) {
      const {data} = event;
      if (data.authCode && this.hubriseAuthCode !== data.authCode) {
          console.log(data.authCode);
          this.hubriseAuthCode = data.authCode;
          this.removeEventListener();
          this.onSubmit();
      } else if (data.authError) {
          this.logger.debug(data.error);
          this.removeEventListener();
      }
  };

  constructor(private store: Store<any>,
              public sanitizer: DomSanitizer,
              public route: ActivatedRoute,
              private fb: FormBuilder,
              private logger: LogService) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe((data) => {
        if (window.opener && (data.code || data.error)) {
          window.opener.postMessage(data.code ? {authCode: data.code} : {authError: data.error}, '*');
          window.close();
        }
      });

    this.invalidCredentials = false;
    this.storeId = this.route.snapshot.parent.parent.params.id;

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.accountName = s.name.split(' ').join('');
      this.country = s.address.country.code;
      if (s.settings.HUBRISE_ACCESS_TOKEN && s.settings.HUBRISE_LOCATION_NAME &&
        s.settings.HUBRISE_CATALOG_NAME && s.settings.HUBRISE_CUSTOMER_LIST_NAME) {
          this.hubriseSettingsForm = this.fb.group({
            HUBRISE_ACCESS_TOKEN: [s.settings.HUBRISE_ACCESS_TOKEN],
            HUBRISE_LOCATION_NAME: [s.settings.HUBRISE_LOCATION_NAME],
            HUBRISE_CATALOG_NAME: [s.settings.HUBRISE_CATALOG_NAME],
            HUBRISE_CUSTOMER_LIST_NAME: [s.settings.HUBRISE_CUSTOMER_LIST_NAME],
          });
          this.setToConnected();
      } else {
        this.setToDashboard();
      }
    });

    this.store
      .pipe(select(getHubriseLogin),
            takeUntil(this.destroyed$))
      .subscribe(response => {
        if (response && !response.invalidCredentials && !!response.accessToken) {
          this.hubriseSettingsForm = this.fb.group({
            HUBRISE_ACCESS_TOKEN: [response.accessToken],
            HUBRISE_LOCATION_NAME: [response.locationName],
            HUBRISE_CATALOG_NAME: [response.catalogName],
            HUBRISE_CUSTOMER_LIST_NAME: [response.customerListName],
          });
          this.setToConnected();
        }
      });

    this.store
      .pipe(select(getHubriseLogout),
            takeUntil(this.destroyed$))
      .subscribe(response => {
        if (response && response.logoutStatus === 'SUCCESS') {
          this.setToDashboard();
        }
      });
  }

  updateStoreSettings(hubriseSettings): void {
    this.store.dispatch(new UpdateStoreSettings(hubriseSettings));
  }

  connectToHubrise() {
    this.invalidCredentials = false;
    const hubriseLoginUrl = envConst.hubriseLoginUrl
                            .replace('{{gonnaorder_uri}}', envConst.adminHostURL)
                            .replace('{{client_id}}', envConst.hubriseClientId)
                            .replace('{{country}}', this.country)
                            .replace('{{account_name}}', this.accountName);
    this.authenticate(hubriseLoginUrl);
  }

  onSubmit() {
    if (this.hubriseAuthCode) {
      this.invalidCredentials = false;
      this.store.dispatch(new HubriseLogin(this.storeId, this.hubriseAuthCode));
    }
  }

  disconnectFromHubrise() {
    if (this.isConnected) {
      this.popup = null;
      this.store.dispatch(new HubriseLogout(this.storeId));
    }
  }

  authenticate(hubriseUrl: string): void {
      if (!this.popup || this.popup.closed) {
        this.popup = window.open(hubriseUrl, '_blank', 'location=yes,height=' + screen.availHeight + ',width=' + screen.availWidth + ',scrollbars=yes,status=yes');
        this.onMessage = this.onMessage.bind(this);
        if (window.addEventListener) {
            window.addEventListener('message', this.onMessage, false);
        } else {
            (window as any).attachEvent('onmessage', this.onMessage);
        }
      } else {
        this.popup.focus();
      }
  }

  removeEventListener() {
    if (window.removeEventListener) {
      window.removeEventListener('message', this.onMessage);
    } else {
      (window as any).attachEvent('onmessage', this.onMessage);
    }
  }

  setToDashboard() {
    this.isDashboard = true;
    this.isConnected = false;
  }

  setToConnected() {
    this.isDashboard = false;
    this.isConnected = true;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearHubriseData());
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getControl(name: string) {
    return this.hubriseSettingsForm.get(name);
  }

}
