import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCatalogComponent } from './store-catalog.component';
import { StoreCatalogGuard } from './store-catalog.guard';
import { StoreOfferComponent } from './store-offer/store-offer.component';
import { StoreOfferGuard } from './store-offer.guard';
import { StoreCategoryComponent } from './store-category/store-category.component';
import { StoreCategoryGuard } from './store-category.guard';
import { ChildCategoryComponent } from './child-category/child-category.component';
import { ChildOfferComponent } from './child-offer/child-offer.component';
import { OfferVariantComponent } from './offer-variant/offer-variant.component';
import { CatalogUploadComponent } from './catalog-upload/catalog-upload.component';
import { CatalogLinkComponent } from './catalog-link/catalog-link.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreCatalogComponent, canActivate: [StoreCatalogGuard] },
  { path: ':catalogId/offer/:offerId', component: StoreOfferComponent, canActivate: [StoreOfferGuard] },
  { path: ':catalogId/createFromLink', component: CatalogLinkComponent },
  { path: ':catalogId/category/:categoryId', component: StoreCategoryComponent, canActivate: [StoreCategoryGuard] },
  { path: ':catalogId/childCategory/:categoryId', component: ChildCategoryComponent, canActivate: [StoreCategoryGuard] },
  { path: ':catalogId/childOffer/:offerId', component: ChildOfferComponent, canActivate: [StoreOfferGuard] },
  { path: ':catalogId/offerVariant/:offerId', component: OfferVariantComponent, canActivate: [StoreOfferGuard] },
  { path: ':catalogId/upload', component: CatalogUploadComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreCatalogRoutingModule { }
