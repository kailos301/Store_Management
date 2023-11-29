import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClearStoreValidation, UpdateStoreSettings } from '../+state/stores.actions';
import { getSelectedStore, getStoreValidations } from '../+state/stores.selectors';
import { SocialLinkErrors } from '../types/SocialLinks';

@Component({
  selector: 'app-store-marketing',
  templateUrl: './store-marketing.component.html',
  styleUrls: ['./store-marketing.component.scss']
})
export class StoreMarketingComponent implements OnInit, OnDestroy {

  marketingForm: FormGroup;
  socialMediaMarketingForm: FormGroup;
  destroyed$ = new Subject<void>();
  dialogMode: string;
  requestCode: string;
  isInvalidGACode: boolean = null;
  isInvalidFBPixelCode: boolean = null;
  isInvalidFBMetaContent: boolean = null;
  isInvalidWebsiteUrl: boolean;
  isInvalidFBUrl: boolean;
  isInvalidIGUrl: boolean;
  isInvalidCardItUrl: boolean;
  storeSettingErrors = [];

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit() {

    this.marketingForm = this.fb.group({
      GOOGLE_ANALYTICS_TRACKING_CODE: [null],
      FACEBOOK_PIXEL_TRACKING_ID: [null],
      FACEBOOK_DOMAIN_VERIFICATION_CODE: [null]
    });

    this.socialMediaMarketingForm = this.fb.group({
      STORE_WEBSITE_URL: [null],
      FACEBOOK_URL: [null],
      INSTAGRAM_URL: [null],
      CARDITIO_URL: [null]
    });

    this.store
      .pipe(
        select(getSelectedStore),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (!!res && res.id !== -1) {
          this.storeSettingErrors = [];
          this.marketingForm.get('GOOGLE_ANALYTICS_TRACKING_CODE').setValue(res.settings.GOOGLE_ANALYTICS_TRACKING_CODE);
          this.marketingForm.get('FACEBOOK_PIXEL_TRACKING_ID').setValue(res.settings.FACEBOOK_PIXEL_TRACKING_ID);
          this.marketingForm.get('FACEBOOK_DOMAIN_VERIFICATION_CODE').setValue(res.settings.FACEBOOK_DOMAIN_VERIFICATION_CODE);
          this.socialMediaMarketingForm.get('STORE_WEBSITE_URL').setValue(res.settings.STORE_WEBSITE_URL);
          this.socialMediaMarketingForm.get('FACEBOOK_URL').setValue(res.settings.FACEBOOK_URL);
          this.socialMediaMarketingForm.get('INSTAGRAM_URL').setValue(res.settings.INSTAGRAM_URL);
          this.socialMediaMarketingForm.get('CARDITIO_URL').setValue(res.settings.CARDITIO_URL);
        }
    });

    this.store
      .pipe(
        select(getStoreValidations),
        takeUntil(this.destroyed$))
      .subscribe(msg => {
        if (!!msg && Array.isArray(msg)) {
          this.storeSettingErrors = this.storeSettingErrors.concat([...msg]);
          this.isInvalidGACode = this.storeSettingErrors.includes(SocialLinkErrors.GA_CODE_ERROR);
          this.isInvalidFBPixelCode = this.storeSettingErrors.includes(SocialLinkErrors.FB_PIXEL_CODE_ERROR);
          this.isInvalidWebsiteUrl = this.storeSettingErrors.includes(SocialLinkErrors.WEBSITE_URL_ERROR);
          this.isInvalidFBUrl = this.storeSettingErrors.includes(SocialLinkErrors.FB_URL_ERROR);
          this.isInvalidIGUrl = this.storeSettingErrors.includes(SocialLinkErrors.INSTA_URL_ERROR);
          this.isInvalidCardItUrl = this.storeSettingErrors.includes(SocialLinkErrors.CARDIT_URL_ERROR);
        }
    });

    this.marketingForm.get('GOOGLE_ANALYTICS_TRACKING_CODE').valueChanges.subscribe(v => {
      this.isInvalidGACode = null;
    });
    this.marketingForm.get('FACEBOOK_PIXEL_TRACKING_ID').valueChanges.subscribe(v => {
      this.isInvalidFBPixelCode = null;
    });
    this.marketingForm.get('FACEBOOK_DOMAIN_VERIFICATION_CODE').valueChanges.subscribe(v => {
      this.isInvalidFBPixelCode = null;
    });
    this.socialMediaMarketingForm.get('STORE_WEBSITE_URL').valueChanges.subscribe(v => {
      this.isInvalidWebsiteUrl = null;
    });
    this.socialMediaMarketingForm.get('FACEBOOK_URL').valueChanges.subscribe(v => {
      this.isInvalidFBUrl = null;
    });
    this.socialMediaMarketingForm.get('INSTAGRAM_URL').valueChanges.subscribe(v => {
      this.isInvalidIGUrl = null;
    });
    this.socialMediaMarketingForm.get('CARDITIO_URL').valueChanges.subscribe(v => {
      this.isInvalidCardItUrl = null;
    });

  }

  ngOnDestroy() {
    if (!!this.storeSettingErrors) {
      this.store.dispatch(new ClearStoreValidation(this.storeSettingErrors));
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSocialSubmit(formControl: string) {
    this.store.dispatch(
      new UpdateStoreSettings(
        {
          [formControl]: (formControl === 'GOOGLE_ANALYTICS_TRACKING_CODE') ?
                              this.getControl('marketingForm', formControl)?.value :
                              this.getControl('socialMediaMarketingForm', formControl)?.value
        }
      )
    );
  }

  onFBAdvSettingSubmit() {
    this.store.dispatch(
      new UpdateStoreSettings(
        {
          FACEBOOK_PIXEL_TRACKING_ID: this.getControl('marketingForm', 'FACEBOOK_PIXEL_TRACKING_ID')?.value === '' ?
                              null :
                              this.getControl('marketingForm', 'FACEBOOK_PIXEL_TRACKING_ID')?.value,
          FACEBOOK_DOMAIN_VERIFICATION_CODE: this.getControl('marketingForm', 'FACEBOOK_DOMAIN_VERIFICATION_CODE')?.value === '' ?
                              null :
                              this.getControl('marketingForm', 'FACEBOOK_DOMAIN_VERIFICATION_CODE')?.value
        }
      )
    );
  }

  getControl(form: string = 'socialMediaMarketingForm', name: string) {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }
}
