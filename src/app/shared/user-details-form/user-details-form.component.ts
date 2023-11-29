import { UserProfile } from './../../api/types/User';
import { Component, OnInit, OnDestroy, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from '../custom.validators';
import { ReferenceDataService } from './../../api/reference-data.service';
import { Country } from './../../api/types/Country';
import { Subject, forkJoin, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Language } from 'src/app/api/types/Language';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-user-details-form',
  templateUrl: './user-details-form.component.html',
  styleUrls: ['./user-details-form.component.scss']
})
export class UserDetailsFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() user: UserProfile;
  @Input() mode: string;
  @Output() submitEvent = new EventEmitter<UserProfile>();

  profileForm: FormGroup;
  action: string;
  countriesList: Country[] = [];
  languagesList: Language[] = [];
  private destroy$ = new Subject();
  acceptedTermsandPolicies = false;

  constructor(private fb: FormBuilder
            , private referenceDataService: ReferenceDataService
            , private router: Router
            , private langLoader: LanguageService) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      email: [this.user.email, Validators.compose([Validators.required, CustomValidators.email, Validators.maxLength(254)])],
      firstName: [
        this.user.firstName,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(32),
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$'),
          CustomValidators.containsUrl
        ])
      ],
      lastName: [
        this.user.lastName,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(32),
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$'),
          CustomValidators.containsUrl
        ])
      ],
      countryId: [this.user.countryId, Validators.compose([Validators.required])],
      phoneNumber: [this.user.phoneNumber, Validators.compose([Validators.required, Validators.maxLength(13)])],
      phoneCountryCode: [{value: this.user.country ? this.user.country.phoneCode : '', disabled: true}, Validators.maxLength(6)],
      password: [
        this.user.password,
        this.mode === 'CREATE'
                      ? Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])
                      : null
      ],
      confirmPassword: [
        this.user.password, this.mode === 'CREATE'
                                          ? Validators.compose([Validators.required, Validators.maxLength(100)])
                                          : null
      ],
      languageId: [this.user.preferredLanguageId, Validators.compose([Validators.required])],
    }, { validator: CustomValidators.matchFieldsValidator('confirmPassword', 'password') });

    switch (this.mode) {
      case 'CREATE':
      case 'INVITE':
        this.action = 'admin.register.registerTitle';
        break;
      case 'UPDATE':
        this.action = 'admin.user.profile.updateTitle';
        this.acceptedTermsandPolicies = true;
    }
    forkJoin([this.referenceDataService.getCountries(), this.referenceDataService.getLanguages()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.countriesList = results[0].data;
        this.languagesList = results[1].data.filter(
          language => language.covered_admin_ui === true);
        if (this.mode === 'CREATE' || this.mode === 'INVITE') {
          this.languageId.setValue(this.languagesList.find(x => x.locale === this.langLoader.getAdminUiLang()).id);
        }
        this.onCountryChanged(true);
      });
  }

  onCountryChanged(e) {
    if (!e.target) {
      return;
    }
    if (e.target.value) {
      const c = this.countriesList.find(cn => +cn.id === +e.target.value);
      this.phoneCountryCode.setValue(c.phoneCode, { onlySelf: true });
    } else {
      this.phoneCountryCode.setValue('', { onlySelf: true });
    }
    this.phoneCountryCode.updateValueAndValidity();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newUser = changes.user;
    if (this.profileForm && !!newUser) {
      this.profileForm.patchValue(
        newUser.currentValue
      );
      if (this.mode && this.mode === 'UPDATE' && !!newUser.currentValue.country) {
        this.countryId.patchValue(!!newUser.currentValue.country.id ? newUser.currentValue.country.id : '');
        this.phoneCountryCode.patchValue(!!newUser.currentValue.country.phoneCode ? newUser.currentValue.country.phoneCode : '');
      }

      if (this.mode && this.mode === 'UPDATE' && !!newUser.currentValue.preferredLanguage) {
        this.languageId.patchValue(!!newUser.currentValue.preferredLanguage.id ? newUser.currentValue.preferredLanguage.id : '');
      }
    }

  }

  ngOnDestroy() {

    this.destroy$.next();
    this.destroy$.complete();
  }
  onPhoneNumberChange(e) {
    const phoneNo = (e.target.value ? e.target.value : '').trim();
    if (phoneNo.length !== 0) {
      this.phoneCountryCode.setValidators(Validators.compose([Validators.required]));
    } else {
      this.phoneCountryCode.clearValidators();
    }
    this.phoneCountryCode.updateValueAndValidity();
  }
  submitAction() {
    const userDetails: { email, firstName, lastName, countryId, languageId, phoneCountryCode, phoneNumber, password }
      = Object.assign({}, this.profileForm.value);
    const userSubmit: UserProfile = {
      email: userDetails.email,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      phoneNumber: userDetails.phoneNumber,
      password: userDetails.password,
      countryId: userDetails.countryId,
      preferredLanguageId: userDetails.languageId
    };
    this.submitEvent.emit(userSubmit);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  get email() {
    return this.profileForm.get('email');
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get phoneNumber() {
    return this.profileForm.get('phoneNumber');
  }

  get password() {
    return this.profileForm.get('password');
  }

  get confirmPassword() {
    return this.profileForm.get('confirmPassword');
  }
  get phoneCountryCode() {
    return this.profileForm.get('phoneCountryCode');
  }
  get countryId() {
    return this.profileForm.get('countryId');
  }
  get languageId() {
    return this.profileForm.get('languageId');
  }
}
