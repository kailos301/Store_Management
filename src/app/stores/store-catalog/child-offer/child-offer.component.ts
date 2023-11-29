import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OfferState } from '../+state/stores-catalog.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveOffer, SaveContentItem, LoadCategory, DeleteOffer } from '../+state/stores-catalog.actions';
import { ContentItemModel, SaveOfferView, ContentItemView, DeleteDialogData } from '../stores-catalog';
import { Store, select } from '@ngrx/store';
import { takeUntil, tap, filter } from 'rxjs/operators';
import { getOfferDetails, getOfferStatus } from '../+state/stores-catalog.selectors';
import { Observable, Subject } from 'rxjs';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { helpPage } from 'src/app/shared/help-page.const';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { TranslateService } from '@ngx-translate/core';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';

@Component({
  selector: 'app-child-offer',
  templateUrl: './child-offer.component.html',
  styleUrls: ['./child-offer.component.scss']
})
export class ChildOfferComponent implements OnInit, OnDestroy {
  childOfferForm: FormGroup;
  offerContentItem: any = [];
  contentItem: ContentItemModel;
  saveOfferRequest: SaveOfferView;
  catalogId: any;
  storeId: any;
  offerId: any;
  isCreateOffer = false;
  offer$: Observable<any>;
  contentItemId: number;
  saveContentItemRequest: ContentItemView;
  childCategoryId: any;
  parentOfferId: number;
  sourcePage: string;
  parentOfferName: any;
  stockManagementEnabled: boolean;
  private destroy$ = new Subject();
  childOfferHelpPage = helpPage.catalogOptionGroup;
  scheduleList: any = [];
  offerName: number;
  categoryId: number;
  offerStatus: string;

  constructor(
    private fb: FormBuilder,
    private offer: Store<OfferState>,
    private store: Store<StoresState>,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private storeService: StoresScheduleService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    const params = this.route.params as any;
    this.offerId = params._value.offerId;
    this.catalogId = params._value.catalogId;
    this.storeId = params._value.id;
    this.childCategoryId = this.route.snapshot.queryParams.categoryId;
    this.parentOfferId = this.route.snapshot.queryParams.parentOfferId;
    this.sourcePage = this.route.snapshot.queryParams.sourcePage;
    this.parentOfferName = this.route.snapshot.queryParams.parentOfferName;

    this.storeService.getAllSchedules(this.storeId).pipe(takeUntil(this.destroy$)).
      subscribe(res => this.scheduleList = res);

    const stockLevelValidators = [
      Validators.pattern('^[0-9].*$'), Validators.min(0), Validators.max(100000)
    ];

    this.childOfferForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])],
      price: [''],
      scheduleId: [0],
      externalProductId: ['', Validators.compose([Validators.maxLength(100)])],
      isStockCheckEnabled: [''],
      stockLevel: ['', Validators.compose(stockLevelValidators)],
      sellable: ['true', Validators.compose([Validators.required])],
      preselected: [false, Validators.compose([Validators.required])],
      vatExternalId: ['', Validators.compose([Validators.maxLength(100)])],
    }, { validator: CustomValidators.checkForOnlySpaces('name') });

    if (this.offerId !== 'CREATE_OFFER') {
      this.isCreateOffer = false;
      this.offer$ = this.offer.pipe(select(getOfferDetails), filter(offer => offer != null),
        tap(offer =>
          this.childOfferForm.patchValue({
            name: offer.name,
            shortDescription: offer.shortDescription,
            price: offer.price,
            externalProductId: offer.externalProductId,
            scheduleId: offer.scheduleId ? offer.scheduleId : 0,
            sellable: offer.isSellable,
            isStockCheckEnabled: offer.isStockCheckEnabled,
            stockLevel: offer.stockLevel,
            preselected: offer.attributeDtos && offer.attributeDtos.findIndex((at) => at.key === 'PRESELECTED' && at.value === true) !== -1,
            vatExternalId: offer.vatExternalId
          })
        ),
        tap(offer => this.offerContentItem = offer.languageTranslation),
        tap(offer => this.contentItemId = offer.contentItemId),
        tap(offer => this.categoryId = offer.categoryId),
        tap(offer => this.offerName = offer.offerName));
    } else {
      this.isCreateOffer = true;
    }

    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };
    if (this.childCategoryId !== undefined) {
      this.offer.dispatch(new LoadCategory(this.childCategoryId, this.storeId, this.catalogId));
    }

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.stockManagementEnabled = s.settings.STOCK_MANAGEMENT;

      if (!this.isCreateOffer && this.stockManagementEnabled) {
        this.childOfferForm.get('stockLevel').setValidators(stockLevelValidators.concat(Validators.required));
      } else {
        this.childOfferForm.get('stockLevel').setValidators(stockLevelValidators);
      }

    });

    this.store
      .pipe(
        select(getOfferStatus),
        takeUntil(this.destroy$),
      )
      .subscribe(s => {
        this.offerStatus = s;
      });
  }

  getControl(name: string) {
    return this.childOfferForm.get(name);
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  onChildOfferSave() {
    this.childOfferForm.markAllAsTouched();
    if (this.childOfferForm.valid) {
    this.saveOfferRequest = this.childOfferForm.value;
    this.saveOfferRequest.hierarchyLevel = 'CHILD';
    this.saveOfferRequest.categoryId = this.childCategoryId;
    if (!this.saveOfferRequest.attributeDtos) {
      this.saveOfferRequest.attributeDtos = [];
    }
    if (this.saveOfferRequest.preselected !== undefined) {
      this.saveOfferRequest.attributeDtos = this.saveOfferRequest.attributeDtos.filter((at) => at.key !== 'PRESELECTED');
      this.saveOfferRequest.attributeDtos.push({ key: 'PRESELECTED', value: this.saveOfferRequest.preselected });
      delete this.saveOfferRequest.preselected;
    }
    if (this.childOfferForm.value.scheduleId === 0) {
      delete this.saveOfferRequest.scheduleId;
    }
    this.offer.dispatch(new SaveOffer(
      this.saveOfferRequest,
      this.offerId,
      this.storeId,
      this.catalogId,
      this.childCategoryId,
      this.parentOfferId,
      this.sourcePage,
      null,
    ));
  } else {
    this.childOfferForm.get('name').markAsTouched();
  }
}

  saveContentItem() {
    if (!this.isCreateOffer) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null === this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.offerContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.offer.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    const qParam = { fromOptionGrp: true, parentOfferId: null };
    if (this.parentOfferId != null) {
      if (this.sourcePage === 'OFFER') {
        this.router.navigate(
          [
            `/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`,
            this.parentOfferId
          ],
          { queryParams: qParam }
        );
      } else {
        qParam.parentOfferId = this.parentOfferId;
        this.router.navigate(
          [`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/${this.childCategoryId}`],
          { queryParams: qParam }
        );
      }
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog`]);
    }
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
        this.offer.dispatch(new DeleteOffer(this.storeId, this.catalogId, this.offerId, this.parentOfferId));
      }
    });
  }

  gotoAddSchedule(): void {
    const qParam = {
      offerId: this.offerId,
      offerName: this.offerName,
      parentOfferId: this.parentOfferId,
      catalogId: this.catalogId,
      categoryId: this.categoryId,
    };
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam
      });
    } catch (e) {
      console.log('localstorage disabled');
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam,
        state: { backLink: this.router.url }
      });
    }

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
