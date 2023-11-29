import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap, take } from 'rxjs/operators';
import { getCatalogOverview, getCategoryDetails } from '../store-catalog/+state/stores-catalog.selectors';
import { DeleteDialogComponent } from '../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { AssociateCategoriesView, Category, DeleteDialogData } from '../store-catalog/stores-catalog';
import { DeleteOrderingRule, SaveOrderingRule } from './+state/store-ordering-rules.actions';
import { OrderingRuleState } from './+state/store-ordering-rules.reducer';
import { getSelectedOrderingRule } from './+state/store-ordering-rules.selectors';
import { OrderingRuleAction, OrderingRuleCategory, OrderingRuleOfferObj, SaveOrderingRuleView } from './store-ordering-rules.helpers';
import { StoreOrderingRulesService } from './store-ordering-rules.service';
import { CategoryState } from '../store-catalog/+state/stores-catalog.reducer';
import { LoadCategory } from '../store-catalog/+state/stores-catalog.actions';

@Component({
  selector: 'app-store-ordering-rules',
  templateUrl: './store-ordering-rules.component.html',
  styleUrls: ['./store-ordering-rules.component.scss']
})
export class StoreOrderingRulesComponent implements OnInit, OnDestroy {
  @Input() offerName: any;
  selectedGroup: string;
  selectedCategoryID: 0;
  groupName: string;
  groupCategoryId: number;
  storeId = 0;
  ruleId = 0;
  catalogId = 0;
  offerId: any;
  hasOffers = false;
  destroyed$ = new Subject<void>();
  orderingRulesForm: FormGroup;
  hasCategory: boolean;
  minGroupType: number;
  maxGroupType: number;
  selectedCategory: OrderingRuleCategory;
  ruleCategories: OrderingRuleCategory[];
  orderingRuleView: SaveOrderingRuleView;
  constructor(
    private route: ActivatedRoute,
    private orderingRule: Store<OrderingRuleState>,
    private activatedRoute: ActivatedRoute,
    private store: Store<CategoryState>,
    private fb: FormBuilder,
    private orderingRuleService: StoreOrderingRulesService,
    private router: Router,
    private translate: TranslateService,
    public dialog: MatDialog) { }
  ngOnInit() {
    const routeParams = this.route.params as { [key: string]: any };
    this.offerId = routeParams._value.offerId;
    document.getElementById('settingsTabs').style.display = 'none';
    document.getElementById('settingsHeader').style.display = 'none';
    this.orderingRulesForm = this.fb.group({
      isActive: ['true'],
      conditionMinOrderAmount: ['0', Validators.required],
      conditionMaxOrderAmount: ['0', Validators.required],
      actionAddFreeCategoryId: []
    });

    this.storeId = this.activatedRoute.snapshot.parent.parent.params.id;
    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      // tslint:disable-next-line
      this.ruleId = params['ruleid'];
      this.groupName = this.route.snapshot.queryParams.name;
      this.groupCategoryId = this.route.snapshot.queryParams.categoryId;
      const groupOfCategory = { categoryId: this.groupCategoryId, name: this.groupName };
      if (+this.ruleId !== 0) {
        this.orderingRule.pipe(takeUntil(this.destroyed$), select(getCatalogOverview), filter(catalog => !!catalog)).
          subscribe(catalog => {
            this.catalogId = catalog.catalogId;
            this.orderingRuleService.loadRuleCategories(this.storeId, catalog.catalogId).subscribe(data => {
              this.ruleCategories = data;
              this.orderingRule.pipe(select(getSelectedOrderingRule), filter(rule => !!rule), tap(s => {
                this.hasCategory = s.actions && s.actions.length > 0 && s.actions[0].data.categoryId > 0;
                if (s && s.actions && s.actions.length > 0 && s.actions[0].data
                    && s.actions[0].data.categoryId && groupOfCategory.categoryId === undefined) {
                  this.selectedCategory = this.ruleCategories.find(x => +x.categoryId === s.actions[0].data.categoryId);
                  this.OnGroupOptionChange(this.selectedCategory);
                }
                else {
                  this.OnGroupOptionChange(groupOfCategory);
                }
              }), tap(s => { this.orderingRuleView = s; }), takeUntil(this.destroyed$)).subscribe(rule =>
                this.orderingRulesForm.patchValue({
                  isActive: rule.isActive,
                  conditionMinOrderAmount: rule.conditions && rule.conditions.length > 0 ? rule.conditions[0].data.min : 0,
                  conditionMaxOrderAmount: rule.conditions && rule.conditions.length > 0 ? rule.conditions[0].data.max : 0,
                  actionAddFreeCategoryId:
                    groupOfCategory.categoryId === undefined
                                                    ? this.selectedCategory
                                                    : this.selectedCategory
                                                      = this.ruleCategories.find(x => x.categoryId === +groupOfCategory.categoryId)
                })
              );
            });
          });
      }
    });
  }
  ngOnDestroy(): void {
    document.getElementById('settingsTabs').removeAttribute('style');
    document.getElementById('settingsHeader').removeAttribute('style');

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getControl(name: string) {
    return this.orderingRulesForm.get(name);
  }

  loadRulesOptionsGroup(catalogId, groupId) {
    if (+catalogId > 0) {
      const queryParams = { catalogId };
      this.router.navigate(
        ['/manager/stores/', this.storeId, 'settings', 'ordering-rules', this.ruleId, 'option-group', groupId],
        { queryParams }
      );
    }
  }
  loadRulesOption(id) {
    if (id != null) {
      this.router.navigate(
        [
          '/manager/stores/', this.storeId, 'settings', 'ordering-rules',
          this.ruleId, 'option-group', this.selectedCategoryID, 'option', id
        ],
        { queryParams: { catalogId: this.catalogId } }
      );
    }
  }

  onCancel() {
    this.router.navigate(['/manager/stores/' + this.storeId + '/settings/ordering-rules']);
  }
  loadChildOfferPage(offerId, childCategoryId) {
    const qParam = { parentOfferId: this.offerId, categoryId: childCategoryId, sourcePage: 'RULE', parentOfferName: this.offerName };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childOffer`, offerId], { queryParams: qParam });
  }

  onSaveRule() {
    const request = this.orderingRulesForm.getRawValue();
    if (this.selectedCategoryID > 0) {
      // tslint:disable-next-line
      request['actionAddFreeCategoryId'] = this.selectedCategoryID;
    }
    this.orderingRule.dispatch(new SaveOrderingRule(this.storeId, this.ruleId, request));
  }
  OnDelete() {
    const input: DeleteDialogData = { mode: null, message: null };
    if (this.hasCategory) {
      input.mode = 'NODELETE';
      input.message = this.translate.instant('admin.store.setting.rules.infoDeleteORule');
    } else {
      input.mode = 'DELETE';
      input.message = this.translate.instant('admin.store.setting.rules.confirmDeleteRule');
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action !== undefined) {
        if (action === 'DELETE') {
          this.orderingRule.dispatch(new DeleteOrderingRule(this.storeId, this.ruleId));
        }
      }
    });
  }

  OnGroupOptionChange(category) {
    if (category != null) {
      this.selectedGroup = category.name;
      this.selectedCategoryID = category.categoryId;
      this.store.dispatch(new LoadCategory(category.categoryId, this.storeId.toString(), this.catalogId.toString()));
      if (this.selectedGroup) {
        this.store.pipe(select(getCategoryDetails),
          take(1)
        ).subscribe((data: any) => {
          if (data && this.ruleCategories) {
            this.minGroupType = data.min;
            this.maxGroupType = data.max;
            this.hasOffers = data.offers;
            const offersKey = 'offers';
            const index = this.ruleCategories.findIndex(x => +x.categoryId === +data.categoryId);
            if (this.ruleCategories && this.ruleCategories[index]) {
              this.ruleCategories[index][offersKey] = data;
            }
          }
        });
      }
    }
  }
  setGroupAsNull() {
    this.selectedGroup = this.selectedCategoryID = this.hasOffers = null;
  }

}
