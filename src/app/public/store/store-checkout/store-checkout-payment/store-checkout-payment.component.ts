import { StoreService } from 'src/app/public/store/store.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Inject,
  Renderer2
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {
  AddOrderMeta,
  ErrorMessage,
  AddCheckoutState,
  CartStatusUpdate,
  ToggleOrderSubmitError,
  CheckExistingOrder
} from '../../+state/stores.actions';
import { Store, select } from '@ngrx/store';
import { Cart, CatalogList, OrderMetaData } from '../../+state/stores.reducer';
import { ClientStore, Order } from 'src/app/stores/stores';
import { Observable, Subject, combineLatest } from 'rxjs';
import { getSelectedStore, getSelectedStoreCatalog, getCurrentCartUuid } from '../../+state/stores.selectors';
import { takeUntil, filter } from 'rxjs/operators';
import {
  LocationService
} from '../../../location.service';
import {
  CreatePaypalOrder,
  CreateStripePaymentIntent,
  CompleteStripePayment,
  CreateIdealPaymentIntent,
  ClearIdealPaymentIntent,
  ClearStripePaymentIntent,
  ClearBancontactPaymentIntent,
  CreateBancontactPaymentIntent,
  CheckoutSquare,
  CreateVivaPaymentToken,
  ChargeVivaPayment,
  ClearVivaPayment,
  ClearStripeDigitalWalletPaymentIntent,
  CreateStripeDigitalWalletPaymentIntent,
  CreatePaymentsenseToken,
  ClearPaymentsense,
  CompletePaymentsensePayment,
  CreateRMSRequestJSON,
  CompleteRMSPayment,
  ClearRMSPayment,
  CreateTrustPaymentsRequestJSON,
  CompleteTrustPaymentsPayment,
  ClearTrustPaymentsPayment,
  CreateJCCRequestJSON,
  CompleteJCCPayment,
  ClearJCCPayment
} from '../../../payments/+state/payment.actions';
import {
  getPaypalAccessToken,
  getPaypalOrderData,
  getStripeStore,
  getIdealStore,
  getBancontactStore,
  getVivaStore,
  getDigitalWalletsStore,
  getPaymentsenseStore,
  getRMSStore,
  getTrustPaymentsStore,
  getJCCStore
} from '../../../payments/+state/payment.selectors';
import {
  CheckoutService,
  PAYMENT_OPTION,
  PAYMENT_METHOD
} from '../checkout.service';
import { WINDOW } from 'src/app/public/window-providers';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { getValidationConfigFromCardNo } from 'src/app/shared/card.helper';
import { HelperService } from 'src/app/public/helper.service';
import { JCCRequestJSON, RMSRequestJSON, TrustPaymentsRequestJSON } from 'src/app/public/payments/payment.types';
import { PaymentMethod } from '../../types/PaymentMethod';
import { ActivatedRoute } from '@angular/router';


declare var Stripe;
declare var SqPaymentForm;
declare var VivaPayments;
declare var Connect;
declare var RealexHpp;
@Component({
  selector: 'app-store-checkout-payment',
  templateUrl: './store-checkout-payment.component.html',
  styleUrls: ['./store-checkout-payment.component.scss']
})
export class StoreCheckoutPaymentComponent implements OnInit, OnDestroy {

  stripeCardForm: FormGroup;
  bancontactForm: FormGroup;
  vivaCardForm: FormGroup;
  paymentsenseForm: FormGroup;
  rmsCardForm: FormGroup;
  trustpaymentsCardForm: FormGroup;
  jccCardForm: FormGroup;
  @ViewChild('cardInfo') cardInfo: ElementRef;
  @ViewChild('cardInfoIdeal') cardInfoIdeal: ElementRef;
  @ViewChild('stripeForm') stripeForm: NgForm;
  @ViewChild('paymentWrapper') paymentWrapper: ElementRef;
  @ViewChild('digitalWalletsPayButton') digitalWalletsPayButton: ElementRef;
  @ViewChild('digitalWalletsPayError') digitalWalletsPayError: ElementRef;
  @ViewChild('paymentsense') paymentsense: ElementRef;
  @ViewChild('jccForm') jccForm: ElementRef;
  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  catalog$: Observable<CatalogList>;
  catalogData: CatalogList;
  orderMetaData: OrderMetaData;
  orderUuid: string;
  PAYMENT_OPTION = PAYMENT_OPTION;
  selectedPaymentOption: number;  // id of payment method: -1 - undefined; 0 - pay later; 1 - pay now
  PAYMENT_METHOD = PAYMENT_METHOD;
  selectedPaymentMethod: number;  // id of payment method: -1 - undefined; 0 - I will pay in store; 1 - I will pay online
  qty: number;
  paypalActionUrl: string;
  // stripe: any;
  ideal: any;
  bancontact: any;
  elements: any;
  card: any;
  cardHandler = this.onChange.bind(this);
  idealCardHandler = this.onIdealChange.bind(this);
  // error: string;
  stripeSessionId: string = null;
  stripeClientPk: string = null;
  stripeClientSk: string = null;
  connectedAccountId: string = null;
  bancontactRedirect: string = null;
  checkoutStateData;
  @Output() scrollToPayment = new EventEmitter();
  vivaAccessToken: string;
  @ViewChild('vivaCardVerificationModal') vivaCardVerificationModal: ElementRef;
  paymentMethodStripe: any;
  paymentRequestStripe: any;
  connectE = null;
  paymentSenseOneTimeToken: string;
  paymentSenseFormLoaded = false;
  rmsRequestJSON: RMSRequestJSON;
  trustPaymentsRequestJSON: TrustPaymentsRequestJSON = {
    currencyiso3a: '',
    orderId: '',
    sitereference: '',
    stprofile: '',
    version: '',
    mainamount: '',
    successfulurlredirect: '',
    declinedurlredirect: '',
    errorurlredirect: ''
  };
  jccRequestJSON: JCCRequestJSON;
  jccResponseURL: string;
  jccServerLink: string;
  jccCallbackURL: string;

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    private locationService: LocationService,
    private cd: ChangeDetectorRef,
    public checkoutService: CheckoutService,
    @Inject(WINDOW) private window: Window,
    private translate: TranslateService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.checkoutService.setStripeError('public.checkout.errors.fieldRequired');
    this.paypalActionUrl = null;

    // set payment option to undefined
    this.setPaymentOption(PAYMENT_OPTION.UNDEFINED);

    // set payment method to undefined
    this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
    // get selected store state
    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );

    combineLatest([
              this.selectedStore$
            , this.store.select(getCurrentCartUuid)
    ]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
          if (state && state[0]) {
            this.selectedStore = state[0];
          }
          if (state && state[1]) {
            this.orderUuid = state[1];
            this.jccResponseURL = location.origin + `${this.locationService.public_url()}#thankyou/e/${this.orderUuid}`;
            this.jccCallbackURL = location.origin + `${this.locationService.public_url()}api/v2/stores/${this.selectedStore.id}/orders/${this.orderUuid}/verifyPayment`;
          }
          if (state && this.selectedStore && this.orderUuid) {
            if (this.checkoutService.ifEnabledPaymentSelection()) {
              if (this.checkoutService.ifEnabledPaymentSelectionPreselected()) {
                this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
                this.setIfSinglePaymentMethod();
              } else {
                this.setPaymentOption(PAYMENT_OPTION.PAY_LATER);
              }
            }
            if (this.checkoutService.ifEnabledPaymentMandatory()) {
              // set payment option to pay now
              this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
              // set payment method if only one payment method is enabled
              this.setIfSinglePaymentMethod();
            }
          }
    });

    this.catalog$ = this.store.pipe(
      select(getSelectedStoreCatalog)
    );
    this.catalog$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(c => c.data.catalogId !== -1)
      )
      .subscribe(value => (this.catalogData = value));

    // subscribe to paypal Token obtained
    this.store.select(getPaypalAccessToken).subscribe(state => {
      if (state) {
        this.store.dispatch(new CreatePaypalOrder(this.prepareOrderForPaypal(), state.access_token));
      }
    });

    // subscribe to paypal createdOrder
    // TODO: we need to be able to retrieve this from BE
    //       if we want to maintain persistancy on reload
    this.store.select(getPaypalOrderData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state.links) {
          this.paypalActionUrl = state.links[1].href;
          // links are obtained import paypal external script
        }
      });

    // subscribe to stripe session
    // DIRECT CHARGES WITH CLIENT'S OWN PK
    this.store.select(getStripeStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          switch (state.stripeState.status) {
            case 'PAYMENT_INTENT_CREATED':
              this.stripeClientPk = state.stripeState.stripePaymentIntent.publicKey;
              this.stripeClientSk = state.stripeState.stripePaymentIntent.clientSecret;
              this.connectedAccountId = state.stripeState.stripePaymentIntent.connectedAccountId;
              this.initStripePaymentFlow();
              break;
            case 'PAYMENT_INTENT_FAILED':
              this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
              this.checkoutService.setCheckoutState('paymentValid', false);
              this.store.dispatch(new ClearStripePaymentIntent());
              this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
              break;
            default:
              break;
          }
        }
      });

    // subscribe to ideal payment intent
    this.store.select(getIdealStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          switch (state.idealState.status) {
            case 'PAYMENT_INTENT_CREATED':
              this.stripeClientPk = state.idealState.idealPaymentIntent.publicKey;
              this.stripeClientSk = state.idealState.idealPaymentIntent.clientSecret;
              this.connectedAccountId = state.idealState.idealPaymentIntent.connectedAccountId;
              this.initIdealPaymentFlow();
              break;
            case 'PAYMENT_INTENT_FAILED':
              this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
              this.checkoutService.setCheckoutState('paymentValid', false);
              this.store.dispatch(new ClearIdealPaymentIntent());
              this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
              break;
            default:
              break;
          }
        }
      });

    // subscribe to bancontact payment intent
    this.store.select(getBancontactStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          switch (state.bancontactState.status) {
            case 'PAYMENT_INTENT_CREATED':
              this.stripeClientPk = state.bancontactState.bancontactPaymentIntent.publicKey;
              this.stripeClientSk = state.bancontactState.bancontactPaymentIntent.clientSecret;
              this.connectedAccountId = state.bancontactState.bancontactPaymentIntent.connectedAccountId;
              this.initBancontactPaymentFlow();
              break;
            case 'PAYMENT_INTENT_FAILED':
              this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
              this.checkoutService.setCheckoutState('paymentValid', false);
              this.store.dispatch(new ClearBancontactPaymentIntent());
              this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
              break;
            default:
              break;
          }
        }
      });

    if (this.selectedPaymentOption === PAYMENT_OPTION.PAY_LATER) {
      this.store.dispatch(new ClearVivaPayment());
    }

    this.store.select(getVivaStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.vivaState.status) {
          case 'TOKEN_REQUEST_SUCCESS':
            this.vivaAccessToken = state.vivaState.vivaToken.accessToken;
            this.initVivaPaymentFlow();
            break;
          case 'TOKEN_REQUEST_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearVivaPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'CHARGE_REQUEST_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'CHARGE_REQUEST_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearVivaPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    // subscribe to RMS status
    this.store
      .select(getRMSStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.rmsState.status) {
          case 'INIT_PAYMENT_SUCCESS':
            this.rmsRequestJSON = state.rmsState.requestJSON;
            this.checkoutService.setCheckoutState('orderBtnDisabled', false);
            break;
          case 'INIT_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearRMSPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'COMPLETE_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearRMSPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    // subscribe to TrustPayments status
    this.store
      .select(getTrustPaymentsStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.trustPaymentsState.status) {
          case 'INIT_PAYMENT_SUCCESS':
            state.trustPaymentsState.requestJSON.successfulurlredirect = location.origin + `${this.locationService.public_url()}#verifyPayment/${this.selectedStore.id}/${this.orderUuid}/success`;
            state.trustPaymentsState.requestJSON.declinedurlredirect = location.origin + `${this.locationService.public_url()}#verifyPayment/${this.selectedStore.id}/${this.orderUuid}/declined`;
            state.trustPaymentsState.requestJSON.errorurlredirect = location.origin + `${this.locationService.public_url()}#verifyPayment/${this.selectedStore.id}/${this.orderUuid}/error`;
            this.trustPaymentsRequestJSON = state.trustPaymentsState.requestJSON;
            this.checkoutService.setCheckoutState('orderBtnDisabled', false);
            break;
          case 'INIT_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearTrustPaymentsPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'COMPLETE_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearTrustPaymentsPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    // subscribe to JCC status
    this.store
      .select(getJCCStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.jccState.status) {
          case 'INIT_PAYMENT_SUCCESS':
            this.jccRequestJSON = state.jccState.requestJSON;
            break;
          case 'INIT_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearJCCPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'COMPLETE_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearJCCPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    // subscribe to Paymentsense status
    this.store
      .select(getPaymentsenseStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.paymentSenseState.status) {
          case 'TOKEN_REQUEST_SUCCESS':
            this.paymentSenseOneTimeToken = state.paymentSenseState.paymentSenseToken.id;
            this.initPaymentsenseFlow();
            break;
          case 'TOKEN_REQUEST_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearPaymentsense());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'COMPLETE_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearPaymentsense());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    // subscribe to digital wallets payment intent
    this.store.select(getDigitalWalletsStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          switch (state.digitalWalletsState.status) {
            case 'PAYMENT_INTENT_CREATED':
              this.stripeClientPk = state.digitalWalletsState.digitalWalletsPaymentIntent.publicKey;
              this.stripeClientSk = state.digitalWalletsState.digitalWalletsPaymentIntent.clientSecret;
              this.connectedAccountId = state.digitalWalletsState.digitalWalletsPaymentIntent.connectedAccountId;
              this.initDigitalWalletsPaymentFlow();
              break;
            case 'PAYMENT_INTENT_FAILED':
              this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
              this.checkoutService.setCheckoutState('paymentValid', false);
              this.store.dispatch(new ClearStripeDigitalWalletPaymentIntent());
              this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
              break;
            default:
              break;
          }
        }
      });

    // set stripe card form validator rules
    this.stripeCardForm = this.fb.group({
    });
    this.paymentsenseForm = this.fb.group({
    });
    this.rmsCardForm = this.fb.group({
    });
    this.trustpaymentsCardForm = this.fb.group({
    });
    this.jccCardForm = this.fb.group({
    });
    this.bancontactForm = this.fb.group({
      accountholdername: [
        this.translate.instant('public.checkout.yourName'),
        Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(150)])
      ],
    });
    this.checkoutService.setOrderMetaState('accountHolderName', this.translate.instant('public.checkout.yourName'));
    this.vivaCardForm = this.fb.group({
      cardholder: ['', Validators.required],
      cardnumber: ['', Validators.compose([Validators.required, Validators.minLength(12), CustomValidators.luhnValidator()])],
      cvv: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(4),
          Validators.pattern('^[0-9]*$')
        ]),
      ],
      month: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(12)])],
      year: ['', Validators.compose([Validators.required, Validators.pattern('^(2){1}[0-9]{3}$')])]
    });
    this.vivaCardForm.valueChanges.subscribe(() => {
      if (this.vivaCardForm.valid) {
        this.checkoutService.setVivaError(!this.vivaCardForm.valid);
        this.checkoutService.setCheckoutState('orderBtnDisabled', false);
      } else {
        this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      }
    });

    RealexHpp.setHppUrl('https://pay.sandbox.realexpayments.com/pay');
  } // EOF: ngOnInit

  cardMaskFunction(rawValue: string): Array<RegExp> {
    const card = getValidationConfigFromCardNo(rawValue);
    if (card) {
      return card.mask;
    }
    return [...rawValue].map(() => /\d/);
  }

  initStripePaymentFlow() {
    // prepare charges for merchant
    if (this.cardInfo && this.stripeClientPk) {
      this.checkoutService.setStripe(Stripe(this.stripeClientPk, { stripeAccount: this.connectedAccountId }));
      this.elements = this.checkoutService.getStripe().elements();
      this.card = this.elements.create('card');
      this.card.mount(this.cardInfo.nativeElement);

      this.scrollToPayment.emit('');

      this.card.addEventListener('change', this.cardHandler);
    }
  }

  initIdealPaymentFlow() {
    // prepare charges for merchant
    if (this.cardInfoIdeal && this.stripeClientPk) {
      this.checkoutService.setStripe(Stripe(this.stripeClientPk, { stripeAccount: this.connectedAccountId }));
      this.elements = this.checkoutService.getStripe().elements();
      this.ideal = this.elements.create('idealBank');
      this.ideal.mount(this.cardInfoIdeal.nativeElement);

      this.scrollToPayment.emit('');

      this.ideal.addEventListener('change', this.idealCardHandler);
    }
  }

  initBancontactPaymentFlow() {
    // prepare charges for merchant
    if (this.stripeClientPk) {
      this.checkoutService.setStripe(Stripe(this.stripeClientPk, { stripeAccount: this.connectedAccountId }));
      this.checkoutService.setCheckoutState('orderBtnDisabled', false);
    }
  }

  initSquarePaymentFlow() {
    this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    this.checkoutService.setSquareError(true);

    if (this.checkoutService.squareApplicationId()) {
      // Create and initialize a payment form object
      const squarePaymentForm = new SqPaymentForm({
        // Initialize the payment form elements

        applicationId: this.checkoutService.squareApplicationId(),
        locationId: this.checkoutService.squareLocationId(),
        autoBuild: false,
        // Initialize the credit card placeholders
        card: {
          elementId: 'sq-card',
        },
        // SqPaymentForm callback functions
        callbacks: {
          /*
           * callback function: cardNonceResponseReceived
           * Triggered when: SqPaymentForm completes a card nonce request
           */
          cardNonceResponseReceived: (errors, nonce) => {
            if (errors) {
              this.checkoutService.setCheckoutState('orderBtnDisabled', true);
              this.checkoutService.setSquareError(true);
              // Log errors from nonce generation to the browser developer console.
              let err = 'Encountered errors: \n';
              errors.forEach((error) => {
                err += '  ' + error.message + '\n';
              });
              console.error(err);
              this.store.dispatch(new ErrorMessage(err));
              return;
            }

            const verificationDetails = {
              intent: 'CHARGE',
              amount: '' + this.checkoutService.cartData.totalDiscountedPrice,
              currencyCode: this.selectedStore.currency.isoCode,
              billingContact: {
                givenName: this.checkoutService.getOrderMetaData('customerName') ? this.checkoutService.getOrderMetaData('customerName') : 'NO NAME'
              }
            };

            // Initiate SCA flow
            squarePaymentForm.verifyBuyer(
              nonce,
              verificationDetails,
              (err, verificationResult) => {
                if (err == null) {
                  this.checkoutService.setCheckoutState('orderBtnDisabled', false);
                  this.checkoutService.setSquareError(false);
                  this.checkoutService.setSquareNonce(nonce);
                  this.checkoutService.setSquareVerificationToken(verificationResult.token);

                  this.onSubmit();
                }
              });

          },
          inputEventReceived: (inputEvent) => {
            this.checkoutService.setCheckoutState('orderBtnDisabled', !inputEvent.currentState.isCompletelyValid);
            this.checkoutService.setSquareError(!inputEvent.currentState.isCompletelyValid);
          },
          paymentFormLoaded: () => {
            this.scrollToPayment.emit('');
          }
        }
      });
      squarePaymentForm.build();
      this.checkoutService.setSquare(squarePaymentForm);

    }
  }

  initVivaPaymentFlow() {
    this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    this.checkoutService.setVivaError(true);

    VivaPayments.cards.setup({
      authToken: this.vivaAccessToken,
      baseURL: environment.name === 'production' ? 'https://api.vivapayments.com' : 'https://demo-api.vivapayments.com',
      cardHolderAuthOptions: {
        cardHolderAuthPlaceholderId: 'confirmation-container',
        cardHolderAuthInitiated: () => {
          this.checkoutService.setCheckoutState('orderBtnDisabled', true);
          this.renderer.removeClass(this.vivaCardVerificationModal.nativeElement, 'hide');
        },
        cardHolderAuthFinished: () => {
          this.renderer.addClass(this.vivaCardVerificationModal.nativeElement, 'hide');
        }
      }
    });

  }
  initPaymentsenseFlow() {
    this.paymentsense.nativeElement.innerHTML = '';
    this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    const config = {
      paymentDetails: {
        amount: '100',
        currencyCode: '826',
        paymentToken: this.paymentSenseOneTimeToken,
      },
      containerId: 'paymentsense-payment',
      fontCss: ['https://fonts.googleapis.com/css?family=Roboto'],
      styles: {
        base: {
          default: {
            color: 'black',
            textDecoration: 'none',
            fontFamily: '\'Roboto\', sans-serif',
            boxSizing: 'border-box',
            padding: '.375rem .75rem',
            boxShadow: 'none',
            fontSize: '0.875rem',
            borderRadius: '.25rem',
            lineHeight: '1.5',
            backgroundColor: '#fff',

          },
          focus: {
            color: '#495057',
            borderColor: '#80bdff',
          },
          error: {
            color: '#B00',
            borderColor: '#B00'
          },
          valid: {
            color: 'green',
            borderColor: 'green'
          },
          label: {
            display: 'none'
          }
        },
        cv2: {
          container: {
            width: '25%',
            float: 'left',
            boxSizing: 'border-box'
          },
          default: {
            borderRadius: '0 .25rem .25rem 0'
          }
        },
        expiryDate: {
          container: {
            width: '25%',
            float: 'left',
            borderRadius: '0rem',
          },
          default: {
            borderRadius: '0',
            borderRight: 'none'
          },
        },

        cardNumber: {
          container: {
            width: '50%',
            float: 'left',
          },
          default: {
            borderRadius: '.25rem 0 0 .25rem',
            borderRight: 'none'
          },
        }
      },
      onIframeLoaded: () => {
        if (!this.paymentSenseFormLoaded) {
          this.connectE.executePayment()
            .then((_) => {})
            .catch((_) => {});
          this.paymentSenseFormLoaded = true;
        }
        this.scrollToPayment.emit('');
      },
    };
    this.connectE = new Connect.ConnectE(config, (errors) => {
      this.checkoutService.setPaymentsenseError(!!errors.length);
      if (errors.length) {
        this.checkoutService.setStripeError('public.checkout.errors.fieldRequired');
      } else {
        this.checkoutService.setStripeError(null);
        this.checkoutService.setCheckoutState('orderBtnDisabled', false);
      }
    });
  }
  proceedRMSPaymentFlow() {
    console.log(this.rmsRequestJSON);
    RealexHpp.setMobileXSLowerBound(500);
    RealexHpp.lightbox.init(
      'autoload',
      (answer, close) => {
        if (answer === 'closed') {
          this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid));
          return;
        }
        close();
        if (answer.AUTHCODE) {
          const {
            ACCOUNT,
            AMOUNT,
            AUTHCODE,
            AVSADDRESSRESULT,
            AVSPOSTCODERESULT,
            BATCHID,
            CVNRESULT,
            HPP_FRAUDFILTER_RESULT,
            MERCHANT_ID,
            MESSAGE,
            ORDER_ID,
            PASREF,
            RESULT,
            SHA1HASH,
            TIMESTAMP,
          } = answer;

          this.store.dispatch(new CompleteRMSPayment(
            this.selectedStore.id,
            this.orderUuid, {
              ACCOUNT,
              AMOUNT,
              AUTHCODE,
              AVSADDRESSRESULT,
              AVSPOSTCODERESULT,
              BATCHID,
              CARD_PAYMENT_BUTTON: 'PAY NOW',
              CVNRESULT,
              HPP_FRAUDFILTER_RESULT,
              MERCHANT_ID,
              MESSAGE,
              ORDER_ID,
              PASREF,
              RESULT,
              SHA1HASH,
              TIMESTAMP,
            }
          ));
        } else {
          this.store.dispatch(new ErrorMessage(answer.MESSAGE || answer.message));
        }
      },
      this.rmsRequestJSON,
    );
  }

  proceedTrustPaymentsPaymentFlow() {
    const trustpaymentsForm: HTMLFormElement = document.querySelector('#trustpaymentsForm');
    trustpaymentsForm.submit();
  }

  initDigitalWalletsPaymentFlow() {
    // prepare charges for merchant
    if (this.stripeClientPk) {
      this.checkoutService.setStripe(Stripe(this.stripeClientPk, { stripeAccount: this.connectedAccountId }));

      this.paymentRequestStripe = this.checkoutService.getStripe().paymentRequest({
        country: this.selectedStore.address.country.code,
        currency: this.selectedStore.currency.isoCode.toLowerCase(),
        total: {
          label: 'Order ' + this.checkoutService.cartData.orderToken,
          amount: Number((this.checkoutService.cartData.totalDiscountedPrice * 100).toFixed(0)),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const elements = this.checkoutService.getStripe().elements();
      const prButton = elements.create('paymentRequestButton', { paymentRequest: this.paymentRequestStripe });

      this.paymentRequestStripe.canMakePayment().then((result) => {
        if (result) {
          if (result.googlepay === true || result.googlePay === true) {
            this.checkoutService.setSelectedDigitalPaymentMethod(PaymentMethod.DIGITAL_WALLET_STRIPE_GPAY);
          } else if (result.applepay === true || result.applePay === true) {
            this.checkoutService.setSelectedDigitalPaymentMethod(PaymentMethod.DIGITAL_WALLET_STRIPE_APAY);
          } else {
            this.checkoutService.setSelectedDigitalPaymentMethod(PaymentMethod.DIGITAL_WALLET_STRIPE_MPAY);
          }
          this.checkoutService.setCheckoutState('orderBtnDisabled', false);
          if (this.digitalWalletsPayError) { this.digitalWalletsPayError.nativeElement.style.display = 'none'; }
          if (this.digitalWalletsPayButton) {
            prButton.mount(this.digitalWalletsPayButton.nativeElement);
            // this.helper.scrollTo(this.digitalWalletsPayButton.nativeElement.offsetTop);
            this.scrollToPayment.emit('');

            prButton.on('click', ev => {
              if (!this.checkoutService.ifSubmitOrderReady()) {
                ev.preventDefault();
                return;
              }
            });
          }
        } else {
          if (this.digitalWalletsPayButton) { this.digitalWalletsPayButton.nativeElement.style.display = 'none'; }
          if (this.digitalWalletsPayError) { this.digitalWalletsPayError.nativeElement.style.display = 'block'; }
        }
      });

      this.paymentRequestStripe.on('paymentmethod', async (paymentMethodStripe) => {
        this.paymentMethodStripe = paymentMethodStripe;
        this.store.dispatch(new CartStatusUpdate('INIT_ONLINE_PAYMENT'));
      });

    }
  }

  async completeDigitalWalletsPaymentFlow() {
    if (this.selectedPaymentMethod === PAYMENT_METHOD.DIGITAL_WALLETS) {
      // Confirm the PaymentIntent without handling potential next actions (yet).
      if (!this.paymentMethodStripe) {
        this.store.dispatch(new ErrorMessage('public.global.errorUnexpected', '601'));
      }
      const {paymentIntent, error: confirmError} = await this.checkoutService.getStripe().confirmCardPayment(
        this.stripeClientSk,
        {payment_method: this.paymentMethodStripe.paymentMethod.id},
        {handleActions: false}
      );

      if (confirmError) {
        // Report to the browser that the payment failed, prompting it to
        // re-show the payment interface, or show an error message and close
        // the payment interface.
        console.log(confirmError);
        this.paymentMethodStripe.complete('fail');
        this.store.dispatch(new ErrorMessage(confirmError));
      } else {
        // Report to the browser that the confirmation was successful, prompting
        // it to close the browser payment method collection interface.
        this.paymentMethodStripe.complete('success');
        // Check if the PaymentIntent requires any actions and if so let Stripe.js
        // handle the flow.
        if (paymentIntent.status === 'requires_action') {
          // Let Stripe.js handle the rest of the payment flow.
          const {error} = await this.checkoutService.getStripe().confirmCardPayment(this.stripeClientSk);
          if (error) {
            // The payment failed -- let the customer choose a new payment method.
            this.checkoutService.setCheckoutState('orderBtnDisabled', true);
            this.store.dispatch(new CartStatusUpdate('LOADED'));
            const errors = [{code: 'paymentFailed'}];
            this.store.dispatch(new ToggleOrderSubmitError(true, errors));
            return;
          } else {
            // The payment has succeeded.
            this.checkoutService.setCheckoutState('orderBtnDisabled', true);
            this.store.dispatch(new CompleteStripePayment(this.selectedStore.id, this.orderUuid, paymentIntent.id));
          }
        } else {
          // The payment has succeeded.
          this.checkoutService.setCheckoutState('orderBtnDisabled', true);
          this.store.dispatch(new CompleteStripePayment(this.selectedStore.id, this.orderUuid, paymentIntent.id));
        }
      }

      this.digitalWalletsPayButton.nativeElement.style.display = 'none';
      this.paymentMethodStripe = null;

    }
  }

  setPaymentOption(id: number) {
    this.selectedPaymentOption = id;
    // Added setTimeout so we do not get ExpressionChangedAfterItHasBeenCheckedError
    // after redirecting back from error page to checkout screen
    setTimeout(() => {
      this.checkoutService.setOrderMetaState('paymentOption', id);
    }, 0);
  }

  setPaymentMethod(id: number) {
    this.selectedPaymentMethod = id;
    this.checkoutService.setOrderMetaState('paymentMethod', id);
    this.checkoutService.setStripeError('public.checkout.errors.fieldRequired');
    this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    if (id === PAYMENT_METHOD.JCC) {
      this.store.dispatch(new CreateJCCRequestJSON(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.STRIPE) { // Stripe selected
      this.store.dispatch(new CreateStripePaymentIntent(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.IDEAL) { // iDEAL selected
      this.store.dispatch(new CreateIdealPaymentIntent(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.BANCONTACT) { // Bancontact selected
      this.store.dispatch(new CreateBancontactPaymentIntent(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.PAYPAL) { // PayPal selected
      // do nothing at the moment
      // this.parseMetaData();
    }
    if (id === PAYMENT_METHOD.RMS) {
      this.store.dispatch(new CreateRMSRequestJSON(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.TRUSTPAYMENTS) {
      this.store.dispatch(new CreateTrustPaymentsRequestJSON(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.PAYMENTSENSE) {
      this.store.dispatch(new CreatePaymentsenseToken(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.SQUARE) {
      this.initSquarePaymentFlow();
    }
    if (id === PAYMENT_METHOD.VIVA) {
      // initiate viva token generation
      this.store.dispatch(new CreateVivaPaymentToken(this.selectedStore.id, this.orderUuid));
    }
    if (id === PAYMENT_METHOD.DIGITAL_WALLETS) {
      this.store.dispatch(new CreateStripeDigitalWalletPaymentIntent(this.selectedStore.id, this.orderUuid));
    }
    this.scrollToPayment.emit('');
  }

  togglePaymentOnlineOption() {
    if (this.selectedPaymentOption === PAYMENT_OPTION.PAY_NOW) {
      this.setPaymentOption(PAYMENT_OPTION.PAY_LATER);
      this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
      this.invalidatePayment(false);
    } else {
      this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
      this.invalidatePayment(true);
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.JCC);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE)
        && !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC)
        && !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.STRIPE);
      }
      if (this.ifEnabledPaymentMethod(PAYMENT_METHOD.IDEAL) && !this.ifEnabledMultiplePaymentMethods()) {
        this.setPaymentMethod(PAYMENT_METHOD.IDEAL);
      }
      if (this.ifEnabledPaymentMethod(PAYMENT_METHOD.BANCONTACT) && !this.ifEnabledMultiplePaymentMethods()) {
        this.setPaymentMethod(PAYMENT_METHOD.BANCONTACT);
      }
      if (this.ifEnabledPaymentMethod(PAYMENT_METHOD.DIGITAL_WALLETS) && !this.ifEnabledMultiplePaymentMethods()) {
        this.setPaymentMethod(PAYMENT_METHOD.DIGITAL_WALLETS);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.RMS);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.SQUARE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.VIVA);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS);
      }


      if (this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYPAL) && !this.ifEnabledMultiplePaymentMethods()) {
        // TODO: Uncomment this when Paypal implementation is ready
        // this.setPaymentMethod(1);
      }
      this.scrollToPayment.emit('');
    }
  }

  invalidatePayment(state: boolean) {
    this.store.dispatch(new AddCheckoutState('paymentValid', state));
  }

  /**
   * would you like to pay is displayed only in the use cases that the payment-option is optional
   * In all other cases (payment option = mandatory or payment option = disabled) it is not displayed
   */

  ifEnabledPaymentStripe() {
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings.PAYMENT_STRIPE_CREDIT_CARD_ENABLED) {
      return true;
    }
    return false;
  }

  ifEnabledPaymentPaypal() {
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings.PAYMENT_PAYPAL_ENABLED) {
      return true;
    }
    return false;
  }

  ifEnabledPaymentMethod(method: string | number) {
    if (typeof method === 'number') {
      method = this.checkoutService.getMethodKey(method);
      if (!method) {
        return false;
      }
    }
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings[method]
    ) {
      return true;
    }
    return false;
  }

  ifEnabledMultiplePaymentMethods() {
    return (this.checkoutService.countEnabledPaymentMethods() > 1);
  }

  // if only one payment method is enabled
  // set it as selected
  setIfSinglePaymentMethod() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return 0;
    }
    const $this = this;
    const selectedPaymentMethods = new Array();
    Object.keys(PAYMENT_METHOD).forEach(method => {
      // if ($this.selectedStore.settings[$this.getMethodKey(PAYMENT_METHOD[method])]) {
      //   selectedPaymentMethods.push(PAYMENT_METHOD[method]);
      // }

      if ($this.selectedStore.settings[$this.checkoutService.getMethodKey(PAYMENT_METHOD[method])]) {
        selectedPaymentMethods.push(PAYMENT_METHOD[method]);
      }
    });

    // Special case if JCC CREDIT CARD and STRIPE CREDIT CARD are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.STRIPE), 1);
    }

    // Special case if JCC CREDIT CARD and RMS are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.RMS), 1);
    }
    // Special case if JCC CREDIT CARD and PAYMENTSENSE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE), 1);
    }
    // Special case if JCC CREDIT CARD and SQUARE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if JCC CREDIT CARD and VIVA are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }
    if (this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] && selectedPaymentMethods.length === 1) {
      this.setPaymentMethod(selectedPaymentMethods[0]);
      return ;
    }
    // Special case if STRIPE CREDIT CARD and RMS are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.RMS), 1);
    }

    // Special case if STRIPE CREDIT CARD and PAYMENTSENSE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE));
    }

    // Special case if STRIPE CREDIT CARD and SQUARE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if STRIPE CREDIT CARD and VIVA are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if RMS and PAYMENTSENSE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE), 1);
    }

    // Special case if RMS and SQUARE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if RMS and VIVA are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if PAYMENTSENSE CREDIT CARD and SQUARE are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if PAYMENTSENSE CREDIT CARD and VIVA are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if SQUARE CREDIT CARD and VIVA are enabled then only SQUARE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    if (selectedPaymentMethods.length === 1) {
      this.setPaymentMethod(selectedPaymentMethods[0]);
    }
    // return multiple;
  }

  getControl(name: string, form: string = 'bancontactForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  private prepareOrderForPaypal() {
    // for now return hardcoded data for testing
    // TODO: PARSE CURRENT ORDER FOR PAYPAL
    // TODO BE: send payee email address
    return {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: this.catalogData.data.currency,
          value: this.cartData.totalDiscountedPrice
        }
      }],
    };
  }


  addOrderMeta(metaKey, control, formGroup = '') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  comingSoon() {
    alert('coming soon ...');
  }

  onChange(event) {
    const { error, complete } = event;
    if (error) {
      this.checkoutService.setStripeError(error.message);
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    } else if (!complete) {
      this.checkoutService.setStripeError('Incomplete card information.');
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    } else {
      this.checkoutService.setStripeError(null);
      this.checkoutService.setCheckoutState('orderBtnDisabled', false);
    }
    this.cd.detectChanges();
  }

  onIdealChange(event) {
    if (!event.error && event.value) {
      this.checkoutService.setStripeError(null);
      this.checkoutService.setCheckoutState('orderBtnDisabled', false);
      this.cd.detectChanges();
    } else {
      this.checkoutService.setStripeError(event.error);
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
    }
  }

  onStripeFormSubmit() {
    if (!this.checkoutService.getStripeError()) {
      this.store.dispatch(new CartStatusUpdate('INIT_ONLINE_PAYMENT'));
    }
  }

  onVivaFormSubmit() {
    this.store.dispatch(new CartStatusUpdate('INIT_ONLINE_PAYMENT'));
  }

  async onSubmit() {
    if (!this.checkoutService.ifSubmitOrderReady()) {
      return;
    }

    const billingDetails: any = {};

    if (this.checkoutService.getOrderMetaData('customerName')) {
      billingDetails.name = this.checkoutService.getOrderMetaData('customerName').trim();
    }
    if (this.checkoutService.getOrderMetaData('customerEmail')) {
      billingDetails.email = this.checkoutService.getOrderMetaData('customerEmail').trim();
    }
    if (this.checkoutService.getOrderMetaData('customerPhoneNumber')) {
      billingDetails.phone = this.checkoutService.getOrderMetaData('customerPhoneNumber').trim();
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.STRIPE) {

      const paymentDetails = {
        payment_method: {
          card: this.card,
          billing_details: billingDetails
        }
      };
      // as per comments on https://github.com/rigasp/stores/pull/90
      // it is decided not to pass additional card owner information
      this.checkoutService.getStripe().confirmCardPayment(
        this.stripeClientSk,
        paymentDetails
      ).then( result => {
        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          console.log(result.error.message);
          this.store.dispatch(new ErrorMessage(result.error.message));
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            this.checkoutService.setCheckoutState('orderBtnDisabled', true);
            this.store.dispatch(new CompleteStripePayment(this.selectedStore.id, this.orderUuid, result.paymentIntent.id));
          }
        }
      });
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.IDEAL) {
      // Redirects away from the client
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      this.checkoutService.getStripe().confirmIdealPayment(
        this.stripeClientSk, {
          payment_method: {
            ideal: this.ideal,
            billing_details: billingDetails
          },
          return_url: `${this.window.location.protocol}//${this.window.location.hostname}${(this.window.location.port === '4200') ? ':' + this.window.location.port : ''}/stripe/verification?storeId=${this.selectedStore.id}&orderUuid=${this.orderUuid}`,
        }
      );
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.BANCONTACT) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      if (!billingDetails.name) {
        billingDetails.name = 'No customer name provided';
      }
      this.checkoutService.getStripe().confirmBancontactPayment(
        this.stripeClientSk, {
          payment_method: {
            billing_details: billingDetails
          },
          return_url: `${this.window.location.protocol}//${this.window.location.hostname}${(this.window.location.port === '4200') ? ':' + this.window.location.port : ''}/stripe/verification?storeId=${this.selectedStore.id}&orderUuid=${this.orderUuid}`
        }
      );
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.SQUARE) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      this.store.dispatch(new CheckoutSquare(
        this.selectedStore.id,
        this.checkoutService.orderUuid,
        this.checkoutService.getSquareNonce(),
        this.checkoutService.getSquareVerificationToken()
      ));
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.VIVA) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      VivaPayments.cards
        .requestToken({
          amount: Number((this.checkoutService.cartData.totalDiscountedPrice * 100).toFixed(0))
        })
        .done((data) => {
          this.store.dispatch(new ChargeVivaPayment(this.selectedStore.id, this.checkoutService.orderUuid, data.chargeToken));
        })
        .fail((data) => {
          this.store.dispatch(new ErrorMessage(data.Error.ErrorText));
        });
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.PAYMENTSENSE) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      this.connectE.executePayment()
        .then((data) => {
          switch (data.statusCode) {
            case 0: // Successful
              this.store.dispatch(new CompletePaymentsensePayment(this.selectedStore.id, this.orderUuid, this.paymentSenseOneTimeToken));
              break;
            case 5: // Declined
              this.store.dispatch(new ErrorMessage('public.checkout.paymentsense.declined'));
              break;
            case 30: // Failed
              this.store.dispatch(new ErrorMessage(data.message));
              break;
          }
        })
        .catch((error) => {
          this.store.dispatch(new ErrorMessage(error.message));
        });
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.RMS) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      this.proceedRMSPaymentFlow();
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.TRUSTPAYMENTS) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true);
      this.proceedTrustPaymentsPaymentFlow();
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.JCC) {
      if (this.jccForm.nativeElement) {
        this.jccServerLink = environment.name === 'production' ?
                                                  'https://jccpg.jccsecure.com/EcomPayment/RedirectAuthLink'
                                                  : 'https://tjccpg.jccsecure.com/EcomPayment/RedirectAuthLink';
        setTimeout(_ => this.jccForm.nativeElement?.submit());
      }
    }
  }

  // go back to previous screen
  OnGoBack(event) {
    event.preventDefault();
    this.locationService.goBack();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.checkoutService.setStripe(null);
    this.checkoutService.setStripeError(null);
    if (this.card) {
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }
  }

}
