import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContentItemModel, SaveCategoryView, ContentItemView, AssociateOffersView, DeleteDialogData } from '../stores-catalog';
import { SaveCategory, SaveContentItem, AssociateChildOffers, DeleteCategory } from '../+state/stores-catalog.actions';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryState } from '../+state/stores-catalog.reducer';
import { getCategoryDetails, getCategoryStatus } from '../+state/stores-catalog.selectors';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { helpPage } from 'src/app/shared/help-page.const';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-child-category',
  templateUrl: './child-category.component.html',
  styleUrls: ['./child-category.component.scss']
})
export class ChildCategoryComponent implements OnInit, OnDestroy {
  childCategoryForm: FormGroup;
  content: any = [];
  saveCategoryRequest: SaveCategoryView;
  catalogId: any;
  categoryId: any;
  storeId: any;
  isCreateCategory = false;
  category$: Observable<any>;
  contentItemId: number;
  saveContentItemRequest: ContentItemView;
  contentItem: ContentItemModel;
  parentOfferId: number;
  hasOffers = false;
  parentOfferName: any;
  selected: number;
  childCategoryHelpPage = helpPage.catalogOptionGroup;
  isMaxLowerThanMin = false;
  qty1: number[] = [0, 0, 0];
  qty2: number[] = [0, 0, 0];
  categoryStatus: string;
  destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private category: Store<CategoryState>,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const _value = (this.route.params as any)._value;
    this.categoryId = _value.categoryId;
    this.catalogId = _value.catalogId;
    this.storeId = _value.id;
    this.parentOfferId = this.route.snapshot.queryParams.parentOfferId;
    this.parentOfferName = this.route.snapshot.queryParams.parentOfferName;
    this.childCategoryForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      groupType: ['', Validators.compose([Validators.required])],
      minimumRequired: [0, Validators.compose([Validators.required])],
      maximumAllowed: [1, Validators.compose([Validators.required])],
      orderMultipleSameItem1: [false, Validators.compose([Validators.required])],
      orderMultipleSameItem2: [false, Validators.compose([Validators.required])],
    }, { validator: CustomValidators.checkForOnlySpaces('name')});
    this.childCategoryForm.controls.groupType.valueChanges.subscribe((_) => this.checkMaxLowerThanMin());

    if (this.categoryId !== 'CREATE_CATEGORY') {
      this.isCreateCategory = false;
      this.category$ = this.category.pipe(
        select(getCategoryDetails),
        filter(category => category != null),
        tap(category => {
          const groupType = 'MIN_' + ((category.min === 0 || category.min === 1) && category.max <= 1 && category.max > -2 ? category.min : 'N') + '_MAX_' + ((category.max <= -1 || category.max > 1) ? 'N' : category.max);
          this.childCategoryForm.patchValue({
            name: category.name,
            groupType,
            minimumRequired: category.min,
            maximumAllowed: category.max === -1 ? -2 : category.max,
            orderMultipleSameItem1: category.orderMultipleSameItem && groupType === 'MIN_0_MAX_N',
            orderMultipleSameItem2: category.orderMultipleSameItem && groupType === 'MIN_N_MAX_N',
          });
        }),
        tap(category => this.content = category.languageTranslation),
        tap(category => this.contentItemId = category.contentItemId),
        tap(category => this.hasOffers = (category.offers && category.offers.length > 0) ? true : false)
      );
    } else {
      this.isCreateCategory = true;
    }

    this.saveContentItemRequest = { languageTranslation: [] };
    this.saveCategoryRequest = this.childCategoryForm.value;

    this.category
      .pipe(
        select(getCategoryStatus),
        takeUntil(this.destroyed$),
      )
      .subscribe(s => {
        this.categoryStatus = s;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  getChildOfferIds(offers) {
    if (offers != null && offers !== undefined) {
      const offerId = [];
      offers.forEach(item => { offerId.push(item.offerId); });
      return offerId;
    }
  }

  getControl(name: string) {
    return this.childCategoryForm.get(name);
  }

  checkMaxLowerThanMin() {
    const groupType = this.getControl('groupType').value;
    const minimumRequired = this.getControl('minimumRequired').value;
    const maximumAllowed = this.getControl('maximumAllowed').value;
    this.isMaxLowerThanMin = groupType === 'MIN_N_MAX_N' && (+maximumAllowed) > -1 && (+maximumAllowed) < (+minimumRequired);
  }

  onCategorySave() {
    this.childCategoryForm.markAllAsTouched();
    if (this.childCategoryForm.valid) {
    this.saveCategoryRequest = this.childCategoryForm.value;
    this.saveCategoryRequest.hierarchyLevel = 'CHILD';
    this.saveCategoryRequest.parentOfferId = this.parentOfferId;
    this.saveCategoryRequest.orderMultipleSameItem = false;
    switch (this.getControl('groupType').value) {
      case 'MIN_1_MAX_1':
        this.saveCategoryRequest.min = 1;
        this.saveCategoryRequest.max = 1;
        break;
      case 'MIN_0_MAX_1':
        this.saveCategoryRequest.min = 0;
        this.saveCategoryRequest.max = 1;
        break;
      case 'MIN_0_MAX_N':
        this.saveCategoryRequest.min = 0;
        this.saveCategoryRequest.max = -1;
        this.saveCategoryRequest.orderMultipleSameItem = this.getControl('orderMultipleSameItem1').value;
        break;
      case 'MIN_N_MAX_N':
        this.saveCategoryRequest.min = this.getControl('minimumRequired').value;
        this.saveCategoryRequest.max = this.getControl('maximumAllowed').value;
        this.saveCategoryRequest.orderMultipleSameItem = this.getControl('orderMultipleSameItem2').value;
        break;
    }
    delete this.saveCategoryRequest.groupType;
    delete this.saveCategoryRequest.orderMultipleSameItem1;
    delete this.saveCategoryRequest.orderMultipleSameItem2;
    this.category.dispatch(new SaveCategory(this.saveCategoryRequest, this.categoryId, this.storeId, this.catalogId, this.parentOfferId));
  }else {
    this.childCategoryForm.get('name').markAsTouched();
  }
}

  saveContentItem() {
    if (!this.isCreateCategory) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.content;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.category.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  loadChildOfferPage(offerId) {
    const qParam = { categoryId: this.categoryId, parentOfferId: this.parentOfferId, parentOfferName: this.parentOfferName  };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childOffer`, offerId], { queryParams: qParam });
  }

  associateChildOffers() {
    const associateChildRequest: AssociateOffersView = { offers: [] };
    const requestList = [];
    const selectedOffers = this.getControl('childOffers').value;
    selectedOffers.forEach(item => {
      requestList.push({ offerId: item });
    });
    associateChildRequest.offers = requestList;
    this.category.dispatch(new AssociateChildOffers(associateChildRequest, this.categoryId, this.storeId, this.catalogId));
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    if (this.parentOfferId != null) {
      const qParam = { fromOptionGrp: true};
      this.router.navigate(
        [
          `/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`,
          this.parentOfferId
        ],
        { queryParams: qParam }
      );
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog`]);
    }
  }

  deleteCategory() {
    const input: DeleteDialogData = {mode: null, message: null};

    if (this.hasOffers) {
      input.mode = 'NODELETE';
      input.message = this.translate.instant('admin.store.catalog.optionGroup.infoDeleteOptionGroup');
    } else {
      input.mode = 'DELETE';
      input.message = this.translate.instant('admin.store.catalog.optionGroup.confirmDeleteOptionGroup');
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action !== undefined) {
        if (action === 'DELETE') {
          this.category.dispatch(new DeleteCategory(this.storeId, this.catalogId, this.categoryId, this.parentOfferId));
        }
      }
    });
  }
}
