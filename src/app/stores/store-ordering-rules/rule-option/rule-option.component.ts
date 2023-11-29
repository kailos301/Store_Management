import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { helpPage } from 'src/app/shared/help-page.const';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { DeleteOffer, SaveContentItem, SaveOffer } from '../../store-catalog/+state/stores-catalog.actions';
import { getOfferDetails } from '../../store-catalog/+state/stores-catalog.selectors';
import { DeleteDialogComponent } from '../../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { ContentItemModel, DeleteDialogData } from '../../store-catalog/stores-catalog';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';

@Component({
  selector: 'app-rule-option',
  templateUrl: './rule-option.component.html',
  styleUrls: ['./rule-option.component.scss']
})
export class RuleOptionComponent implements OnInit, OnDestroy {
  ruleOptionForm: FormGroup;
  scheduleList: any = [];
  childOfferHelpPage: any;
  destroyed$ = new Subject<void>();
  optionId = 0;
  catalogId = 0;
  optionGroupId = 0;
  ruleId = 0;
  storeId = 0;
  ruleOption$: Observable<any>;
  offerContentItem: any = [];
  contentItemId: number;
  stockManagementEnabled = false;
  contentItem: ContentItemModel;
  saveContentItemRequest: { languageTranslation: any[]; standardImage: any; };
  offerId: number;
  offerName: number;
  categoryId: number;
  scheduleId: number;

  constructor(private fb: FormBuilder,
              private actRouter: ActivatedRoute,
              private router: Router,
              private store: Store<StoresState>,
              private optionStore: Store<any>,
              private translate: TranslateService,
              private dialog: MatDialog,
              private storeService: StoresScheduleService) { }


  ngOnInit() {
    document.getElementById('settingsTabs').style.display = 'none';
    document.getElementById('settingsHeader').style.display = 'none';
    const stockLevelValidators = [
      Validators.pattern('^[0-9].*$'), Validators.min(0), Validators.max(100000)
    ];
    this.optionId = this.actRouter.snapshot.params.optid;
    this.ruleId = this.actRouter.snapshot.params.ruleid;
    this.optionGroupId = this.actRouter.snapshot.params.rogid;
    this.catalogId = this.actRouter.snapshot.queryParams.catalogId;
    this.storeId = this.actRouter.snapshot.parent.parent.params.id;
    this.storeService.getAllSchedules(this.storeId).pipe(takeUntil(this.destroyed$)).
      subscribe(res => this.scheduleList = res);
    this.ruleOptionForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])],
      price: [''],
      scheduleId: [0],
      isStockCheckEnabled: [''],
      stockLevel: ['', Validators.compose(stockLevelValidators)],
      sellable: ['true', Validators.compose([Validators.required])]
    }, { validator: CustomValidators.checkForOnlySpaces('name') });
    this.childOfferHelpPage = helpPage.catalog;

    if (this.optionId > 0) {
      this.ruleOption$ = this.optionStore.pipe(select(getOfferDetails), filter(offer => !!offer),
        tap(offer => this.ruleOptionForm.patchValue({
          name: offer.name,
          shortDescription: offer.shortDescription,
          price: offer.price,
          scheduleId: offer.scheduleId ? offer.scheduleId : 0,
          sellable: offer.isSellable,
          isStockCheckEnabled: offer.isStockCheckEnabled,
          stockLevel: offer.stockLevel
        })),
        tap(offer => this.offerContentItem = offer.languageTranslation),
        tap(offer => this.contentItemId = offer.contentItemId),
        tap(offer => this.categoryId = offer.categoryId),

        tap(offer => this.scheduleId = offer.scheduleId ? offer.scheduleId : 0),
        tap(offer => this.offerId = offer.offerId),
        tap(offer => this.offerName = offer.offerName)
      );
    }

    this.optionStore.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.stockManagementEnabled = s.settings.STOCK_MANAGEMENT;

      if (this.optionId > 0 && this.stockManagementEnabled) {
        this.ruleOptionForm.get('stockLevel').setValidators(stockLevelValidators.concat(Validators.required));
      } else {
        this.ruleOptionForm.get('stockLevel').setValidators(stockLevelValidators);
      }

    });
    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };
  }
  ngOnDestroy(): void {
    document.getElementById('settingsTabs').removeAttribute('style');
    document.getElementById('settingsHeader').removeAttribute('style');
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getControl(name: string) {
    return this.ruleOptionForm.get(name);
  }
  goBack() {
    this.router.navigate(
      ['/manager/stores/', this.storeId, 'settings', 'ordering-rules', this.ruleId, 'option-group', this.optionGroupId],
      { queryParams: { catalogId: this.catalogId } }
    );
  }
  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }
  saveContentItem() {
    if (this.optionId > 0) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.offerContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.optionStore.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }
  saveOffer() {
    const saveOfferRequest = this.ruleOptionForm.getRawValue();
    const offerId = +this.optionId === 0 ? 'CREATE_OFFER' : this.optionId;
    saveOfferRequest.hierarchyLevel = 'RULE';
    saveOfferRequest.categoryId = this.optionGroupId;
    if (+saveOfferRequest.scheduleId === 0) {
      delete saveOfferRequest.scheduleId;
    }
    this.optionStore.dispatch(
      new SaveOffer(
        saveOfferRequest, offerId, this.storeId, this.catalogId, this.optionGroupId, this.ruleId, null, null
      )
    );
  }
  deleteOffer() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.catalog.option.confirmDeleteOption');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.optionStore.dispatch(new DeleteOffer(this.storeId, this.catalogId, this.optionId, this.ruleId, this.optionGroupId));
      }
    });
  }

  gotoAddSchedule(): void {
    const qParam = { offerId: this.offerId, offerName: this.offerName, catalogId: this.catalogId, categoryId: this.categoryId };
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], { queryParams: qParam });
    } catch (e) {
      console.log('localstorage disabled');
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam,
        state: { backLink: this.router.url }
      });
    }

  }

  selectScheduleIdHandler($event){
    this.scheduleId = $event.target.value;
  }
}
