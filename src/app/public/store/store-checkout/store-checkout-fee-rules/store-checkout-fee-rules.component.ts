import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { act } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelperService } from 'src/app/public/helper.service';
import { ClientStore, Offer, OfferVariant } from 'src/app/stores/stores';
import { AddCheckoutState, AddRuleOrderItem, RemoveRuleOrderItem } from '../../+state/stores.actions';
import { CatalogState } from '../../+state/stores.reducer';
import { getCurrentCartState, getSelectedLang, getSelectedStore, getStoreRules } from '../../+state/stores.selectors';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-store-checkout-fee-rules',
  templateUrl: './store-checkout-fee-rules.component.html',
  styleUrls: ['./store-checkout-fee-rules.component.scss']
})
export class StoreCheckoutFeeRulesComponent implements OnInit, OnDestroy {

  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  selectedLang$;
  storeRules;
  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  selectedItem: Offer;
  selectedOrderUuid: string = null;
  basketEnabled = true;
  childOffers: any[];
  childCheckboxAsRadioOfferItemsList: any[];
  childSelectedCheckboxOfferItems: any[];
  childSelectedRadioOfferItems: any[];
  publicGlobalStandard: string;

  radioCategoriesFg: FormGroup;
  radioCategoriesFgArr = new FormArray([]);
  offerVariants: any[];

  constructor(
      private store: Store<CatalogState>
    , public helper: HelperService
    , private fb: FormBuilder
    , public checkoutService: CheckoutService
    , private translateSer: TranslateService
  ) { }

  ngOnInit() {
    this.childCheckboxAsRadioOfferItemsList = [];
    this.childSelectedCheckboxOfferItems = [];
    this.childSelectedRadioOfferItems = [];
    this.store.dispatch(new AddCheckoutState('feeRuleFormValid', true));
    this.selectedLang$  = this.store.select(getSelectedLang);

    combineLatest([
      this.store.select(getStoreRules)
    , this.store.select(getCurrentCartState)
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          if (state[0] && state[0].storeRulesState && state[0].storeRulesState.storeRules) {
            this.storeRules = state[0].storeRulesState.storeRules;
          }
          this.checkoutService.setApplicableFeeRulesToInit();
          this.radioButtonValidationRules();
        }
      });

    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.selectedStore$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedStore = value;
        if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
          this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
                                    + '-'
                                    + this.selectedStore.address.country.code;
          this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
        }

        if (this.selectedStore.settings) {
          this.basketEnabled = this.basketEnabled &&
              (this.selectedStore.settings.ENABLE_ORDERING || this.selectedStore.settings.BASKET_ENABLED);
        }
      });

  }

  isApplicableStoreRule(rule) {
    if (!rule.isActive) {
      return false;
    }
    let allActionsHaveOffers = true;
    rule.actions.forEach(action => {
      if (!action.data.offers) {
        allActionsHaveOffers = false;
      }
    });
    let allConditionsAreTrue = true;
    rule.conditions.forEach(condition => {
      switch (condition.type) {
        case 'DELIVERY_MODE':
          if (this.checkoutService.getPickupMethodStr() !== condition.data.deliveryMode) {
            allConditionsAreTrue = false;
          }
          break;
        default:
          // do nothing
          break;
      }
    });
    return allActionsHaveOffers && allConditionsAreTrue;
  }

  radioButtonValidationRules() {
    const radioGroups = {};
    const childOrderItems = [];
    this.childSelectedCheckboxOfferItems = [];
    this.childSelectedRadioOfferItems = [];

    this.offerVariants = [];
    if (!this.storeRules) {
      return;
    }
    this.storeRules.forEach((rule,  ruleIndex) => {
      // check if rules should be applied:
      if (this.isApplicableStoreRule(rule)) {
        this.checkoutService.setApplicableFeeRule(rule);
        this.offerVariants[ruleIndex] = [];
        this.radioCategoriesFgArr[ruleIndex] = [];
        if (!rule.actions) {
          return;
        }
        rule.actions.forEach((action, actionIndex) => {
          if (action.type === 'DELIVERY_FEE_MODIFIER_CATEGORY') {
            this.offerVariants[ruleIndex][actionIndex] = [];
            this.radioCategoriesFgArr[ruleIndex][actionIndex] = [];
            if (!action.data.offers) {
              return;
            }
            if (action.data.offers) {
              let defaultValue = '';
              if (action.data.offers) {
                action.data.offers.forEach(offerItem => {
                  if (childOrderItems.includes(offerItem.offerId) || this.checkoutService.ifCartOfferRule(offerItem.offerId)) {
                    defaultValue = offerItem.offerId.toString();
                    this.childSelectedRadioOfferItems[action.data.categoryId] = offerItem;
                  }
                });
              }
              // adding required validator to cat + action.data.categoryId
              radioGroups['cat' + action.data.categoryId] = [defaultValue, [Validators.required]];
              this.store.dispatch(new AddCheckoutState('feeRuleFormValid', !!defaultValue));
            }
            this.radioCategoriesFgArr[ruleIndex][actionIndex] = this.fb.group(radioGroups);
            this.radioCategoriesFg = this.fb.group(radioGroups);
          }
        });
      }
    });
  }

  getLongDescription(content: string, numOfChar: number) {
    // tslint:disable-next-line
    return `${this.getExcerpt(content, numOfChar).excerpt} <span class="excerpt-remainder">${this.getExcerpt(content, 150).reminder}</span>`;
  }

  private getExcerpt(content: string, numOfChar: number) {
    return this.helper.getExcerpt(content, numOfChar);
  }

  OnExpandLongDescription(event) {
    event.preventDefault();
    const target = event.target || event.srcElement || event.currentTarget;
    target.classList.add('full');
  }

  getControl(name: string, form: string = 'specialNoteFg') {
    return this[form].get(name);
  }


  // persist to Order
  OnSelectOfferVariant(ruleIndex, offerItem) {

    if (this.checkoutService.ifCartOfferRule(offerItem.offerId) && this.checkoutService.ifCartOfferRuleMinZeroMaxOne(offerItem.offerId)) {
      // a rule with cardinality min=0 and max=1 which is already in the cart is encountered
      // we need to remove it from the cart
      const offerItemUuid = this.checkoutService.getOfferRuleUuid(offerItem.offerId);
      if (offerItemUuid !== '') {
        this.store.dispatch(new RemoveRuleOrderItem(this.selectedStore.id, this.checkoutService.orderUuid, offerItemUuid));
      }
      return;
    }

    const childItemRequests = [];
    if (!this.radioCategoriesFg.valid) {
      this.store.dispatch(new AddCheckoutState('feeRuleFormValid', false));
      // return;
    } else {
      this.store.dispatch(new AddCheckoutState('feeRuleFormValid', true));
    }
    if (this.radioCategoriesFg.value) {
      Object.keys(this.radioCategoriesFg.controls).forEach(key => {
        if (this.radioCategoriesFg.controls[key].value) {
          childItemRequests.push(
            {
              ruleIndex,
              offerId: parseInt((key.indexOf('cat') !== -1)   ? this.radioCategoriesFg.controls[key].value : key.replace('var', ''), 10),
              quantity: 1,
              price: offerItem.price
            }
          );
        }
      });
    }
    if (childItemRequests.length > 0) {
      /*
      * we will no longer persist the rule offers to checkout state
      * we will add/persist them on select directly to the order/be
      */
      this.store.dispatch(new AddRuleOrderItem(this.selectedStore.id, this.checkoutService.orderUuid, offerItem));
    }
  }

  // child categories
  OnToggleChildOfferPrice($event, offerItem, ruleIndex) {
    if ($event.target.checked === true) {
      this.childSelectedCheckboxOfferItems.push(offerItem);
    } else {
      this.childSelectedCheckboxOfferItems.forEach((childOfferItem, key) => {
        if (childOfferItem.offerId === offerItem.offerId) {
          this.childSelectedCheckboxOfferItems.splice(key, 1);
        }
      });
    }
    this.OnSelectOfferVariant(ruleIndex, offerItem);
  }

  OnToggleSingleChildOfferPrice($event, offerItem, categoryId, ruleIndex) {
    if (this.radioCategoriesFg.get('var' + offerItem.offerId).value === false) {
      this.radioCategoriesFg.get('var' + offerItem.offerId).setValue('');
    } else {
      this.radioCategoriesFg.get('var' + offerItem.offerId).setValue(offerItem.offerId);
    }
    this.childCheckboxAsRadioOfferItemsList[categoryId].forEach(item => {
      if (offerItem.offerId !== item) {
        this.radioCategoriesFg.get('var' + item).setValue('');
        // remove any other options from this category that may be selected
        this.childSelectedCheckboxOfferItems = this.childSelectedCheckboxOfferItems.filter(value => value.offerId !== item) ;
      }
    });
    if ($event.target.checked === true) {
      this.childSelectedCheckboxOfferItems.push(offerItem);
    } else {
      this.childSelectedCheckboxOfferItems.forEach((childOfferItem, key) => {
        if (childOfferItem.offerId === offerItem.offerId) {
          this.childSelectedCheckboxOfferItems.splice(key, 1);
        }
      });
    }
    this.OnSelectOfferVariant(ruleIndex, offerItem);
  }

  OnRequireChildOfferPrice(catId, offerItem, ruleIndex) {
    this.childSelectedRadioOfferItems[catId] = offerItem;
    this.OnSelectOfferVariant(ruleIndex, offerItem);
  }
   // EOF: child categories

  ngOnDestroy() {
    this.checkoutService.setApplicableFeeRulesToInit();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
