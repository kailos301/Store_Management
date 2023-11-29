import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'src/app/shared/custom.validators';
import {ReferenceDataService} from 'src/app/api/reference-data.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {forkJoin, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Country} from 'src/app/api/types/Country';
import {Language} from 'src/app/api/types/Language';
import {SocialAccountLoginDetails, UserProfile, UserRegistrationDetails} from 'src/app/api/types/User';
import { RegistrationService } from '../registration.service';
import { AuthActionType } from '../+state/auth.actions';
import { Store, select } from '@ngrx/store';
import { AuthState } from '../+state/auth.reducer';
import { getLocationInfo } from '../+state/auth.selectors';

@Component({
  selector: 'app-registration-user-details-form',
  templateUrl: './registration-user-details-form.component.html',
  styleUrls: ['./registration-user-details-form.component.scss']
})

export class RegistrationUserDetailsFormComponent implements OnInit, OnDestroy {

  @Input() newUser: UserProfile;
  @Input() social: SocialAccountLoginDetails;
  @Input() mode = '';
  @Input() languageId: any;
  @Output() handleSubmit = new EventEmitter<UserRegistrationDetails>();
  @Input() registration = false;
  registerForm: FormGroup;
  private destroy$ = new Subject();
  countriesList: Country[] = [];
  isNewRegisterUser = false;
  languagesList: Language[] = [];
  hide = true;
  destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private referenceDataService: ReferenceDataService,
    private router: Router,
    private registrationService: RegistrationService,
    private translate: TranslateService,
    private store: Store<AuthState>) {
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: [
        this.newUser.firstName,
        Validators.compose([
          CustomValidators.required,
          Validators.minLength(1),
          Validators.maxLength(32),
          CustomValidators.pattern('^[^\\s]+(\\s+[^\\s]+)*$'),
          CustomValidators.containsUrl
        ])
      ],
      lastName: [
        this.newUser.lastName,
        Validators.compose([
          CustomValidators.required,
          Validators.minLength(1),
          Validators.maxLength(32),
          CustomValidators.pattern('^[^\\s]+(\\s+[^\\s]+)*$'),
          CustomValidators.containsUrl
        ])
      ],
      countryId: ['', Validators.compose([Validators.required])],
      phoneNumber: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(13)])],
      phoneCountryCode: ['', Validators.maxLength(6)]
    });
    this.isNewRegisterUser = this.registrationService.action === AuthActionType.Register ? true : false;

    let countryCode;

    this.store.pipe(
      select(getLocationInfo),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      countryCode = s.data?.countryCode;
    });

    this.referenceDataService.getCountries().pipe(takeUntil(this.destroy$))
    .subscribe((country) => {
      this.countriesList = country.data;
      const countryObj = this.countriesList.find(x => x.code === countryCode);
      if (countryObj) {
        this.countryId.setValue(countryObj.id);
        this.onCountryChanged({value: countryObj.id});
      }
    });
    this.registrationService.addHubspotScriptForAdminRegisterPage();
  }

  onCountryChanged(e) {
    if (!e) {
      return;
    }
    if (e.value) {
      const cl = this.countriesList.find(ct => ct.id === e.value);
      this.phoneCountryCode.setValue('+' + cl.phoneCode, {onlySelf: true});
    } else {
      this.phoneCountryCode.setValue('', {onlySelf: true});
    }
    this.phoneCountryCode.updateValueAndValidity();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onPhoneNumChange() {
    const nationalPh = this.phoneNumber.value.replace(this.phoneCountryCode.value, '');
    this.phoneNumber.setValue(nationalPh);
    this.phoneCountryCode.markAsTouched();
    if (this.phoneNumber.touched && this.phoneNumber.errors) {
      this.phoneCountryCode.setValidators(Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')]));
    } else {
      this.phoneCountryCode.setValidators(null);
    }
    this.phoneCountryCode.updateValueAndValidity();
  }

  onPhoneNumFocus() {
    this.phoneCountryCode.markAsTouched();
    this.phoneCountryCode.setValidators(null);
    this.phoneCountryCode.updateValueAndValidity();
  }

  onPhoneNumFocusout() {
    this.phoneCountryCode.markAsTouched();
    if (this.phoneNumber.touched && this.phoneNumber.errors) {
      this.phoneCountryCode.setValidators(Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')]));
    } else {
      this.phoneCountryCode.setValidators(null);
    }
    this.phoneCountryCode.updateValueAndValidity();
  }

  registerFormAction() {
    if (this.registerForm.invalid) {
      this.registerForm.get('firstName').markAsTouched();
      this.registerForm.get('lastName').markAsTouched();
      this.registerForm.get('phoneNumber').markAsTouched();
    } else {
      const userDetails: {
        firstName,
        lastName,
        countryId,
        phoneCountryCode,
        phoneNumber
      } = Object.assign({}, this.registerForm.getRawValue());

      const userSubmit: UserRegistrationDetails = {
        email: this.newUser.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        password: this.newUser.password,
        countryId: userDetails.countryId,
        social: this.social
      };
      this.handleSubmit.emit(userSubmit);
    }
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }

  get phoneCountryCode() {
    return this.registerForm.get('phoneCountryCode');
  }

  get countryId() {
    return this.registerForm.get('countryId');
  }

  ngOnDestroy() {
    this.registrationService.removeHubspotScriptForAdminRegisterPage();
  }
}
