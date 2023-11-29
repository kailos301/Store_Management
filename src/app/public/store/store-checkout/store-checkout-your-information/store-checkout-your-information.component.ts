import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClientStore, Order } from 'src/app/stores/stores';
import { Observable, Subject } from 'rxjs';
import { Cart, CustomerDetailsUpdateState, OrderMetaState } from '../../+state/stores.reducer';
import { Store } from '@ngrx/store';
import { first, take, takeUntil } from 'rxjs/operators';
import {
  getCheckoutState,
  getCurrentOrderMetaState,
  getCustomerDetailsUpdate,
  getSelectedStore,
  getSocialAuth,
  getZoneState,
  getTokens,
  getCurrentOrderDeliveryMethod,
} from '../../+state/stores.selectors';
import {
  AddOrderMeta,
  AddCheckoutState,
  GetZonePerZipcode,
  UpdateZipCode,
  SocialLogin,
  CustomerDetailsUpdate,
  GeocodeAddress,
  GeocodeAddressSuccess
} from '../../+state/stores.actions';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';
import { CustomValidators } from '../../../../shared/custom.validators';
import { HelperService } from 'src/app/public/helper.service';
// import {  } from '@types/googlemaps';
import { TableOrderingSetting } from 'src/app/stores/+state/stores.reducer';
import { environment as envConst } from '../../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { CustomerDetailsUpdateRequest, SocialAccountLoginDetails } from '../../types/CustomerSocialLogin';

@Component({
  selector: 'app-store-checkout-your-information',
  templateUrl: './store-checkout-your-information.component.html',
  styleUrls: ['./store-checkout-your-information.component.scss']
})
export class StoreCheckoutYourInformationComponent implements OnInit, OnDestroy {

  userLogin: SafeResourceUrl;
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  orderUuid: string;
  PICKUP_METHOD = PICKUP_METHOD;
  validationTimer = null;
  geocodingTimer = null;
  autocomplete: any;
  iframe: any;
  cookieEnabled = false;
  isSociallyLoggedIn = false;
  socialAccountLoginStatus = 'INITIAL';
  customerDetailsUpdateStatus = 'INITIAL';
  ENABLE_CUSTOMER_AUTHENTICATION = 'ENABLE_CUSTOMER_AUTHENTICATION';
  formChanged = false;
  initialFormLoad = false;
  tokenCookieName = '__auth_storage__';
  customerDetails: CustomerDetailsUpdateState = {
    userId: -1,
    userName: '',
    email: '',
    phoneNumber: '',
    floorNumber: '',
    streetAddress: '',
    city: '',
    postCode: '',
    customerDetailsUpdateStatus: 'INITIAL',
    tokens: {
      jwt: '',
      refreshToken: ''
    }
  };
  @ViewChild('yourInfoWrapper')  yourInfoWrapper: ElementRef;
  @ViewChild('street') addresstextElement: ElementRef;
  // make sure google maps doesn't disable autocomplete for street-address
  private observerHack = new MutationObserver(() => {
    this.observerHack.disconnect();
    this.addresstextElement.nativeElement.setAttribute('autocomplete', 'street-address');
  });

  constructor(private fb: FormBuilder,
              private store: Store<Cart>,
              public checkoutService: CheckoutService,
              public helper: HelperService,
              public sanitizer: DomSanitizer,
              private ref: ChangeDetectorRef,
              private cookieService: CookieService,
             ) { }

  ngOnInit() {

    this.store.select(getSelectedStore)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
        if (d) {
          this.selectedStore = d;
          this.updateValidationRules();
        }
    });

    // get checkout state
    this.store.select(getCheckoutState)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
        if (d.checkoutState) {
          this.checkoutStateData = d.checkoutState.data;
        }
    });
    this.store.select(getCurrentOrderMetaState)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
      if (d) {
          this.orderMetaData = d;
          this.updateValidationRules();
      }
    });
    // get zone state
    this.store.select(getZoneState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        if (d.zoneState) {
          this.updateValidationRules();
        }
      });
    this.store.select(getCurrentOrderDeliveryMethod)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        this.autocomplete = null;
      });

    this.userLogin = this.sanitizer.bypassSecurityTrustResourceUrl(envConst.adminHostURL + '/user-login');
    this.iframe = (document.getElementById('user-login') as HTMLIFrameElement)?.contentWindow;

    this.cookieEnabled = this.cookiesEnabled();

    this.getCustomerDetails();

    window.addEventListener('message', (event) => {
      const {data} = event;
      if (data && data.email && this.personalInfoForm) {
        this.isSociallyLoggedIn = true;
        this.getControl('email').patchValue(data.email, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
        this.customerDetails.email = data.email;
        const socialAccountDetails: SocialAccountLoginDetails = {
          provider: (data.provider as string).toLowerCase(),
          accessToken: data.authToken,
          countryId: this.selectedStore.address.country.code,
        };
        this.store.dispatch(new SocialLogin(socialAccountDetails));
      }
    }, false);

    this.store.select(getSocialAuth)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state.socialLoginState && this.isSociallyLoggedIn) {
          const socialLoginResponse = state.socialLoginState;
          this.socialAccountLoginStatus = socialLoginResponse.socialAuthStatus;
          if (this.personalInfoForm && socialLoginResponse.userId !== -1 && this.socialAccountLoginStatus === 'SUCCESS') {
            this.formChanged = false;
            this.initialFormLoad = false;
            if (socialLoginResponse.userId) {
              this.store.dispatch(new AddOrderMeta('customerUserId', socialLoginResponse.userId));
              this.customerDetails.userId = socialLoginResponse.userId;
            }
            if (socialLoginResponse.tokens && socialLoginResponse.tokens.jwt && socialLoginResponse.tokens.refreshToken) {
              this.cookieService.set(this.tokenCookieName, JSON.stringify(socialLoginResponse.tokens));
            }
            this.setCustomerDetails(socialLoginResponse);
          } else if (socialLoginResponse.socialAuthStatus === 'FAILED') {
            this.logout();
          }
        }
      });

    this.store.select(getCustomerDetailsUpdate)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(state => {
          if (state && state.customerDetailsUpdateState && this.isSociallyLoggedIn) {
            const customerDetailsUpdateResponse = state.customerDetailsUpdateState;
            this.customerDetailsUpdateStatus = this.initialFormLoad ?
              'INITIAL' : customerDetailsUpdateResponse.customerDetailsUpdateStatus;
            if (this.personalInfoForm &&
              customerDetailsUpdateResponse.userId !== -1 &&
              customerDetailsUpdateResponse.customerDetailsUpdateStatus === 'SUCCESS') {
              this.formChanged = false;
              if (customerDetailsUpdateResponse.userId) {
                this.store.dispatch(new AddOrderMeta('customerUserId', customerDetailsUpdateResponse.userId));
                this.customerDetails.userId = customerDetailsUpdateResponse.userId;
              }
              if (customerDetailsUpdateResponse.tokens && customerDetailsUpdateResponse.tokens.jwt &&
                customerDetailsUpdateResponse.tokens.refreshToken) {
                this.cookieService.set(this.tokenCookieName, JSON.stringify(customerDetailsUpdateResponse.tokens));
                this.customerDetails.tokens = customerDetailsUpdateResponse.tokens;
              }
              this.setCustomerDetails(customerDetailsUpdateResponse);
            } else if (customerDetailsUpdateResponse.customerDetailsUpdateStatus === 'FAILED') {
              this.logout();
            }
          } else {
            this.customerDetailsUpdateStatus = 'INITIAL';
          }
        }
    );

    this.store.select(getCurrentOrderDeliveryMethod)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(val => {
      if (this.selectedStore.settings[this.ENABLE_CUSTOMER_AUTHENTICATION] === true && parseInt(val, 10) > 0) {
        if (this.customerDetails.email && this.customerDetails.userId !== -1) {
          this.setCustomerDetailsFromMemory();
        } else {
          this.getCustomerDetails();
        }
      }
    });

    this.formChanged = false;
    if (this.isSociallyLoggedIn) {
      this.socialAccountLoginStatus = 'SUCCESS';
    } else {
      this.socialAccountLoginStatus = 'INITIAL';
    }
    this.customerDetailsUpdateStatus = 'INITIAL';

  } // EOF: ngOnInit

  isShowReadOnlyLocation() {
    if (this.checkoutService.ifOnlyInStore() ||
      this.checkoutService.showReadOnlyLocation() ||
      this.checkoutService.showEditableLocation() ||
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION) {
      return true;
    }
    return false;
  }

  isShowOnlySelfPickup() {
    if (this.checkoutService.ifOnlySelfPickup() ||
      this.checkoutService.ifEnabledSelfPickup() &&
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.MY_SELF) {
      return true;
    }
    return false;
  }

  isShowOnlyDeliveryToAddress() {
    if (this.checkoutService.ifOnlyDeliveryToAddress() ||
      this.checkoutService.ifEnabledDeliveryAtAddress() &&
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS) {
      return true;
    }
    return false;
  }

  getCustomerDetails() {
    if (this.cookiesEnabled && this.cookieService.get(this.tokenCookieName)) {
      this.isSociallyLoggedIn = true;
      const tokenPair = JSON.parse(this.cookieService.get(this.tokenCookieName));
      if (!!tokenPair.jwt) {
        this.formChanged = false;
        this.initialFormLoad = true;
        const customerDetails: CustomerDetailsUpdateRequest = {
          tokens: tokenPair
        };
        this.store.dispatch(new CustomerDetailsUpdate(customerDetails));
      }
    }
  }

  setCustomerDetails(response) {
    if (response.userName) {
      if (this.getControl('name')) {
        this.getControl('name').patchValue(response.userName, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerName', 'name', 'personalInfoForm');
      }
      this.customerDetails.userName = response.userName;
    }
    if (response.email) {
      if (this.getControl('email')) {
        this.getControl('email').patchValue(response.email, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
      }
      this.customerDetails.email = response.email;
    }
    if (response.phoneNumber) {
      if (this.getControl('phone')) {
        this.getControl('phone').patchValue(response.phoneNumber, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
      }
      this.customerDetails.phoneNumber = response.phoneNumber;
    }
    if (response.floorNumber) {
      if (this.getControl('floor')) {
        this.getControl('floor').patchValue(response.floorNumber, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerFloor', 'floor', 'personalInfoForm');
      }
      this.customerDetails.floorNumber = response.floorNumber;
    }
    if (response.streetAddress) {
      if (this.getControl('street')) {
        this.getControl('street').patchValue(response.streetAddress, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerStreet', 'street', 'personalInfoForm');
      }
      this.customerDetails.streetAddress = response.streetAddress;
    }
    if (response.city) {
      if (this.getControl('town')) {
        this.getControl('town').patchValue(response.city, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerTown', 'town', 'personalInfoForm');
      }
      this.customerDetails.city = response.city;
    }
    if (response.postCode) {
      if (this.getControl('zip')) {
        this.getControl('zip').patchValue(response.postCode, {onlySelf: true, emitEvent: true});
        this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
      }
      this.customerDetails.postCode = response.postCode;
    }
  }

  setCustomerDetailsFromMemory() {
    if (this.customerDetails.userName && this.getControl('name') && !this.getControl('name').value) {
      this.getControl('name').patchValue(this.customerDetails.userName, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerName', 'name', 'personalInfoForm');
    }
    if (this.customerDetails.email && this.getControl('email') && !this.getControl('email').value) {
      this.getControl('email').patchValue(this.customerDetails.email, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
    }
    if (this.customerDetails.phoneNumber && this.getControl('phone') && !this.getControl('phone').value) {
      this.getControl('phone').patchValue(this.customerDetails.phoneNumber, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
    }
    if (this.customerDetails.floorNumber && this.getControl('floor') && !this.getControl('floor').value) {
      this.getControl('floor').patchValue(this.customerDetails.floorNumber, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerFloor', 'floor', 'personalInfoForm');
    }
    if (this.customerDetails.streetAddress && this.getControl('street') && !this.getControl('street').value) {
      this.getControl('street').patchValue(this.customerDetails.streetAddress, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerStreet', 'street', 'personalInfoForm');
    }
    if (this.customerDetails.city && this.getControl('town') && !this.getControl('town').value) {
      this.getControl('town').patchValue(this.customerDetails.city, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerTown', 'town', 'personalInfoForm');
    }
    if (this.customerDetails.postCode && this.getControl('zip') && !this.getControl('zip').value) {
      this.getControl('zip').patchValue(this.customerDetails.postCode, {onlySelf: true, emitEvent: true});
      this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
    }
  }

  public get TableOrderingSetting(): typeof TableOrderingSetting {
    return TableOrderingSetting;
  }

  initiateGoogleApi() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    if (!this.addresstextElement || !this.deliveryAddressAutocomplete() || this.autocomplete) {
      return;
    }
    // make sure google maps disable autocomplete for street-address
    this.observerHack.observe(this.addresstextElement.nativeElement, {
      attributes: true,
      attributeFilter: ['autocomplete']
    });
    this.autocomplete = new google.maps.places.Autocomplete(this.addresstextElement.nativeElement,
    {
        componentRestrictions: { country: this.selectedStore.address.country.code },
        types: ['address']  // 'establishment' / 'address' / 'geocode'
    });
    google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
        if (place?.geometry) {
          this.invokeEvent(place);
        }
    });
  }

  deliveryAddressAutocomplete() {
    if (this.selectedStore.settings.DELIVERY_ADDRESS_AUTOCOMPLETE) {
      return true;
    }
    return false;
  }

  deliveryFloorRequired() {
    if (this.selectedStore.settings.FLOOR_NUMBER_VISIBILITY) {
      return true;
    }
    return false;
  }

  invokeEvent(place: google.maps.places.PlaceResult) {
    const streetNumber = (this.getStreetNumber(place)) ? `, ${this.getStreetNumber(place)}` : '';
    const street = this.getStreet(place);
    if (street) {
      this.getControl('street').patchValue(`${this.getStreet(place)}${streetNumber}`, {onlySelf: true} );
      this.store.dispatch(new AddOrderMeta('customerStreet', `${this.getStreet(place)}${streetNumber}`));
    }
    this.customerDetails.streetAddress = this.getControl('street').value;
    this.getControl('town').patchValue(this.getCity(place), {onlySelf: true});
    this.store.dispatch(new AddOrderMeta('customerTown', this.getCity(place)));
    this.customerDetails.city = this.getControl('town').value;
    const zip  = this.getPostCode(place);
    if (zip || zip === '') {
      this.getControl('zip').patchValue(zip, {onlySelf: true});
      this.store.dispatch(new AddOrderMeta('customerZip', zip));
      this.customerDetails.postCode = this.getControl('zip').value;
      this.store.dispatch(new AddCheckoutState('personalFormValid', false));
    }
    const coordinates: google.maps.LatLng = place.geometry.location;
    this.store.dispatch(new GeocodeAddressSuccess(coordinates.lat(), coordinates.lng()));
    this.ref.detectChanges();
  }

  getAddrComponent(place, componentTemplate) {
    let result;
    if (!place || !place.address_components) {
      return '';
    }

    for (const addressComponent of place.address_components) {
      const addressType = addressComponent.types[0];
      const addressTypeAlt = addressComponent.types[1];
      if (componentTemplate[addressType]) {
        result = addressComponent[componentTemplate[addressType]];
        return result;
      }
      if (addressTypeAlt && componentTemplate[addressTypeAlt]) {
        result = addressComponent[componentTemplate[addressTypeAlt]];
        return result;
      }
    }
    return;
  }

  getStreetNumber(place) {
    const COMPONENT_TEMPLATE = { street_number: 'short_name' };
    const streetNumber = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return streetNumber;
  }

  getStreet(place) {
    const COMPONENT_TEMPLATE = { route: 'long_name' };
    const street = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return street;
  }

  getCity(place) {
    const COMPONENT_TEMPLATE = { locality: 'long_name' };
    const city = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return city;
  }

  getPostCode(place) {
    const COMPONENT_TEMPLATE = { postal_code: 'long_name' };
    const postCode = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return (postCode) ? postCode : '';
  }

  updateValidationRules() {
    if (this.checkoutService.ifOnlyInStore() ||
      this.checkoutService.showReadOnlyLocation() ||
      this.checkoutService.showEditableLocation() ||
      this.checkoutService.getPickupMethodAsInt() === 0) {

      let nameValidators = [Validators.minLength(2), Validators.maxLength(200), Validators.required];
      if (this.nameFieldOptional()) {
        nameValidators = [Validators.maxLength(200)];
      }
      let emailValidators = [CustomValidators.email, Validators.minLength(2), Validators.maxLength(200), Validators.required];
      if (this.emailFieldOptional()) {
        emailValidators = [CustomValidators.email, Validators.maxLength(200)];
      }
      let phoneValidators = [Validators.maxLength(13), Validators.pattern('^[0-9 \+\-]+$'), Validators.required];
      if (this.phoneFieldOptional()) {
        phoneValidators = [Validators.maxLength(13), Validators.pattern('^[0-9 \+\-]+$')];
      }

      // all fields are optional, consider this form to always be valid
      // this.store.dispatch(new AddCheckoutState('personalFormValid', true));

      this.personalInfoForm = this.fb.group({
        name: [this.checkoutService.getOrderMetaData('customerName'), Validators.compose(nameValidators)],
        email: [this.checkoutService.getOrderMetaData('customerEmail'), Validators.compose(emailValidators)],
        phone: [this.checkoutService.getOrderMetaData('customerPhoneNumber'), Validators.compose(phoneValidators)],
      }, {
        validator: [
          CustomValidators.checkForOnlySpaces('name', true),
          CustomValidators.checkForOnlySpaces('email', true),
          CustomValidators.checkForOnlySpaces('phone', true),
        ]
      });
      this.personalInfoForm.updateValueAndValidity();
      this.checkFormValidity();
    }
    if (this.checkoutService.ifOnlySelfPickup() || this.checkoutService.getPickupMethodAsInt() === 1) {
      let nameValidators = [Validators.minLength(2), Validators.maxLength(200), Validators.required];
      if (this.nameFieldOptional()) {
        nameValidators = [Validators.maxLength(200)];
      }
      let emailValidators = [CustomValidators.email, Validators.minLength(2), Validators.maxLength(200), Validators.required];
      if (this.emailFieldOptional()) {
        emailValidators = [CustomValidators.email, Validators.maxLength(200)];
      }
      let phoneValidators = [Validators.maxLength(13), Validators.pattern('^[0-9 \+\-]+$'), Validators.required];
      if (this.phoneFieldOptional()) {
        phoneValidators = [Validators.maxLength(13), Validators.pattern('^[0-9 \+\-]+$')];
      }
      this.store.dispatch(new AddCheckoutState('personalFormValid', true));
      this.personalInfoForm = this.fb.group({
        name: [this.checkoutService.getOrderMetaData('customerName'), Validators.compose(nameValidators)],
        email: [this.checkoutService.getOrderMetaData('customerEmail'), Validators.compose(emailValidators)],
        phone: [this.checkoutService.getOrderMetaData('customerPhoneNumber'), Validators.compose(phoneValidators)],
      }, {
        validator: [
          CustomValidators.checkForOnlySpaces('name', true),
          CustomValidators.checkForOnlySpaces('email', true),
          CustomValidators.checkForOnlySpaces('phone', true),
        ]
      });
      this.personalInfoForm.updateValueAndValidity();
      this.checkFormValidity();
    }
    if (this.checkoutService.ifOnlyDeliveryToAddress() || this.checkoutService.getPickupMethodAsInt() === 2) {
      let floorValidators = [Validators.maxLength(50)];
      if (this.deliveryFloorRequired()) {
        floorValidators = [Validators.maxLength(50), Validators.required];
      }
      this.personalInfoForm = this.fb.group({
        name: [
          this.checkoutService.getOrderMetaData('customerName'),
          Validators.compose([Validators.minLength(2), Validators.maxLength(200), Validators.required]),
        ],
        street: [
          this.checkoutService.getOrderMetaData('customerStreet'),
          Validators.compose([Validators.maxLength(200), Validators.required]),
        ],
        zip: [
          this.checkoutService.getOrderMetaData('customerZip'),
          Validators.compose([Validators.maxLength(16), Validators.required]),
        ],
        town: [
          this.checkoutService.getOrderMetaData('customerTown'),
          Validators.compose([Validators.maxLength(64), Validators.required]),
        ],
        email: [
          this.checkoutService.getOrderMetaData('customerEmail'),
          Validators.compose([CustomValidators.email, Validators.minLength(2), Validators.maxLength(200), Validators.required])
        ],
        phone: [
          this.checkoutService.getOrderMetaData('customerPhoneNumber'),
          Validators.compose([Validators.maxLength(13), Validators.pattern('^[0-9 \+\-]+$'), Validators.required]),
        ],
        floor: [
          this.checkoutService.getOrderMetaData('customerFloor'),
          Validators.compose(floorValidators),
        ],
      }, {
        validator: [
          CustomValidators.checkForOnlySpaces('name'),
          CustomValidators.checkForOnlySpaces('street'),
          CustomValidators.checkForOnlySpaces('zip'),
          CustomValidators.checkForOnlySpaces('town'),
          CustomValidators.checkForOnlySpaces('email'),
          CustomValidators.checkForOnlySpaces('phone'),
          CustomValidators.checkForOnlySpaces('floor'),
        ],
      });
      this.personalInfoForm.updateValueAndValidity();
      this.checkFormValidity();
    }
    this.markAsDirty(this.personalInfoForm);
  }

  private checkGeolocation() {
    if (this.checkoutService.getZoneRestrictions() && this.selectedStore.settings.DELIVERY_ADDRESS_GPS_COORDINATES === 'MANDATORY') {
      if (this.geocodingTimer) {
        clearTimeout(this.geocodingTimer);
        this.geocodingTimer = null;
      }
      this.geocodingTimer = setTimeout(() => {
        if (
          this.personalInfoForm?.valid &&
          (
            this.checkoutService.ifOnlyDeliveryToAddress() ||
            (
              this.checkoutService.ifEnabledDeliveryAtAddress() &&
              this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS
            )
          )
        ) {
          const street = this.getControl('street').value;
          const city = this.getControl('town').value;
          const zipCode = this.getControl('zip').value;
          if (street && city && zipCode) {
            this.store.dispatch(new GeocodeAddress(street + ' ' + city, zipCode, this.selectedStore.address.country.code));
          }
        }
      }, 750);
    }
  }

  private markAsDirty(form: FormGroup) {
    if (form) {
      Object.keys(form.controls).forEach(key => {
        form.get(key).markAsDirty();
      });
    }

  }

  getControl(name: string, form: string = 'personalInfoForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  checkFormValidity() {
    this.store.dispatch(new AddCheckoutState('personalFormValid', this.personalInfoForm.valid));
  }

  // NOTE: since I will disable the button through setting personalFormValid validity
  //            this check should most probably be done on checkFormValidity (all fields)
  checkZipAndFormValidity(fetchZone = false) {
    if (this.checkoutService.getZoneRestrictions()) {
      // do the keystroke timeout thingy
      // if keystroke timeout:
      // 1. disable the checkout button, by setting the metadata for personalForm to invalid
      this.store.dispatch(new AddCheckoutState('personalFormValid', false));
      // 2. always update the order meta with the latest typed in the zip input
      this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
      // 3. dispatch new action to validate delivery to entered postcode
      if (this.validationTimer) {
        clearTimeout(this.validationTimer);
        this.validationTimer = null;
      }
      return;
    }
    this.checkFormValidity();
  }

  addOrderMeta(metaKey, control, formGroup = 'personalInfoForm') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  /**
   * Check if name field should be hidden
   * Currently it only considers when table ordering
   */
  nameFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_NAME === TableOrderingSetting.HIDDEN;
    }
    return false;
  }

  /**
   * Check if email field should be hidden
   * Currently it only considers when table ordering
   */
  emailFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL === TableOrderingSetting.HIDDEN;
    }
    return false;
  }

  /**
   * Check if phone field should be hidden
   * Currently it only considers when table ordering
   */
  phoneFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_TEL === TableOrderingSetting.HIDDEN;
    }
    return false;
  }

  nameFieldOptional() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_NAME === TableOrderingSetting.MANDATORY) {
        return false;
      } else {
        return true;
      }
    } else if (this.checkoutService.ifOnlySelfPickup() || this.checkoutService.getPickupMethodAsInt() === 1) {
      if (this.selectedStore.settings.PICKUP_NAME_OPTIONAL === undefined || this.selectedStore.settings.PICKUP_NAME_OPTIONAL) {
        return true;
      }
      return false;
    }
  }

  emailFieldOptional() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL === TableOrderingSetting.MANDATORY) {
        return false;
      } else {
        return true;
      }
    } else if (this.checkoutService.ifOnlySelfPickup() || this.checkoutService.getPickupMethodAsInt() === 1) {
      if (this.selectedStore.settings.PICKUP_EMAIL_OPTIONAL === undefined || this.selectedStore.settings.PICKUP_EMAIL_OPTIONAL) {
        return true;
      }
      return false;
    }
  }

  phoneFieldOptional() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_TEL === TableOrderingSetting.MANDATORY) {
        return false;
      } else {
        return true;
      }
    } else if (this.checkoutService.ifOnlySelfPickup() || this.checkoutService.getPickupMethodAsInt() === 1) {
      if (this.selectedStore.settings.PICKUP_TEL_OPTIONAL === undefined || this.selectedStore.settings.PICKUP_TEL_OPTIONAL) {
        return true;
      }
      return false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onPostalCodeChange() {
    this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
    this.store.dispatch(new UpdateZipCode(this.getControl('zip', 'personalInfoForm').value));
  }

  onFormChange(changedInputName: string, oldInputValue: string): void {
    if (this.isSociallyLoggedIn && !this.getControl(changedInputName).errors
      && this.getControl(changedInputName)?.value !== oldInputValue) {
      this.formChanged = true;
      this.customerDetailsUpdateStatus = 'INITIAL';
    } else {
      this.formChanged = false;
    }
    this.initialFormLoad = false;
  }

  updateCustomerDetails() {
    this.store.select(getTokens).pipe(take(1))
    .subscribe(tokens => {
        const tokenPair = (!!tokens.jwt) ?
            tokens :
            (this.cookieEnabled && this.cookieService.get(this.tokenCookieName) ?
                JSON.parse(this.cookieService.get(this.tokenCookieName)) :
                {});
        if (!tokenPair.jwt) {
          this.formChanged = false;
          this.customerDetailsUpdateStatus = 'FAILED';
        } else {
          this.initialFormLoad = false;
          const customerDetails: CustomerDetailsUpdateRequest = {
            tokens: tokenPair,
            userName: this.getControl('name')?.value,
            phoneNumber: this.getControl('phone')?.value,
            floorNumber: this.getControl('floor')?.value,
            streetAddress: this.getControl('street')?.value,
            city: this.getControl('town')?.value,
            postCode: this.getControl('zip')?.value
          };
          this.store.dispatch(new CustomerDetailsUpdate(customerDetails));
        }
      });
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }

  postMessageToIframe() {
    if (!this.iframe) {
      this.iframe = window.frames['user-login']?.contentWindow;
    }
    if (this.iframe) {
      this.iframe.postMessage({logout: true}, this.sanitizer.sanitize(SecurityContext.URL, this.userLogin));
    } else {
      setTimeout(() => {
        this.postMessageToIframe();
      }, 1000);
    }
  }

  logout() {
    this.formChanged = false;
    this.cookieService.delete(this.tokenCookieName);
    this.store.dispatch(new AddOrderMeta('customerUserId', null));
    this.isSociallyLoggedIn = false;
    this.postMessageToIframe();
  }

  ngOnDestroy() {
    if (this.autocomplete && this.addresstextElement) {
      google.maps.event.clearInstanceListeners(this.addresstextElement.nativeElement);
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFocusOutEvent(){
    this.checkGeolocation();
  }
}
