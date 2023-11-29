import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { ContentItemModel, SaveCategoryView, ContentItemView, DeleteDialogData } from '../stores-catalog';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveCategory, SaveContentItem, DeleteCategory, StoresCatalogAction, StoresCatalogActionType, SaveCategoryFailed } from '../+state/stores-catalog.actions';
import { CategoryState } from '../+state/stores-catalog.reducer';
import { getCategoryDetails, getCategoryStatus } from '../+state/stores-catalog.selectors';
import { takeUntil, tap, filter, map, catchError } from 'rxjs/operators';
import { StoresCatalogService } from '../stores-catalog.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { helpPage } from 'src/app/shared/help-page.const';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { TranslateService } from '@ngx-translate/core';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-store-category',
  templateUrl: './store-category.component.html',
  styleUrls: ['./store-category.component.scss']
})
export class StoreCategoryComponent implements OnInit , OnDestroy{
  categoryForm: FormGroup;
  contentItem: ContentItemModel;
  saveCategoryRequest: SaveCategoryView;
  categoryId: any;
  category$: Observable<any>;
  categoryDetails: any;
  categoryContentItem: any = [];
  catalogId: any;
  isCreateCategory = false;
  scheduleList: any = [];
  private destroy$ = new Subject();
  contentItemId: number;
  storeId: any;
  saveContentItemRequest: ContentItemView;
  hasOffers = false;
  storeCategoryHelpPage = helpPage.catalogCategory;
  categoryName: string;
  categoryStatus: string;
  scheduleId: number;
  isSubmitted = false;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private category: Store<CategoryState>,
    private service: StoresCatalogService,
    public dialog: MatDialog,
    private schedule: StoresScheduleService,
    private translate: TranslateService,
    private actions$: Actions
  ) { }

  ngOnInit() {
    const params = this.route.params as { [key: string]: any };
    this.categoryId = params._value.categoryId;
    this.catalogId = params._value.catalogId;
    this.storeId = params._value.id;
    this.schedule.getAllSchedules(this.storeId).pipe(takeUntil(this.destroy$))
      .subscribe(results => this.scheduleList = results);

    this.categoryForm = this.fb.group({
      scheduleId: [0],
      sellable: ['true', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])]
    }, { validator: CustomValidators.checkForOnlySpaces('name') });

    if (this.categoryId !== 'CREATE_CATEGORY') {
      this.isCreateCategory = false;
      this.category$ = this.category.pipe(
        select(getCategoryDetails),
        filter(category => category != null),
        tap(category =>
          this.categoryForm.patchValue({
            scheduleId: category.scheduleId ? category.scheduleId : 0,
            sellable: category.isSellable,
            name: category.name,
            shortDescription: category.shortDescription
          })
        ),
        tap(category => this.categoryContentItem = category.languageTranslation),
        tap(category => this.categoryName = category.name),
        tap(category => this.contentItemId = category.contentItemId),
        tap(category => this.hasOffers = (category.offers && category.offers.length > 0) ? true : false),
        tap(category => this.scheduleId = category.scheduleId ? category.scheduleId : 0)
      );
    } else {
      this.isCreateCategory = true;
      this.scheduleId = 0;
    }
    this.saveCategoryRequest = this.categoryForm.value;
    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };
    this.category
      .pipe(
        select(getCategoryStatus),
        takeUntil(this.destroy$),
      )
      .subscribe((s) => {
        this.categoryStatus = s;
      });
    this.subscription = this.actions$.pipe(
      ofType<StoresCatalogAction>(
        StoresCatalogActionType.SaveCategoryFailed
      ),
      map(_ => { this.isSubmitted = false; }),
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getControl(name: string) {
    return this.categoryForm.get(name);
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  onCategorySave() {
    if (this.isSubmitted) {
      return;
    }

    this.isSubmitted = true;
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.valid) {
      this.saveCategoryRequest = this.categoryForm.value;
      this.saveCategoryRequest.hierarchyLevel = 'PARENT';
      if (+this.categoryForm.value.scheduleId === 0) {
        delete this.saveCategoryRequest.scheduleId;
      }
      this.category.dispatch(new SaveCategory(this.saveCategoryRequest, this.categoryId, this.storeId, this.catalogId, null));
    } else {
      this.categoryForm.get('name').markAsTouched();
    }
  }

  saveContentItem() {
    if (!this.isCreateCategory) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.categoryContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      // console.log(JSON.stringify(this.saveContentItemRequest));

      this.category.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  gotoAddSchedule(): void {
    const qParam = { categoryId: this.categoryId, categoryName: this.categoryName, catalogId: this.catalogId };
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

  deleteCategory() {
    const input: DeleteDialogData = { mode: null, message: null };

    if (this.hasOffers) {
      input.mode = 'NODELETE';
      input.message = this.translate.instant('admin.store.catalog.category.infoDeleteCategory');
    } else {
      input.mode = 'DELETE';
      input.message = this.translate.instant('admin.store.catalog.category.confirmDeleteCategory');
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action !== undefined) {
        if (action === 'DELETE') {
          this.category.dispatch(new DeleteCategory(this.storeId, this.catalogId, this.categoryId, null));
        }
      }
    });
  }
  selectScheduleIdHandler($event) {
    this.scheduleId = $event.target.value;
  }
}

