import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { helpPage } from 'src/app/shared/help-page.const';
import { PatchSaveOffer, SaveCategoryPosition, SaveOfferPosition } from './+state/stores-catalog.actions';
import { CatalogState, OfferState } from './+state/stores-catalog.reducer';
import { getCatalogOverview } from './+state/stores-catalog.selectors';
import { Offer, PatchSaveOfferView, SaveCategoryPositionView, SaveOfferPositionView } from './stores-catalog';

export interface DialogData {
  offerItem: Offer;
  status: string;
}
@Component({
  selector: 'app-store-catalog',
  templateUrl: './store-catalog.component.html',
  styleUrls: ['./store-catalog.component.scss']
})
export class StoreCatalogComponent implements OnInit, OnDestroy, AfterViewInit {
  storeId: any;
  catalog$: Observable<any>;
  store$: Observable<any>;
  catalogId: any;
  selectedId: number;
  users$: Observable<any>;
  catalogDetails: any;
  catalogHelpPage = helpPage.catalog;
  users: any;
  isAdminOrPartnerUser = false;
  isAdminOrSuperAdmin = false;
  private destroy$ = new Subject();
  isStoreOperator = true;
  saveOfferRequest: PatchSaveOfferView;

  constructor(private catalog: Store<CatalogState>,
              private router: Router,
              private activeRoute: ActivatedRoute,
              private offer: Store<OfferState>,
              public dialog: MatDialog,
              private store: Store<any>) { }

  ngOnInit() {
    this.catalog$ = this.catalog.pipe(select(getCatalogOverview), tap(data => this.catalogId = (data != null ? data.catalogId : null)));
    const params = this.activeRoute.params as { [key: string]: any };
    this.storeId = params._value.id;
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && s.superAdmin || (this.storeId && s.storeRoles[+this.storeId] === 'STORE_ADMIN')) {
        this.isAdminOrSuperAdmin = true;
      }
      if (s && s.storeRoles && this.storeId && (s.superAdmin || s.affiliate)) {
        this.isAdminOrPartnerUser = true;
      }
      if (s && s.storeRoles && this.storeId && s.storeRoles[+this.storeId] && s.storeRoles[+this.storeId] === 'STORE_STANDARD') {
        this.isStoreOperator = true;
      } else {
        this.isStoreOperator = false;
      }
    });
    this.selectedId = parseInt(this.activeRoute.snapshot.queryParams.selectedId, 10);
  }

  loadOfferPage(offerId) {
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`, offerId]);
  }

  loadCategoryPage(categoryId) {
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/category`, categoryId]);
  }

  loadImportCatalogPage(categoryId) {
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/category`, categoryId]);
  }

  loadImportCatalogByLinkPage() {
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/createFromLink`]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dropCategory(event: CdkDragDrop<string[]>, categoryList) {
    if (categoryList.length > 1) {
      moveItemInArray(categoryList, event.previousIndex, event.currentIndex);
      let i = 1;
      let categoryPositionRequest: SaveCategoryPositionView;
      categoryPositionRequest = { categories: [] };
      const requestList = [];
      categoryList.forEach(category => {
        category.position = i;
        i++;
        requestList.push({ categoryId: category.categoryId, position: category.position });
      });
      categoryPositionRequest.categories = requestList;
      this.catalog.dispatch(new SaveCategoryPosition(categoryPositionRequest, this.storeId, this.catalogId));
    }
  }
  drop(event: CdkDragDrop<string[]>, offerList) {
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
      // console.log(JSON.stringify(offerPositionRequest));
      this.catalog.dispatch(new SaveOfferPosition(offerPositionRequest, this.storeId, this.catalogId));
    }
  }

  getSortedList(list) {
    return list.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
  }
  getDiscountedPrice(offer: Offer) {
    let discountedPrice = offer.price;
    if (offer.discountType === 'MONETARY') {
      discountedPrice = offer.price - offer.discount;
    } else if (offer.discountType === 'PERCENTILE') {
      discountedPrice = offer.price - (offer.price * (offer.discount / 100));
    }
    return discountedPrice;
  }

  ngAfterViewInit() {
    if (this.selectedId) {
      const el = document.getElementById(this.selectedId.toString());
      if (el) {
        el.parentElement.parentElement.parentElement.scrollIntoView();
      }
    }
  }

  loadVerifyCatalogPage(importMode) {
    const qParam = { importMode };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/upload`], { queryParams: qParam });
  }

  addOfferToCategory(categoryId) {
    const qParam = { categoryId };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`, 'CREATE_OFFER'], { queryParams: qParam });
  }

  openSettingDialog(offer) {
    const options = {
      width: '450px',
      data: { offerItem: offer, status: '' },
      panelClass: 'invite-user-dialog',
    };

    if (offer.isSellable === false) {
      options.data.status = 'OFFER_HIDDEN';
    } else if (!offer.isOrderable) {
      options.data.status = 'OFFER_UNORDERABLE';
    } else if (offer.isStockCheckEnabled && offer.stockLevel === 0) {
      options.data.status = 'OFFER_OOS';
    } else {
      options.data.status = 'OFFER_AVAILABLE';
    }
    const dialogRef = this.dialog.open(StoreCatelogDialogComponent, options);
    const previousStatus = options.data.status;

    dialogRef.afterClosed().subscribe(result => {
      if (!!result && previousStatus !== options.data.status) {
        this.updateOfferStatus(offer, options.data.status);
      }
    });
  }

  updateOfferStatus(offer, status) {
    const method = 'PARENT';
    if (status === 'OFFER_AVAILABLE') {
      offer.isStockCheckEnabled = false;
      offer.sellable = true;
      offer.isSellable = true;
      offer.isOrderable = true;
    } else if (status === 'OFFER_OOS') {
      offer.isStockCheckEnabled = true;
      offer.stockLevel = 0;
      offer.sellable = true;
      offer.isSellable = true;
      offer.isOrderable = true;
    } else if (status === 'OFFER_HIDDEN') {
      offer.sellable = false;
      offer.isSellable = false;
    } else { // OFFER_UNORDERABLE
      offer.sellable = true;
      offer.isSellable = true;
      offer.isOrderable = false;
    }

    this.saveOfferRequest = offer;
    this.offer.dispatch(
      new PatchSaveOffer(
        this.saveOfferRequest, offer.offerId, this.storeId,
        this.catalogId, null, null, null, method
      )
    );
  }
}

@Component({
  selector: 'app-store-catalog-dialog',
  templateUrl: 'store-catalog-dialog.html'
})
export class StoreCatelogDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StoreCatelogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  save(): void {
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
