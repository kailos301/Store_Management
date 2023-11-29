import { Observable, forkJoin, Subject } from 'rxjs';
import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  HostListener,
  TemplateRef
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Paging } from 'src/app/api/types/Pageable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ActivatedRoute } from '@angular/router';
import { AuthState } from 'src/app/auth/+state/auth.reducer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreVoucherRequest } from '../../stores/stores';
import { filter, take, takeUntil } from 'rxjs/operators';
import { UserAffiliate } from '../../api/types/UserAffiliate';
import { Subscription } from 'rxjs/index';
import { UserState } from '../+state/user.reducer';
import { getUserAffiliate, getVouchersList } from '../+state/user.selectors';
import { CreateVoucher, LoadVouchersPage, UpdateAffiliate, UpdateVoucher, DownloadVoucherPdf } from '../+state/user.actions';
import { MatDialog } from '@angular/material/dialog';
import { TranslationComponent } from '../../stores/store-catalog/overlay/translation/translation.component';
import { VoucherComponent } from '../overlay/voucher/voucher.component';
import { Country } from 'src/app/api/types/Country';
import { Language } from 'src/app/api/types/Language';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { getProfile } from 'src/app/account/+state/account.selectors';

@Component({
  selector: 'app-store-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  initializeVoucher: StoreVoucherRequest = {
    id: 0,
    comment: '',
    discount: 0,
    total: null,
    commission: 0,
    mode: 'CREATE',
    voucherAssignmentStatus: null,
    code: '',
    endDate: null,
    formattedDiscountAmount: '',
    formattedCommissionAmount: ''
  };
  voucher: StoreVoucherRequest;
  affiliate: UserAffiliate;
  userId: any;
  paramsSubscription: any;
  vouchers$: Observable<any>;
  mode: 'CREATE' | 'UPDATE' | 'LIST' = 'LIST';
  countriesList: Country[] = [];
  languagesList: Language[] = [];
  printSetupForm: FormGroup;
  selectedLanguageLocale: string;
  selectedCountryCode: string;
  private destroy$ = new Subject();
  showPrintSetupBtn: boolean;
  voucherCode: string;

  @ViewChild('printVoucherSetup') printVoucherSetup: TemplateRef<any>;

  constructor(
    private store: Store<UserState>, private fb: FormBuilder,
    private route: ActivatedRoute, public dialog: MatDialog,
    private referenceDataService: ReferenceDataService,
    private elemRef: ElementRef
  ) { }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.userId = +params.id;
    });
    this.vouchers$ = this.store.pipe(select(getVouchersList));

    this.subscription = this.store.pipe(select(getUserAffiliate))
      .subscribe((affiliate) => {
        this.affiliate = affiliate;
        if (this.affiliate.status === 'STARTER' && this.affiliate.eligibleToUpgrade) {
          const upgradeStatus = 'PRO';
          this.store.dispatch(new UpdateAffiliate(upgradeStatus, this.affiliate.paymentDetails));
          this.affiliate.status = upgradeStatus;
        }
      });
    this.voucher = this.initializeVoucher;

    this.store.pipe(
      select(getProfile),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state.country && state.preferredLanguage) {
        this.userId = state.id;
        this.printSetupForm = this.fb.group({
          languageLocale: [state.preferredLanguage.locale],
          countryCode: [state.country.code],
        });
      }
    });

    forkJoin([this.referenceDataService.getCountries(), this.referenceDataService.getLanguages()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.countriesList = results[0].data;
        this.languagesList = results[1].data.filter(l => l.covered_admin_ui === true);
      });
  }

  copyVoucherCode(code) {
    const el = document.createElement('textarea');
    el.value = code;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadVouchersPage(paging));
  }

  addVoucher() {
    this.voucher = this.initializeVoucher;
    this.voucher.mode = 'CREATE';
    this.showDialog(this.voucher);
  }

  showDialog(voucherData) {
    const dialogRef = this.dialog.open(VoucherComponent, {
      width: '70%',
      data: voucherData,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action === 'CREATE') {
          this.store.dispatch(new CreateVoucher(result.formData));
        } else if (result.action === 'UPDATE') {
          this.store.dispatch(new UpdateVoucher(result.id, result.formData));
        }
      }
    });
  }

  openPrintSetupPopup(voucherCode: string) {
    this.voucherCode = voucherCode;
    const dialogRef = this.dialog.open(this.printVoucherSetup, {
      width: '50%'
    });
  }

  onNoClick() {
    this.dialog.closeAll();
  }

  getControl(name: string) {
    return this.printSetupForm.get(name);
  }


  onCountryChanged() {
    this.selectedCountryCode = this.getControl('countryCode').value;
  }

  onLanguageChanged() {
    this.selectedLanguageLocale = this.getControl('languageLocale').value;
  }

  downloadVoucherPDF() {
    this.onCountryChanged(); this.onLanguageChanged();
    this.store.dispatch(new DownloadVoucherPdf(this.userId, this.selectedLanguageLocale, this.selectedCountryCode, this.voucherCode));
    this.dialog.closeAll();
  }


  togglePrintSetupPopupBtn(index: number) {
    const elem = document.getElementById('print-setup-' + index);
    if (elem.classList.contains('showBtn')) {
      elem.classList.remove('showBtn');
    } else {
      elem.classList.add('showBtn');
    }
  }
}
