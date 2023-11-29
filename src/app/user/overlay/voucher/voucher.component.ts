import { Observable, combineLatest } from 'rxjs';
import {Component, OnInit, Inject, ElementRef, ViewChild, SimpleChanges, OnChanges, OnDestroy} from '@angular/core';
import { Store, select } from '@ngrx/store';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/index';
import {StoreVoucherRequest} from '../../../stores/stores';
import {UserAffiliate} from '../../../api/types/UserAffiliate';
import {UserState} from '../../+state/user.reducer';
import {getUserAffiliate} from '../../+state/user.selectors';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { UserProfile } from 'src/app/api/types/User';
import { getProfile } from 'src/app/account/+state/account.selectors';

@Component({
  selector: 'app-store-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  voucherForm: FormGroup;
  voucher: StoreVoucherRequest;
  affiliate: UserAffiliate;
  paramsSubscription: any;
  mode: string;
  isSliderDisabled = false;
  subscriptionPrice: number;
  subscriptionCurrency: string;
  voucherValue: number;
  commissionValue: number;
  discountValue: number;
  userLocale: string;

  constructor(
    private store: Store<UserState>,
    public dialogRef: MatDialogRef<VoucherComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoreVoucherRequest,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.voucher = Object.assign({}, this.data);
    this.subscription = combineLatest([this.store.select(getUserAffiliate)
      , this.store.select(getProfile)]).pipe()
      .subscribe(state => {
        this.affiliate = state[0];
        this.voucher.commission = this.affiliate.defaultVoucherValue - this.voucher.discount;
        this.subscriptionPrice = state[1].country.subscriptionPrice;
        this.subscriptionCurrency = state[1].country.subscriptionCurrency;
        this.userLocale = state[1].country.defaultLocale;
        this.voucherValue = (this.subscriptionPrice * this.affiliate.defaultVoucherValue) / 100;
        this.commissionValue = (this.subscriptionPrice * this.voucher.commission) / 100;
        this.discountValue =  (this.subscriptionPrice * this.voucher.discount) / 100;
      });

    if (this.data.mode === 'CREATE') {
      this.voucherForm = this.fb.group({
        total: [
          this.voucher.total,
          Validators.compose([
            Validators.required,
            Validators.pattern(/^-?(0|[1-9]\d*)?$/),
            Validators.min(1),
            Validators.max(this.affiliate.remainingVouchers)
          ])
        ],
        comment: [this.voucher.comment, ''],
        discount: [this.voucher.discount, '']
      });
    } else {
      this.isSliderDisabled = (this.voucher.voucherAssignmentStatus != null &&
        (this.voucher.voucherAssignmentStatus === 'USED' ||
          this.voucher.voucherAssignmentStatus === 'RESERVED'));
      this.voucherForm = this.fb.group({
        comment: [this.voucher.comment, ''],
        discount: [this.voucher.discount, '']
      });
    }
    if (this.data != null) {
      this.voucherForm.patchValue({
        total: this.data.total,
        comment: this.data.comment,
        discount: this.data.discount
      });
      this.mode = this.data.mode;
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  handleTotal(event) {
    if (event.target.value > this.affiliate.remainingVouchers) {
      this.getControl('total').setValue(this.affiliate.remainingVouchers);
    }
  }

  doNotAllowExponential(event) {
    return +event.keyCode !== 69;
  }

  updateDiscount(event) {
    this.voucher.discount = event.value;
    this.voucher.commission = this.affiliate.defaultVoucherValue - this.voucher.discount;
    this.commissionValue = (this.subscriptionPrice * this.voucher.commission) / 100;
    this.discountValue =  (this.subscriptionPrice * event.value) / 100;
  }

  getControl(name: string) {
    return this.voucherForm.get(name);
  }

  onSubmit() {
    if (this.mode === 'CREATE') {
      this.dialogRef.close({ action: this.mode, formData: this.voucherForm.value});
    } else if (this.mode === 'UPDATE') {
      this.dialogRef.close({ action: this.mode, formData: this.voucherForm.value, id: this.voucher.id });
    }
  }

  onNoClick() {
    this.dialogRef.close('mat-dialog-0');
  }

  copyVoucherCode() {
    const el = document.createElement('textarea');
    el.value = this.voucher.code.toString();
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  selectCode() {
    const doc = document;
    const text = doc.getElementById('lblVouchercode');
    if (window.getSelection) {
        const selection = window.getSelection();
        const range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
  }
}
