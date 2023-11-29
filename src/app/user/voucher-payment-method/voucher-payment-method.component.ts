import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {UserState} from '../+state/user.reducer';
import {Store} from '@ngrx/store';
import {takeUntil} from 'rxjs/operators';
import {getUserAffiliate, getVoucherPaymentMethod} from '../+state/user.selectors';
import {Subject} from 'rxjs/index';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserAffiliate} from '../../api/types/UserAffiliate';
import {UpdateAffiliate} from '../+state/user.actions';

@Component({
  selector: 'app-voucher-payment-method',
  templateUrl: './voucher-payment-method.component.html',
  styleUrls: ['./voucher-payment-method.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VoucherPaymentMethodComponent implements OnInit, OnDestroy {

  content: SafeHtml;
  unsubscribe$: Subject<void> = new Subject<void>();
  paymentMethodForm: FormGroup;
  affiliate: UserAffiliate;

  constructor(private store: Store<UserState>,
              private sanitizer: DomSanitizer,
              private fb: FormBuilder) { }

  ngOnInit() {

    this.store.select(getVoucherPaymentMethod)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
      this.content = this.sanitizer.bypassSecurityTrustHtml(s.data);
    });

    this.store.select(getUserAffiliate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((affiliate) => {
        this.affiliate = affiliate;
      });

    this.paymentMethodForm = this.fb.group({
      paymentDetails: [this.affiliate.paymentDetails, Validators.compose([Validators.maxLength(500)])],
      status: [this.affiliate.status, '']
    });
  }

  getControl(name: string) {
    return this.paymentMethodForm.get(name);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit() {
    this.store.dispatch(new UpdateAffiliate(this.affiliate.status, this.getControl('paymentDetails').value));
  }
}
