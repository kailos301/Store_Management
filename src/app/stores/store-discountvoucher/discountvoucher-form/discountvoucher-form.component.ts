import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { WindowRefService } from 'src/app/window.service';
import { DeleteDiscountVoucher, SaveDiscountVoucher } from '../+state/store-discountvoucher.actions';
import { DiscountVoucherState } from '../+state/store-discountvoucher.reducer';
import { getSelectedDiscountVoucher } from '../+state/store-discountvoucher.selectors';
import { DownloadFlyerFile } from '../../+state/stores.actions';
import { StoresService } from '../../stores.service';
import { SaveDiscountVoucherView } from '../store-discountvoucher.helpers';

@Component({
  selector: 'app-discountvoucher-form',
  templateUrl: './discountvoucher-form.component.html',
  styleUrls: ['./discountvoucher-form.component.scss']
})
export class DiscountvoucherFormComponent implements OnInit, OnDestroy {

  voucherForm: FormGroup;
  voucherId = 0;
  storeId: number;
  voucherLoaded = false;
  unsubscribe$: Subject<void> = new Subject<void>();
  discount: number;
  flyerImgPath: string;
  private window: Window;

  constructor(
    private actRoute: ActivatedRoute,
    private fb: FormBuilder,
    private storesService: StoresService,
    private voucherState: Store<DiscountVoucherState>,
    private storeState: Store<any>,
    private sanitizer: DomSanitizer,
    private windowRefService: WindowRefService
  ) { }

  ngOnInit() {
    this.storeId = this.actRoute.snapshot.parent.parent.params.id;
    this.window = this.windowRefService.nativeWindow;

    this.voucherId = this.actRoute.snapshot.params.voucherId;
    this.voucherForm = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discount: [''],
      initialValue: [''],
      type: ['', Validators.required],
      discountType: ['', Validators.required],
      isActive: ['']
    });
    if (this.voucherId > 0) {
      this.voucherState
        .pipe(select(getSelectedDiscountVoucher), takeUntil(this.unsubscribe$))
        .subscribe(v => {
          if (v) {
            this.voucherForm.patchValue({
              code: v.code,
              startDate: v.startDate,
              endDate: v.endDate,
              discount: v.discount,
              initialValue: v.initialValue,
              type: v.type,
              discountType: v.discountType,
              isActive: v.isActive
            });
            this.fetchFlyerImage(v);
          }
        });
      this.getControl('code').disable();
      this.getControl('discountType').disable();
      this.getControl('discount').disable();
      this.getControl('initialValue').disable();
      this.getControl('type').disable();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getControl(name) {
    return this.voucherForm.get(name);
  }
  isSelected(name) {
    return this.getControl('discountType').value === name;
  }

  fetchFlyerImage(voucher) {
    // should make https and remove localhost when develop.
    this.storesService.downloadOrRenderFlyerImage(this.storeId, this.getControl('code').value, true).subscribe(
      // tslint:disable-next-line
      b => { this.flyerImgPath = this.window['URL'].createObjectURL(b.blob); this.voucherLoaded = !!voucher; },
      err => {
        this.voucherLoaded = !!voucher;
      }
    );

  }

  setMonetry() {
    /* tslint:disable */
    this.voucherForm.controls['initialValue'].setValidators([Validators.required]);
    this.voucherForm.controls['discount'].clearValidators();
    this.voucherForm.controls['discount'].patchValue(0);
    this.voucherForm.controls['initialValue'].updateValueAndValidity();
    this.voucherForm.controls['discount'].updateValueAndValidity();
    /* tslint:enable */
  }

  setPercentage() {
    /* tslint:disable */
    this.voucherForm.controls['discount'].setValidators([Validators.required]);
    this.voucherForm.controls['initialValue'].clearValidators();
    this.voucherForm.controls['discount'].updateValueAndValidity();
    this.voucherForm.controls['discount'].patchValue("");
    this.voucherForm.controls['initialValue'].setErrors(null);
    this.discount = 0;
  }

  saveDiscountVoucher() {
    this.voucherForm.markAllAsTouched();
    if (this.voucherForm.valid) {
      const request = this.voucherForm.getRawValue();
      if (request.initialValue) {
        request.discount = request.initialValue;
      }
      this.voucherState.dispatch(new SaveDiscountVoucher(this.storeId, this.voucherId, request));
    } else {
      this.voucherForm.get('code').markAsTouched();
    }

  }

  deleteDiscountVoucher() {
    this.voucherState.dispatch(new DeleteDiscountVoucher(this.storeId, this.voucherId));
  }

  selectDiscountHandler($event) {
    this.discount = $event.target.value;
  }

  downloadFlyer() {
    this.storeState.dispatch(new DownloadFlyerFile(this.storeId, this.getControl('code').value));
  }
}
