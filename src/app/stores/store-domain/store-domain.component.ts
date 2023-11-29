import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { getSelectedStore, getAliasAvailabilityState, getAliasAvailabilityStatus } from '../+state/stores.selectors';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { getStoreValidations } from '../+state/stores.selectors';
import { StoresState } from '../+state/stores.reducer';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartialUpdateStore, UpdateStoreSettings, ValidateAliasAvailability, ValidateAliasAvailabilityReset } from '../+state/stores.actions';
@Component({
  selector: 'app-store-domain',
  templateUrl: './store-domain.component.html',
  styleUrls: ['./store-domain.component.scss']
})
export class StoreDomainComponent implements OnInit, OnDestroy {

  INVALID_IOS_LINK = 'Invalid iOS Store URL';
  INVALID_ANDROID_LINK = 'Invalid Android Store URL';
  INVALID_PROMOTE_GO_APP = 'Unable to set because either Android or iOS Store URL is Invalid or Missing';

  domainForm: FormGroup;
  isDisabled: boolean;
  appsForm: FormGroup;
  aliasAvailabilityStatus: string;
  aliasAvailabilityLoadingStatus: string;
  nameInvalid = false;
  storeId: number;
  existingAliasName: string;
  destroy$ = new Subject<void>();
  https: any;
  isInvalidExternalDomain: boolean = null;
  isInvalidIOSLink: boolean;
  isInvalidAndroidLink: boolean;
  showNotSubscribedMsg = false;

  constructor(private fb: FormBuilder,
              private storeState: Store<any>,
              private store: Store<StoresState>) {
    this.https = 'https://';
  }

  ngOnInit() {
    this.isDisabled = true;

    this.storeState.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      const aliasName = this.domainForm === undefined
                        ? this.https + s.aliasName
                        : this.domainForm.controls.aliasName.value.length <= this.https.length
                          ? this.https
                          : this.domainForm.controls.aliasName.value;
      this.domainForm = this.fb.group({
        aliasName: [
          aliasName,
          Validators.compose([
            Validators.required,
            Validators.maxLength(42),
            Validators.minLength(14),
            Validators.pattern('^[a-zA-Z0-9_-]*[a-zA-Z_-]+[a-zA-Z0-9_:\/@-]*$')
          ])
        ],
        EXTERNAL_DOMAIN: [s.settings.EXTERNAL_DOMAIN
                          ? s.settings.EXTERNAL_DOMAIN
                          : '', Validators.compose([Validators.maxLength(200)])],
        EXTERNAL_DOMAIN_ENABLED: [s.settings.EXTERNAL_DOMAIN_ENABLED, Validators.compose([Validators.maxLength(200)])],
      });
      this.appsForm = this.fb.group({
        PROMOTE_GONNAORDER_APP: [s.settings.PROMOTE_GONNAORDER_APP],
        PROMOTE_STORE_APP: [s.settings.PROMOTE_STORE_APP],
        STORE_APP_ANDROID_URL: [s.settings.STORE_APP_ANDROID_URL, Validators.compose([Validators.maxLength(200)])],
        STORE_APP_IOS_URL: [s.settings.STORE_APP_IOS_URL, Validators.compose([Validators.maxLength(200)])],
      });

      this.showNotSubscribedMsg = false;
      this.storeId = s.id;
      this.existingAliasName = s.aliasName;
      if (s.subscription && s.subscription.status === 'TRIAL') {
        this.showNotSubscribedMsg = true;
      }
      this.isInvalidIOSLink = false;
      this.isInvalidAndroidLink = false;
    });

    this.domainForm.valueChanges.subscribe(data => {
      for (const key in data) {
        if (data[key] && data[key].toString().trim() === '') {
          this.domainForm.get(key).setValue(this.https, { emitEvent: false });
        }
      }
    });

    combineLatest([
      this.storeState.pipe(select(getAliasAvailabilityState)),
      this.storeState.pipe(select(getAliasAvailabilityStatus))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state[0]) {
        this.aliasAvailabilityLoadingStatus = state[1];
        this.aliasAvailabilityStatus = state[0].status;
        if (this.aliasAvailabilityStatus !== 'TAKEN') {
          this.isInvalidExternalDomain = false;
          const { EXTERNAL_DOMAIN, EXTERNAL_DOMAIN_ENABLED, ...formData } = this.domainForm.getRawValue();
          const newFormData = { aliasName: formData.aliasName.split('//')[1] };
          if (this.existingAliasName !== newFormData.aliasName && this.domainForm.get('aliasName').valid) {
            this.aliasAvailabilityStatus = null;
            this.store.dispatch(new PartialUpdateStore(newFormData));
          }
        }
        this.storeState.dispatch(new ValidateAliasAvailabilityReset());
      }
    });

    this.store
      .pipe(
        select(getStoreValidations),
        takeUntil(this.destroy$))
      .subscribe(msg => {
        if (!!msg && Array.isArray(msg)) {
          if (msg.includes(this.INVALID_PROMOTE_GO_APP)) {
            this.getControl('PROMOTE_STORE_APP', 'appsForm').setValue(false, { emitEvent: false });
          }
          if (msg.includes(this.INVALID_IOS_LINK)) {
            this.isInvalidIOSLink = true;
          }
          if (msg.includes(this.INVALID_ANDROID_LINK)) {
            this.isInvalidAndroidLink = true;
          }
        }
    });
  }

  getControl(name: string, form: string = 'domainForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  validateAliasAvailability() {
    const { EXTERNAL_DOMAIN, EXTERNAL_DOMAIN_ENABLED, ...formData } = this.domainForm.getRawValue();
    const aliasName = formData.aliasName.split('//')[1];
    if (this.existingAliasName !== aliasName) {
      this.nameInvalid = false;
      this.storeState.dispatch(new ValidateAliasAvailability(this.storeId, aliasName));
    }
  }

  checkPredefaultLink(input) {
    const field = input.target;
    if (field.value.length < this.https.length) {
      input.target.value = this.https;
    }
  }

  updateDomain() {
    this.store.pipe(select(getStoreValidations), takeUntil(this.destroy$)).subscribe(msg => {
      if (!!msg && Array.isArray(msg) && msg.length > 0) {
        this.isInvalidExternalDomain = [...msg].includes('Invalid extenal domain.');
      }
    });
    const formData = this.domainForm.getRawValue();
    if (formData.EXTERNAL_DOMAIN !== undefined) {
      formData.EXTERNAL_DOMAIN_ENABLED = formData.EXTERNAL_DOMAIN.length === 0 ? 'false' : 'true';
      this.isInvalidExternalDomain = false;
      delete formData.aliasName;
      this.store.dispatch(new UpdateStoreSettings(formData));
    } else {
      formData.EXTERNAL_DOMAIN = '';
      formData.EXTERNAL_DOMAIN_ENABLED = 'false';
      delete formData.aliasName;
      if (!this.isInvalidExternalDomain) {
        this.store.dispatch(new UpdateStoreSettings(formData));
      }
    }
  }

  appPromoteChange(name: string) {
    this.appsForm.markAllAsTouched();
    if (this.getControl(name, 'appsForm').valid) {
      const formObj = this.appsForm.getRawValue();
      formObj[name] = formObj[name] === '' ? null : formObj[name];
      this.store.dispatch(new UpdateStoreSettings({[name]: formObj[name]}));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
