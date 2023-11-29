import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import {
  AssociateChildCategories,
  SaveCategoryPosition,
  SaveOfferPosition,
} from '../+state/stores-catalog.actions';
import {
  AssociateCategoriesView,
  SaveCategoryView,
  SaveCategoryPositionView,
  SaveOfferPositionView,
} from '../stores-catalog';
import { OfferState } from '../+state/stores-catalog.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { getOfferDetails } from '../+state/stores-catalog.selectors';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-offer-child-category',
  templateUrl: './offer-child-category.component.html',
  styleUrls: ['./offer-child-category.component.scss'],
})
export class OfferChildCategoryComponent implements OnInit, OnChanges {
  @Input() childCategories: SaveCategoryView[];
  @Input() availableChildCategories: any = [];
  offerCategoryForm: FormGroup;
  offerId: any;
  catalogId: any;
  storeId: any;
  childCategoryChanged = false;
  offerForChildCategory$: Observable<any>;
  @Input() showContent: boolean;
  @Input() offerName: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private offer: Store<OfferState>
  ) {}

  ngOnInit() {
    const params = this.route.params as { [key: string]: any };
    this.offerId = params._value.offerId;
    this.catalogId = params._value.catalogId;
    this.storeId = params._value.id;
    this.childCategoryChanged = false;
    this.offerCategoryForm = this.fb.group({ childCategoryId: [] });
  }

  ngOnChanges(): void {
    if (this.offerCategoryForm) {
      this.offerCategoryForm.patchValue({
        childCategoryId: this.getCategoryIds(),
      });
    }
  }

  getControl(name: string) {
    return this.offerCategoryForm.get(name);
  }

  getCategoryIds() {
    const catId = [];
    if (this.childCategories != null && this.childCategories !== undefined) {
      this.childCategories.forEach((item) => {
        catId.push(item.categoryId);
      });
      return catId;
    }
    return catId;
  }

  associateCategory() {
    this.childCategoryChanged = true;
    const chosenChildCatList = this.getControl('childCategoryId').value;
    this.associateChildCategories();
    if (chosenChildCatList.length === 0) {
      this.childCategories = [];
    } else {
      this.offerForChildCategory$ = this.offer.pipe(
        select(getOfferDetails),
        filter((offer) => offer != null),
        tap((offer) => (this.childCategories = offer.categories))
      );
    }
  }

  associateChildCategories() {
    const associateChildRequest: AssociateCategoriesView = { categories: [] };
    const requestList = [];
    const selectedCategories = this.getControl('childCategoryId').value;
    selectedCategories.forEach((item) => {
      requestList.push({ categoryId: item });
    });
    associateChildRequest.categories = requestList;
    this.offer.dispatch(
      new AssociateChildCategories(
        associateChildRequest,
        this.offerId,
        this.storeId,
        this.catalogId
      )
    );
  }

  loadChildCategoryPage(categoryId) {
    const qParam = {
      parentOfferId: this.offerId,
      parentOfferName: this.offerName,
    };
    this.router.navigate(
      [
        `/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory`,
        categoryId,
      ],
      { queryParams: qParam }
    );
  }

  loadChildOfferPage(offerId, childCategoryId) {
    const qParam = {
      parentOfferId: this.offerId,
      categoryId: childCategoryId,
      sourcePage: 'OFFER',
      parentOfferName: this.offerName,
    };
    this.router.navigate(
      [
        `/manager/stores/${this.storeId}/catalog/${this.catalogId}/childOffer`,
        offerId,
      ],
      { queryParams: qParam }
    );
  }

  savePosition(direction, index) {
    if (direction === 'DOWN') {
      moveItemInArray(this.childCategories, index, index + 1);
    } else {
      moveItemInArray(this.childCategories, index - 1, index);
    }
    let i = 1;
    let categoryPositionRequest: SaveCategoryPositionView;
    categoryPositionRequest = { categories: [] };
    const requestList = [];
    this.childCategories.forEach((category) => {
      category.position = i;
      i++;
      requestList.push({
        categoryId: category.categoryId,
        position: category.position,
      });
    });
    categoryPositionRequest.categories = requestList;
    this.offer.dispatch(
      new SaveCategoryPosition(
        categoryPositionRequest,
        this.storeId,
        this.catalogId
      )
    );
  }
  savePositionOptions(direction, index, listIndex) {
    if (direction === 'DOWN') {
      moveItemInArray(this.childCategories[listIndex].offers, index, index + 1);
    } else {
      moveItemInArray(this.childCategories[listIndex].offers, index - 1, index);
    }
    let i = 1;
    let categoryPositionRequest: SaveOfferPositionView;
    categoryPositionRequest = { offers: [] };
    const offerlist = [];
    this.childCategories[listIndex].offers.forEach((category) => {
      category.position = i;
      i++;
      offerlist.push({
        offerId: category.offerId,
        categoryId: category.categoryId,
        position: category.position,
      });
    });
    categoryPositionRequest.offers = offerlist;
    this.offer.dispatch(
      new SaveOfferPosition(
        categoryPositionRequest,
        this.storeId,
        this.catalogId
      )
    );
  }
}
