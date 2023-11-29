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
import { getSelectedStore } from '../../+state/stores.selectors';
import { DeleteCategory, SaveCategory, SaveContentItem } from '../../store-catalog/+state/stores-catalog.actions';
import { CategoryState } from '../../store-catalog/+state/stores-catalog.reducer';
import { getCatalogOverview, getCategoryDetails } from '../../store-catalog/+state/stores-catalog.selectors';
import { DeleteDialogComponent } from '../../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { Category, ContentItemModel, DeleteDialogData, SaveCategoryView } from '../../store-catalog/stores-catalog';

@Component({
  selector: 'app-rule-option-group',
  templateUrl: './rule-option-group.component.html',
  styleUrls: ['./rule-option-group.component.scss']
})
export class RuleOptionGroupComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  storeId = 0;
  ruleOptionGroupId = 0;
  ruleId = 0;
  childCategoryHelpPage: any;
  ruleOptionGroupForm: FormGroup;
  selected: number;
  content = [];
  saveCategoryRequest: SaveCategoryView;
  catalogId: number;
  ruleGroup$: Observable<any>;
  contentItemId: number;
  hasOffers = false;
  saveContentItemRequest: any;
  contentItem: ContentItemModel;
  constructor(
    private store: Store<CategoryState>,
    private actrouter: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    public dialog: MatDialog
  ) { }


  ngOnInit() {

    document.getElementById('settingsTabs').style.display = 'none';
    document.getElementById('settingsHeader').style.display = 'none';
    this.childCategoryHelpPage = helpPage.catalog;
    this.storeId = this.actrouter.snapshot.parent.parent.params.id;
    this.ruleOptionGroupId = this.actrouter.snapshot.params.rogid;
    this.catalogId = this.actrouter.snapshot.queryParams.catalogId;
    this.ruleId = this.actrouter.snapshot.params.ruleid;
    this.ruleOptionGroupForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      groupType: ['', Validators.compose([Validators.required])]
    }, { validator: CustomValidators.checkForOnlySpaces('name') });

    if (+this.ruleOptionGroupId !== 0) {
      this.ruleGroup$ = this.store.pipe(select(getCategoryDetails), filter(category => category != null),
        tap(category => this.ruleOptionGroupForm.patchValue({
          name: category.name,
          groupType: 'MIN_' + category.min + '_MAX_' + ((+category.max <= -1 || +category.max > 1) ? 'N' : category.max)
        })),
        tap(category => this.content = category.languageTranslation),
        tap(category => this.contentItemId = category.contentItemId),
        tap(category => this.hasOffers = category.offers && category.offers.length > 0)
      );
    }
    this.saveContentItemRequest = { languageTranslation: [] };
  }

  ngOnDestroy(): void {
    document.getElementById('settingsTabs').removeAttribute('style');
    document.getElementById('settingsHeader').removeAttribute('style');
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getControl(name: string) {
    return this.ruleOptionGroupForm.get(name);
  }
  goBack() {
    this.router.navigate(['/manager/stores/', this.storeId, 'settings', 'ordering-rules', this.ruleId]);
  }
  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }
  saveContentItem() {
    if (+this.ruleOptionGroupId !== 0) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.content;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.store.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }
  onSaveRuleGroup() {
    const categoryId = +this.ruleOptionGroupId === 0 ? 'CREATE_CATEGORY' : this.ruleOptionGroupId;
    this.saveCategoryRequest = this.ruleOptionGroupForm.getRawValue();
    this.saveCategoryRequest.hierarchyLevel = 'RULE';
    if (this.getControl('groupType').value === 'MIN_1_MAX_1') {
      this.saveCategoryRequest.min = 1;
      this.saveCategoryRequest.max = 1;
    } else if (this.getControl('groupType').value === 'MIN_0_MAX_N') {
      this.saveCategoryRequest.min = 0;
      this.saveCategoryRequest.max = -1;
    } else if (this.getControl('groupType').value === 'MIN_0_MAX_1') {
      this.saveCategoryRequest.min = 0;
      this.saveCategoryRequest.max = 1;
    }
    delete this.saveCategoryRequest.groupType;
    this.store.dispatch(new SaveCategory(this.saveCategoryRequest, categoryId, this.storeId, this.catalogId, this.ruleId));
  }
  deleteCategory() {
    const input: DeleteDialogData = { mode: null, message: null };
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
          this.store.dispatch(new DeleteCategory(this.storeId, this.catalogId, this.ruleOptionGroupId, 0, this.ruleId));
        }
      }
    });
  }
  loadRulesOption(id) {
    if (id != null) {
      this.router.navigate(
        ['/manager/stores/', this.storeId, 'settings', 'ordering-rules', this.ruleId, 'option-group', this.ruleOptionGroupId, 'option', id],
        { queryParams: { catalogId: this.catalogId } }
      );
    }
  }
}
