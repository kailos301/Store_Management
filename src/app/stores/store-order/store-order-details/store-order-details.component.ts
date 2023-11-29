import { Order, OrderItem } from './../../stores';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ClientStoreOrderStatus } from './../store-order';
import { UpdateOrderStatus, DownloadOrderPdf, DownloadAndPrintOrderPdf } from '../+state/store-order.actions';
import { Store, select } from '@ngrx/store';
import { StoresOrdersState } from '../+state/store-order.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { getSelectedStore } from '../../+state/stores.selectors';
import { map, take, filter } from 'rxjs/operators';
import { helpPage } from 'src/app/shared/help-page.const';
import { MatDialog } from '@angular/material/dialog';
import { DayType, Utils } from 'src/app/stores/utils/Utils';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ClearOrderMeta } from 'src/app/public/store/+state/stores.actions';

@Component({
  selector: 'app-store-order-details',
  templateUrl: './store-order-details.component.html',
  styleUrls: ['./store-order-details.component.scss']
})
export class StoreOrderDetailsComponent implements OnInit, OnChanges {
  @Input() order: Order;
  id: any;
  storeLocaleTimeZone$: Observable<{locale: string; timezone: string; }>;
  orderDetailsHelpPage = helpPage.order;
  rejectWithReason = false;
  rejectReason: any;
  orderItems: OrderItem[] = [];
  isJapanese = false;

  @ViewChild('rejectOrder') rejectOrder: TemplateRef<any>;
  @ViewChild('rejectReason') rejectReasonElem: ElementRef;

  @ViewChild('closeOrder') closeOrder: TemplateRef<any>;
  invalidEnteredMinutes = false;
  invalidEstimatedTimeSelected = false;
  currentTime: Date = new Date(Date.now());
  estimatedTime: Date = new Date(Date.now());
  isReady = false;
  acceptOrderEstimatedTime = false;
  minutesEntered = 0;
  minutesSelected = 0;
  acceptOrderType: number;
  minutesArray = [5, 10, 15, 20, 30, 45, 60, 90];

  minutesForm: FormGroup;
  storeAliasName: string;
  isOrderChangeable = false;


  constructor(
    private fb: FormBuilder,
    private store: Store<StoresOrdersState> ,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.minutesForm = this.fb.group({
      minutesInput: ['1', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(4), Validators.pattern(/^[0-9]+\d*$/)])],
    });

    this.id = this.route.snapshot.params.id;

    this.storeLocaleTimeZone$ = this.store.pipe(
      select(getSelectedStore),
      filter(s => s.id > 0),
      map(s => ({
        locale: s.address.country.defaultLocale + '-' + s.address.country.code,
        timezone: s.timeZone
      }))
    );
    this.storeLocaleTimeZone$.subscribe((timezone) => {
      this.isJapanese = (timezone.locale === 'ja-JP');
    });
    this.store.pipe(select(getSelectedStore)).subscribe((store) => {
      this.storeAliasName = store.aliasName;
      if (store && store.settings) {
        this.isOrderChangeable = store.settings.ALLOW_ORDER_CHANGE;
      }
    });
    this.setAcceptOrderType(0);
    if (this.order.locationComment) {
      this.order.locationComment = this.order.locationComment.replace(new RegExp('\\n', 'g'), '<br>');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const order = changes.order.currentValue;
    if (order && order.status === 'SUBMITTED' && order.uuid !== '') {
      this.store.dispatch(new UpdateOrderStatus(
        order.uuid,
        'RECEIVED' as ClientStoreOrderStatus,
        order.rejectReason,
        order.estimatedTime,
        order.isReady,
      ));
    }
    const orderItems = order.orderItems;
    const hierarchyLevelToInt = {
      PARENT: 0,
      RULE: 1,
      RULE_DELIVERY_FEE: 2,
    };
    this.orderItems = orderItems.sort((a, b) => {
      const aLevel = a.hierarchyLevel ? hierarchyLevelToInt[a.hierarchyLevel] : 3;
      const bLevel = b.hierarchyLevel ? hierarchyLevelToInt[b.hierarchyLevel] : 3;
      return aLevel - bLevel;
    });
  }

  shouldDisplayTotal() {
    if (this.order.orderItems) {
      for (const item of this.order.orderItems) {
        if (item.totalNonDiscountedPrice !== 0) { return true; }
      }
      return (this.getCartTotal() === 0) ? false : true;
    } else {
      return false;
    }
  }

  getCartTotal() {
    let ret = 0;
    if (this.order.orderItems) {
      this.order.orderItems.forEach(item => {
        ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
      });
    }
    return ret;
  }

  /**
   * Gets if the parent order item price has to be shown
   *
   * @param orderItem The parent order item
   * @return If the parent order item price has to be shown
   */
  isShowParentItemPrice(orderItem: OrderItem) {
    if (orderItem.quantity > 1
      || (orderItem.discountValue !== undefined
        && orderItem.discountValue > 0)) {
      return true;
    }
    if (orderItem.childOrderItems !== undefined
      && orderItem.childOrderItems.length > 0) {
      let found = false;
      orderItem.childOrderItems.forEach(childOrderItem => {
        if (childOrderItem.offerPrice !== undefined
            && childOrderItem.offerPrice !== 0) { // Showing up the Item price if Child price is + or -
          found = true;
        }
      });
      return found;
    }
    return false;
  }

  updateStatus(orderUuid: string, status: ClientStoreOrderStatus, rejectReason: string) {
    if (this.invalidEnteredMinutes || this.invalidEstimatedTimeSelected) { return; }
    const orderCloseTime = (this.estimatedTime == null) ? null : this.estimatedTime;
    rejectReason = (rejectReason === '') ? null : rejectReason;
    this.isReady = this.isReady === false ? null : this.isReady;
    this.store.dispatch(new UpdateOrderStatus(orderUuid, status, rejectReason, orderCloseTime, this.isReady));
    if (status === 'CLOSED' || status === 'CANCELLED') {
      this.router.navigate([`/manager/stores/${this.id}/orders`]);
    }
    this.dialog.closeAll();
  }

  openRejectOrderPopup() {
    const dialogRef = this.dialog.open(this.rejectOrder, {
      width: '50%'
    });
  }

  openCloseOrderPopup() {
    const dialogRef = this.dialog.open(this.closeOrder, {
      width: '50%',
    });
  }

  onNoClick() {
    this.dialog.closeAll();
  }

  checkRejectWithReason(withReason: boolean) {
    if (withReason) {
      this.rejectWithReason = true;
    } else {
      this.rejectReasonElem.nativeElement.value = '';
      this.rejectWithReason = false;
    }
  }

  setAcceptOrderType(acceptOrderType: number) {
    this.acceptOrderType = acceptOrderType;
    if (+acceptOrderType === 0) {
      this.isReady = false;
      this.estimatedTime = null;
      this.acceptOrderEstimatedTime = false;
      this.setMinutesEntered(1);
      this.minutesSelected = null; // set to 0 to deselect radio button group
    } else if (+acceptOrderType === 1) {
      this.isReady = true;
      this.estimatedTime = null;
      this.acceptOrderEstimatedTime = false;
      this.setMinutesEntered(1);
      this.minutesSelected = null; // set to 0 to deselect radio button group
    } else if (+acceptOrderType === 2) {
      this.isReady = false;
      this.acceptOrderEstimatedTime = true;
    }
  }

  calculateEstimatedTime(minutesInput: number, fromRadioButtonGroup = false) {
    this.setAcceptOrderType(2);
    this.invalidEnteredMinutes =
      this.getControl('minutesInput', 'minutesForm').invalid &&
      (
        this.getControl('minutesInput', 'minutesForm').dirty ||
        this.getControl('minutesInput', 'minutesForm').touched
      );
    if (!this.invalidEnteredMinutes) {
      this.currentTime = new Date();
      this.estimatedTime = new Date(this.currentTime);
      this.setEstimatedTime(this.currentTime, +minutesInput);

      if (fromRadioButtonGroup) {
        this.setMinutesEntered(minutesInput);
      } else {
        this.minutesSelected = null; // set to 0 to deselect radio button group
      }
    } else {
      if (fromRadioButtonGroup) {
        this.currentTime = new Date();
        this.estimatedTime = new Date(this.currentTime);
        this.setEstimatedTime(this.currentTime, +minutesInput);
        this.setMinutesEntered(minutesInput);
      }
    }
  }

  onClickMinutesInput() {
    if (this.acceptOrderType !== 2) {
      this.setAcceptOrderType(2);
      this.currentTime = new Date();
      this.setEstimatedTime(this.currentTime);
      this.setMinutesEntered(1);
      this.invalidEnteredMinutes = false;
    }
  }

  setEstimatedTime(input: Date, minutesPlus: number = 1) {
    if (input && !isNaN(minutesPlus)) {
      this.estimatedTime = new Date(this.currentTime);
      this.estimatedTime.setMinutes(+this.estimatedTime.getMinutes() + +minutesPlus);
    }
  }

  setMinutesEntered(input: number) {
    this.getControl('minutesInput', 'minutesForm').reset();
    this.invalidEnteredMinutes = false;
    this.minutesEntered =  input;
    this.getControl('minutesInput', 'minutesForm').setValue(this.minutesEntered.toString());
  }

  timePickerChange(changedTime: Date) {
    this.estimatedTime = new Date(changedTime);
    if ((this.estimatedTime == null || this.estimatedTime === undefined) && this.acceptOrderType === 2) {
      this.invalidEstimatedTimeSelected = true;
    } else {
      this.invalidEstimatedTimeSelected = false;
    }
    this.currentTime = new Date();
    if (this.estimatedTime != null) {
      const diffMs = this.estimatedTime.getTime() - this.currentTime.getTime();
      const diffMins = +Math.round(+diffMs / 60000 + 0.5);
      this.setMinutesEntered(diffMins);
      this.minutesSelected = diffMins;
    } else {
      this.setMinutesEntered(1);
      this.minutesSelected = 1;
    }
  }

  orderDownload() {
    this.store.pipe(
      take(1),
    ).subscribe(() => {
      this.store.dispatch(new DownloadOrderPdf(
        this.id,
        this.order.uuid,
        this.order.uiLanguageLocale,
        this.order.catalogLanguageLocale,
      ));
    });
  }

  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  get DayType(): typeof DayType {
    return DayType;
  }

  onOrderPrint() {
    this.store.pipe(
      take(1),
    ).subscribe(() => {
      this.store.dispatch(new DownloadAndPrintOrderPdf(
        this.id,
        this.order.uuid,
        this.order.uiLanguageLocale,
        this.order.catalogLanguageLocale,
      ));
    });
  }

  getControl(name: string, form: string): FormControl {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  changeOrder() {
    this.store.dispatch(new ClearOrderMeta({}));
    this.router.navigateByUrl(`/manager/stores/${this.order.storeId}/orders/capture/${this.order.storeAliasName}#orderUuid/${this.order.uuid}/cart?clang=${this.order.catalogLanguageLocale}&ulang=${this.order.uiLanguageLocale}`);
  }
}
