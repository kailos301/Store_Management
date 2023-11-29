import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import {
  SaveOffer,
  UploadOfferImage,
  SaveContentItem,
  AssociateOfferVariants,
  SaveOfferPosition,
  DeleteOffer,
  DeleteOfferImage,
  PatchSaveOffer,
  DownloadOfferImage,
  StoresCatalogActionType,
  StoresCatalogAction,
} from '../+state/stores-catalog.actions';
import {
  ContentItemModel,
  SaveOfferView,
  ContentItemView,
  AssociateOffersView,
  SaveOfferPositionView,
  DeleteDialogData
} from '../stores-catalog';
import { OfferState } from '../+state/stores-catalog.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresCatalogService } from '../stores-catalog.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil, tap, filter, take, map } from 'rxjs/operators';
import { getOfferDetails, getOfferImage, getOfferStatus } from '../+state/stores-catalog.selectors';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { helpPage } from 'src/app/shared/help-page.const';
import { TranslateService } from '@ngx-translate/core';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-store-offer',
  templateUrl: './store-offer.component.html',
  styleUrls: ['./store-offer.component.scss']
})
export class StoreOfferComponent implements OnInit, OnDestroy {
  offerForm: FormGroup;
  contentItem: ContentItemModel;
  saveOfferRequest: SaveOfferView;
  offer$: Observable<any>;
  private offerId;
  offerDetails: any;
  categoryList: any = [];
  offerContentItem: any = [];
  catalogId: any;
  private destroy$ = new Subject();
  isCreateOffer = false;
  scheduleList: any = [];
  storeId: any;
  contentItemId: number;
  saveContentItemRequest: ContentItemView;
  backFromOptionGroup = false;
  backFromVariant = false;
  stockManagementEnabled: boolean;
  offerName: string;
  offerImageUrl$: Observable<any>;
  storeOfferHelpPage = helpPage.catalogOffer;
  categoryId: number;
  offerStdImage: any;
  attributeDtos = [];
  storeVatPercentage: number;
  maxItemPerSlot: number;
  countAgainstSlots: string;
  isStoreOperator = false;
  countslot: number;
  offerStatus: string;
  scheduleId: number;
  discount: number;
  offerImage: File;
  isSubmitted = false;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: Store<StoresState>,
    private router: Router,
    private fb: FormBuilder,
    private offer: Store<OfferState>,
    private service: StoresCatalogService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private schedule: StoresScheduleService,
    private translate: TranslateService,
    private actions$: Actions
  ) { }

  ngOnInit() {
    const params = this.route.params as any;
    this.offerId = params._value.offerId;
    this.catalogId = params._value.catalogId;
    this.storeId = params._value.id;
    this.categoryId = this.route.snapshot.queryParams.categoryId ? this.route.snapshot.queryParams.categoryId : 0;


    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && (s.storeRoles[+this.storeId] === 'STORE_STANDARD')) {
        this.isStoreOperator = true;
      }
    });
    this.service.listCatalogCategories(this.catalogId, this.storeId).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.categoryList = result;
    });

    if (!this.isStoreOperator) {
      this.schedule.getAllSchedules(this.storeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => {
          this.scheduleList = result;
        });
    }

    const numberValidators = [
      Validators.pattern('^[0-9].*$'), Validators.min(0), Validators.max(100000)
    ];

    this.offerForm = this.fb.group({
      categoryId: ['', Validators.compose([Validators.required])],
      price: [''],
      discount: ['', Validators.compose([Validators.pattern('^[0-9].*$')])],
      discountType: [''],
      scheduleId: [0],
      externalProductId: ['', Validators.compose([Validators.maxLength(100)])],
      isslotagaistcheckenabled: [''],
      isStockCheckEnabled: [''],
      countAgainstSlots: ['', Validators.compose(numberValidators)],
      stockLevel: ['', Validators.compose(numberValidators)],
      incrementbyLevel: ['', Validators.compose(numberValidators)],
      sellable: ['true', Validators.compose([Validators.required])],
      isOrderable: ['true', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])],
      longDescription: [null, Validators.compose([Validators.maxLength(1000)])],
      priceDescription: [null, Validators.compose([Validators.minLength(2), Validators.maxLength(50)])],
      vatPercentage: [0, Validators.compose([Validators.min(0), Validators.max(100)])],
      vatExternalId: ['', Validators.compose([Validators.maxLength(100)])],
    }, {
      validator: [
        CustomValidators.checkForOnlySpaces('name'),
        CustomValidators.discountValidator('price', 'discount', 'discountType')
      ]
    });

    if (this.offerId !== 'CREATE_OFFER') {
      this.isCreateOffer = false;
      this.offer$ = this.offer.pipe(
        select(getOfferDetails),
        filter(offer => offer != null),
        tap(offer =>
          this.offerForm.patchValue({
            categoryId: offer.categoryId,
            price: offer.price,
            discount: offer.discount,
            externalProductId: offer.externalProductId,
            discountType: ((offer.discount === undefined) ? 'NODISCOUNT' : offer.discountType),
            scheduleId: offer.scheduleId ? offer.scheduleId : 0,
            sellable: offer.isSellable,
            isslotagaistcheckenabled: offer.isslotagaistcheckenabled,
            isStockCheckEnabled: offer.isStockCheckEnabled,
            countAgainstSlots:
              offer.attributeDtos.length > 0 &&
                offer.attributeDtos.filter(x => x.key === 'COUNT_AGAINST_SLOT')[0] &&
                offer.attributeDtos.filter(x => x.key === 'COUNT_AGAINST_SLOT')[0].value
                ? offer.attributeDtos.filter(x => x.key === 'COUNT_AGAINST_SLOT')[0].value
                : null,
            stockLevel: offer.stockLevel,
            incrementbyLevel: offer.incrementbyLevel,
            isOrderable: offer.isOrderable,
            name: offer.name,
            shortDescription: offer.shortDescription,
            longDescription: offer.longDescription,
            priceDescription: offer.priceDescription,
            vatPercentage: offer.vatPercentage ? offer.vatPercentage : 0,
            vatExternalId: offer.vatExternalId
          })
        ),
        tap(offer => this.offerName = offer.name),
        tap(offer => this.offerContentItem = offer.languageTranslation),
        tap(offer => this.contentItemId = offer.contentItemId),
        tap(offer => this.offerStdImage = offer.standardImage),
        tap(offer => this.attributeDtos = offer.attributeDtos),
        tap(offer => this.scheduleId = offer.scheduleId ? offer.scheduleId : 0),
        tap(offer => this.discount = offer.discount ? offer.discount : 0),
        tap(offer => this.categoryId = offer.categoryId ? offer.categoryId : 0)
      );
      this.offerImageUrl$ = this.offer.pipe(select(getOfferImage));
      this.offerImageUrl$
        .pipe(
          takeUntil(this.destroy$)
        ).subscribe(imageUrl => {
          this.offerStdImage = imageUrl;
      });
    } else {
      this.scheduleId = 0;
      this.discount = 0;
      this.isCreateOffer = true;
      this.offerForm.patchValue({
        discountType: 'NODISCOUNT'
        , categoryId: this.categoryId ? this.categoryId : ''
      });
    }
    this.saveOfferRequest = this.offerForm.value;
    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.maxItemPerSlot = s.settings.MAX_ITEMS_PER_SLOT;
      this.stockManagementEnabled = s.settings.STOCK_MANAGEMENT;
      this.storeVatPercentage = s.vatPercentage;
      if (!this.isCreateOffer && this.stockManagementEnabled) {
        this.offerForm.get('stockLevel').setValidators(numberValidators.concat(Validators.required));
      } else {
        this.offerForm.get('stockLevel').setValidators(numberValidators);
      }
    });

    this.store.pipe(
      select(getOfferStatus),
      takeUntil(this.destroy$),
    ).subscribe(s => {
      this.offerStatus = s;
    });
    this.subscription = this.actions$.pipe(
      ofType<StoresCatalogAction>(
        StoresCatalogActionType.SaveOfferFailed
      ),
      map(_ => { this.isSubmitted = false; }),
    ).subscribe();
  }

  getControl(name: string) {
    return this.offerForm.get(name);
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }
  onCountAgainstSlotsChange($event) {
    if ($event.target.checked) {
      this.offerForm.get('countAgainstSlots').setValue(1);
    } else {
      this.offerForm.get('countAgainstSlots').setValue(0);
    }
  }
  isSelected(name) {
    return this.offerForm.value.discountType === name;
  }

  downloadImage() {
    this.store.dispatch(new DownloadOfferImage(this.offerStdImage));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onOfferSave(method) {
    if (this.isSubmitted) {
      return;
    }

    this.isSubmitted = true;
    this.offerForm.markAllAsTouched();
    if (this.offerForm.valid) {
      this.saveOfferRequest = this.offerForm.value;

      this.saveOfferRequest.hierarchyLevel = 'PARENT';
      if (this.offerForm.value.discountType === 'NODISCOUNT') {
        delete this.saveOfferRequest.discount;
        delete this.saveOfferRequest.discountType;
      }
      if (this.offerForm.value.scheduleId === 0) {
        delete this.saveOfferRequest.scheduleId;
      }
      if (this.attributeDtos && this.attributeDtos.length >= 0) {
        if (this.attributeDtos.filter(x => x.key === 'COUNT_AGAINST_SLOT')[0]) {
          this.attributeDtos.filter(x => x.key === 'COUNT_AGAINST_SLOT')[0].value =
            this.offerForm.controls.countAgainstSlots.value;
        } else {
          this.attributeDtos.push({
            key: 'COUNT_AGAINST_SLOT',
            value: !this.offerForm.controls.countAgainstSlots.value ? 0 : this.offerForm.controls.countAgainstSlots.value
          });
        }
        this.saveOfferRequest.attributeDtos = this.attributeDtos;
      }
      if (+this.saveOfferRequest.scheduleId === 0) {
        delete this.saveOfferRequest.scheduleId;
      }
      if (!this.isStoreOperator) {
        this.offer.dispatch(
          new SaveOffer(
            this.saveOfferRequest, this.offerId, this.storeId, this.catalogId,
            null, null, null, method, this.offerImage
          )
        );
        this.isSubmitted = false;
      } else {
        this.offer.dispatch(
          new PatchSaveOffer(
            this.saveOfferRequest, this.offerId, this.storeId,
            this.catalogId, null, null, null, method
          )
        );
      }
      this.isSubmitted = false;
    } else {
      this.offerForm.get('name').markAsTouched();
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

  fileUpload(fileInput: any) {
    this.offerImage = fileInput.target.files[0] as File;
    if (this.offerImage && !!this.storeId && !!this.contentItemId) {
      this.offer.dispatch(new UploadOfferImage(this.offerImage, this.storeId, this.contentItemId));
    } else if (this.offerImage && this.isCreateOffer) {
     this.offerStdImage = URL.createObjectURL(this.offerImage);
    }
  }

  getCategoryList(type) {
    if (type === 'CHILD') {
      return this.categoryList.filter(x => x.hierarchyLevel === 'CHILD');
    } else {
      return this.categoryList.filter(x => x.hierarchyLevel === 'PARENT');
    }
  }

  loadOfferVariantPage(offerId) {
    const qParam = { parentOfferId: this.offerId, parentOfferName: this.offerName };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offerVariant`, offerId], { queryParams: qParam });
  }

  getOfferVariantIds(variants) {
    if (variants != null) {
      const variantIds = [];
      variants.forEach(item => { variantIds.push(item.offerId); });
      return variantIds;
    }
    return '';
  }

  associateOfferVariant() {
    const associateVariantRequest: AssociateOffersView = { offers: [] };
    const requestList = [];
    const selectedVariants = this.getControl('offerVariants').value;
    selectedVariants.forEach(item => {
      requestList.push({ offerId: item });
    });
    associateVariantRequest.offers = requestList;
    this.offer.dispatch(new AssociateOfferVariants(associateVariantRequest, this.offerId, this.storeId, this.catalogId));
  }

  dropVariant(event: CdkDragDrop<string[]>, offerList) {
    if (offerList.length > 1) {
      moveItemInArray(offerList, event.previousIndex, event.currentIndex);
      let i = 1;
      let offerPositionRequest: SaveOfferPositionView;
      offerPositionRequest = { offers: [] };
      const offerRequestList = [];
      offerList.forEach(item => {
        item.position = i;
        i++;
        offerRequestList.push({ offerId: item.offerId, position: item.position });
      });
      offerPositionRequest.offers = offerRequestList;
      this.offer.dispatch(new SaveOfferPosition(offerPositionRequest, this.storeId, this.catalogId));
    }
  }

  gotoAddSchedule(): void {
    const qParam = { offerId: this.offerId, offerName: this.offerName, catalogId: this.catalogId, categoryId: this.categoryId };
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam
      });
    } catch (e) {
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam,
        state: { backLink: this.router.url }
      });
    }

  }

  setPercentage() {
    this.offerForm.controls.discount.setValue('0', { onlySelf: true });
    this.discount = 0;
  }

  setMonetary() {
    this.offerForm.controls.discount.setValue('0', { onlySelf: true });
  }

  deleteOffer() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.catalog.offer.confirmDeleteOffer');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.offer.dispatch(new DeleteOffer(this.storeId, this.catalogId, this.offerId, null));
      }
    });
  }

  getImage(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${image}')`);
  }

  removeOfferImage() {
    if (!this.isCreateOffer) {
      this.offer.dispatch(new DeleteOfferImage(this.storeId, this.catalogId, this.offerId));
    }
    this.offerImageUrl$ = null;
    this.offerStdImage = null;
    this.offerImage = null;
  }

  onCharacteristicsChange($event) {
    const e = $event.target;
    const attr = this.attributeDtos.find(item => item.key === e.value);
    if (attr) {
      attr.value = e.checked;
      if (e.value === 'DISABLE_SAME_DAY_ORDERING') {
        attr.value = !e.checked;
      }
    } else {
      if (e.value === 'DISABLE_SAME_DAY_ORDERING') {
        this.attributeDtos.push({
          key: e.value,
          value: !e.checked
        });
      } else {
        this.attributeDtos.push({
          key: e.value,
          value: e.checked
        });
      }
    }
  }
  isCharacteristicsChecked(key) {
    if (this.attributeDtos.length > 0) {
      const attr = this.attributeDtos.find(item => item.key === key);
      return attr ? attr.value : false;
    }
    return false;
  }
  expandCharacteristics() {

    return this.attributeDtos && this.attributeDtos.length > 0 ? this.attributeDtos.filter(item => item.value).length > 0 : false;
  }

  selectAvailabilityHandler($event) {
    this.scheduleId = $event.target.value;
  }

  selectCategoryHandler($event) {
    this.categoryId = $event.target.value;
  }

  selectDiscountHandler($event) {
    this.discount = $event.target.value;
  }
}
