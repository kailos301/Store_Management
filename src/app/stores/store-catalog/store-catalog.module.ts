import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import {
  storesCatalogReducer, catalogInitialState,
  storeOfferReducer, OfferInitialState, storeCategoryReducer, CategoryInitialState
} from './+state/stores-catalog.reducer';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreCatalogRoutingModule } from './store-catalog-routing.module';
import { StoreCatalogComponent, StoreCatelogDialogComponent } from './store-catalog.component';
import { StoreOfferComponent } from './store-offer/store-offer.component';
import { StoreContentitemComponent } from './store-contentitem/store-contentitem.component';
import { StoreCategoryComponent } from './store-category/store-category.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoresEffects } from './+state/stores-catalog.effects';
import { EffectsModule } from '@ngrx/effects';
import { ChildCategoryComponent } from './child-category/child-category.component';
import { ChildOfferComponent } from './child-offer/child-offer.component';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { OfferVariantComponent } from './offer-variant/offer-variant.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import { AvailabilityRestrictionComponent } from './overlay/availability-restriction/availability-restriction.component';
import { TranslationComponent } from './overlay/translation/translation.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { ContentTranslationComponent } from './content-translation/content-translation.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CatalogUploadComponent } from './catalog-upload/catalog-upload.component';
import { OfferChildCategoryComponent } from './offer-child-category/offer-child-category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CatalogLanguageComponent } from './catalog-language/catalog-language.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CatalogLinkComponent } from './catalog-link/catalog-link.component';

@NgModule({
  declarations: [
    StoreCatalogComponent,
    StoreOfferComponent,
    StoreCatelogDialogComponent,
    StoreContentitemComponent,
    StoreCategoryComponent,
    ChildCategoryComponent,
    ChildOfferComponent,
    OfferVariantComponent,
    AvailabilityRestrictionComponent,
    TranslationComponent,
    ContentTranslationComponent,
    CatalogUploadComponent,
    OfferChildCategoryComponent,
    CatalogLanguageComponent,
    CatalogLinkComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreCatalogRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    StoreModule.forFeature('catalog', storesCatalogReducer, { initialState: catalogInitialState }),
    StoreModule.forFeature('offer', storeOfferReducer, { initialState: OfferInitialState }),
    StoreModule.forFeature('category', storeCategoryReducer, { initialState: CategoryInitialState }),
    MatExpansionModule,
    DragDropModule,
    MatSelectModule,
    MatListModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTableModule,
    TimepickerModule.forRoot(),
    EffectsModule.forFeature([StoresEffects]),
    MatCheckboxModule
  ],
  exports: [
    ContentTranslationComponent,
    CatalogLanguageComponent
  ],
})
export class StoreCatalogModule {

}
