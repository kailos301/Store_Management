
// tslint:disable: member-ordering
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { StoresCatalogService } from '../stores-catalog.service';
import {
  StoresCatalogActionType,
  LoadCatalog,
  LoadCatalogSuccess,
  LoadCatalogFailed,
  SaveOffer,
  SaveOfferSuccess,
  SaveOfferFailed,
  LoadOffer,
  LoadOfferSuccess,
  LoadOfferFailed,
  SaveCategory,
  SaveCategorySuccess,
  SaveCategoryFailed,
  LoadCategory,
  LoadCategorySuccess,
  LoadCategoryFailed,
  SaveOfferPosition,
  SaveOfferPositionSuccess,
  SaveOfferPositionFailed,
  SaveCategoryPosition,
  SaveCategoryPositionSuccess,
  SaveCategoryPositionFailed,
  UploadOfferImage,
  UploadOfferImageSuccess,
  UploadOfferImageFailed,
  SaveContentItem,
  SaveContentItemSuccess,
  SaveContentItemFailed,
  AssociateChildCategories,
  AssociateChildCategoriesSuccess,
  AssociateChildCategoriesFailed,
  AssociateChildOffers,
  AssociateChildOffersSuccess,
  AssociateChildOffersFailed,
  AssociateOfferVariants,
  AssociateOfferVariantsSuccess,
  AssociateOfferVariantsFailed,
  VerifyCatalogData,
  VerifyCatalogDataSuccess,
  VerifyCatalogDataFailed,
  UploadCatalogData,
  UploadCatalogDataSuccess,
  UploadCatalogDataFailed,
  DeleteCategory,
  DeleteCategorySuccess,
  DeleteCategoryFailed,
  DeleteOffer,
  DeleteOfferSuccess,
  DeleteOfferFailed,
  SaveAvailability,
  SaveAvailabilitySuccess,
  SaveAvailabilityFailed,
  VerifyCatalogImage,
  VerifyCatalogImageSuccess,
  VerifyCatalogImageFailed,
  DownloadTranslateCatalogXls,
  DownloadTranslateCatalogXlsSuccess,
  DownloadTranslateCatalogXlsFailed,
  DownloadToUpdateCatalogXls,
  DownloadToUpdateCatalogXlsSuccess,
  DownloadToUpdateCatalogXlsFailed,
  UploadCatalogTranslate,
  UploadCatalogTranslateSuccess,
  UploadCatalogTranslateFailed,
  DeleteOfferImageSuccess,
  DeleteOfferImage,
  DeleteOfferImageFailed,
  PatchSaveOffer,
  PatchSaveOfferSuccess,
  PatchSaveOfferFailed,
  ImportCatalog,
  ImportCatalogSuccess,
  ImportCatalogFailed,
  DownloadOfferImage,
  DownloadOfferImageSuccess,
  DownloadOfferImageFailed
} from './stores-catalog.actions';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { OfferState, CategoryState } from './stores-catalog.reducer';
import { getOfferDetails } from './stores-catalog.selectors';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class StoresEffects {
  foodyLink: any;

  constructor(
    private actions$: Actions,
    private catalogService: StoresCatalogService,
    private toastr: ToastrService,
    private offer: Store<OfferState>,
    private category: Store<CategoryState>,
    private router: Router,
    private translateSer: TranslateService) {
      this.foodyLink = 'https://foody.com.cy/';
    }

  @Effect()
  onLoadCatalog = this.actions$.pipe(
    ofType<LoadCatalog>(StoresCatalogActionType.LoadCatalog),
    switchMap(action => this.catalogService.getcatalog(action.id).pipe(
      map(s => new LoadCatalogSuccess(s)),
      catchError(a => of(new LoadCatalogFailed(a)))
    ))
  );

  @Effect({ dispatch: false })
  onLoadCatalogFailed = this.actions$.pipe(
    ofType<LoadCatalogFailed>(StoresCatalogActionType.LoadCatalogFailed),
    tap(a => this.toastr.error('Error occurred while fetching catalog!'))
  );

  @Effect()
  onSaveOffer = this.actions$.pipe(
    ofType<SaveOffer>(StoresCatalogActionType.SaveOffer),
    switchMap(action => this.catalogService.saveOffer(action.saveOffer, action.offerId, action.storeId, action.catalogId)
      .pipe(
        switchMap(s => {
          if (!!action.offerImage) {
            return this.catalogService.uploadOfferImage(action.offerImage, action.storeId, s.contentItemId)
            .pipe(
              switchMap(r => this.catalogService.saveImageToOffer(s, r.fileDownloadUri + '?' + new Date().getTime(), action.storeId)
                .pipe(
                  map(c =>
                    new SaveOfferSuccess(
                      s, action.storeId, action.catalogId, action.childCategoryId, action.offerId,
                      action.parentOfferId, action.sourcePage, action.nextPage)
                  )
                )
              ),
              catchError(e => {
                if (e.status === 400) {
                  const errorMsg = 'An error occured in Logo uploading, please try again';
                  if (e.error.errors == null) { e.error.errors = [{ message: errorMsg }]; }
                  return of(new UploadOfferImageFailed(e.error.errors.map(er => !!er ? !!er.message ? er.message : errorMsg : errorMsg)));
                } else if (e.status === 413) {
                  return of(new UploadOfferImageFailed('File size should not be more than 10 MB'));
                }
                return of(new UploadOfferImageFailed('An error occured in Logo uploading, please try again '));
              })
            );
          } else {
            return of(
              new SaveOfferSuccess(
                s, action.storeId, action.catalogId, action.childCategoryId,
                action.offerId, action.parentOfferId, action.sourcePage, action.nextPage));
          }
        }),
        catchError(a => of(new SaveOfferFailed()))
      ))
  );

  @Effect()
  onPatchSaveOffer = this.actions$.pipe(
    ofType<PatchSaveOffer>(StoresCatalogActionType.PatchSaveOffer),
    switchMap(action => this.catalogService.patchOffer(action.patchSaveOffer, action.offerId, action.storeId, action.catalogId)
      .pipe(
        map(s =>
          new PatchSaveOfferSuccess(
            s, action.storeId, action.catalogId, action.childCategoryId,
            action.offerId, action.parentOfferId, action.sourcePage, action.nextPage)),
        catchError(a => of(new PatchSaveOfferFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onPatchSaveOfferFailed = this.actions$.pipe(
    ofType<PatchSaveOfferFailed>(StoresCatalogActionType.PatchSaveOfferFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect({ dispatch: false })
  onPatchSaveOfferSuccess = this.actions$.pipe(
    ofType<PatchSaveOfferSuccess>(StoresCatalogActionType.PatchSaveOfferSuccess),
    tap(z => this.toastr.success(this.translateSer.instant('admin.store.message.saveOfferSuccess'))),
    tap(z => this.navigateOfferToSourcePage(z))
  );

  @Effect()
  onSaveContentItem = this.actions$.pipe(
    ofType<SaveContentItem>(StoresCatalogActionType.SaveContentItem),
    switchMap(action => this.catalogService.saveContentItem(action.contentItem, action.contentItemId, action.storeId)
      .pipe(
        map(s => new SaveContentItemSuccess(s)),
        catchError(a => of(new SaveContentItemFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onSaveContentItemSuccess = this.actions$.pipe(
    ofType<SaveContentItemSuccess>(StoresCatalogActionType.SaveContentItemSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.translationsUpdateSuccess')))
  );

  @Effect({ dispatch: false })
  onSaveContentItemFailed = this.actions$.pipe(
    ofType<SaveContentItemFailed>(StoresCatalogActionType.SaveContentItemFailed),
    tap(a => this.toastr.error('An error occured while saving translations'))
  );

  @Effect()
  onSaveOfferPosition = this.actions$.pipe(
    ofType<SaveOfferPosition>(StoresCatalogActionType.SaveOfferPosition),
    switchMap(action => this.catalogService.saveOfferPosition(action.offers, action.storeId, action.catalogId)
      .pipe(
        map(s => new SaveOfferPositionSuccess(s)),
        catchError(a => of(new SaveOfferPositionFailed()))
      ))
  );

  @Effect()
  onSaveCategoryPosition = this.actions$.pipe(
    ofType<SaveCategoryPosition>(StoresCatalogActionType.SaveCategoryPosition),
    switchMap(action => this.catalogService.saveCategoryPosition(action.categories, action.storeId, action.catalogId)
      .pipe(
        map(s => new SaveCategoryPositionSuccess(s)),
        catchError(a => of(new SaveCategoryPositionFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onSaveOfferSuccess = this.actions$.pipe(
    ofType<SaveOfferSuccess>(StoresCatalogActionType.SaveOfferSuccess),
    tap(z => this.toastr.success(this.translateSer.instant('admin.store.message.saveOfferSuccess'))),
    tap(z => this.navigateOfferToSourcePage(z))
  );

  navigateOfferToSourcePage(z) {
    const offer = z.saveOffer;
    const qParam = { fromOptionGrp: null, fromVariant: null, parentOfferId: null };
    if (offer.hierarchyLevel === 'PARENT') {
      if (z.nextPage === 'PARENT') {
        this.router.navigate([`/manager/stores/${z.storeId}/catalog`], { queryParams: { selectedId: z.saveOffer.categoryId } });
      } else if (z.nextPage === 'NEW') {
        // tslint:disable-next-line
        window.location.href = `/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/CREATE_OFFER?categoryId=${z.saveOffer.categoryId}`;
      } else if (z.nextPage === 'CURRENT' && z.mode === 'CREATE_OFFER') {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false; this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer`, z.saveOffer.offerId]);
      }
    } else if (offer.hierarchyLevel === 'CHILD') {
      qParam.parentOfferId = z.parentOfferId;
      if (z.sourcePage === 'OFFER') {
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.parentOfferId}`], { queryParams: qParam });
      } else {
        // tslint:disable-next-line
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childCategory/${z.childCategoryId}`], { queryParams: qParam });
      }
    } else if (offer.hierarchyLevel === 'VARIANT') {
      qParam.parentOfferId = z.parentOfferId;
      this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.parentOfferId}`], { queryParams: qParam });
    } else if (offer.hierarchyLevel === 'RULE') {
      // tslint:disable-next-line
      this.router.navigate([`/manager/stores/${z.storeId}/settings/ordering-rules/${z.parentOfferId}/option-group/${z.childCategoryId}`], { queryParams: { catalogId: z.catalogId } });
    }
  }

  @Effect({ dispatch: false })
  onSaveOfferFailed = this.actions$.pipe(
    ofType<SaveOfferFailed>(StoresCatalogActionType.SaveOfferFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onLoadOffer = this.actions$.pipe(
    ofType<LoadOffer>(StoresCatalogActionType.LoadOffer),
    switchMap(action => this.catalogService.loadOffer(action.offerId, action.storeId, action.catalogId).pipe(
      map(s => new LoadOfferSuccess(s)),
      catchError(a => of(new LoadOfferFailed()))
    ))
  );

  @Effect()
  onSaveCategory = this.actions$.pipe(
    ofType<SaveCategory>(StoresCatalogActionType.SaveCategory),
    switchMap(action => this.catalogService.saveCategory(action.saveCategory, action.categoryId, action.storeId, action.catalogId)
      .pipe(

        map(s => new SaveCategorySuccess(s, action.storeId, action.catalogId, action.categoryId, action.parentOfferId)),
        catchError(a => of(new SaveCategoryFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onSaveCategorySuccess = this.actions$.pipe(
    ofType<SaveCategorySuccess>(StoresCatalogActionType.SaveCategorySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.saveCategorySuccess'))),
    tap(z => this.navigateCategoryToSourcePage(z))
  );

  navigateCategoryToSourcePage(z) {
    const category = z.saveCategory;
    if (category.hierarchyLevel === 'PARENT') {
      this.router.navigate([`/manager/stores/${z.storeId}/catalog`]);
    }
    if (category.hierarchyLevel === 'CHILD') {
      const qParam = { parentOfferId: z.parentOfferId };
      this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.parentOfferId}`], { queryParams: qParam });
    }
    if (category.hierarchyLevel === 'RULE') {
      // tslint:disable-next-line
      this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules', z.parentOfferId], { queryParams: { categoryId: z.saveCategory.categoryId, name: z.saveCategory.name } });
    }
  }

  @Effect({ dispatch: false })
  onSaveCategoryFailed = this.actions$.pipe(
    ofType<SaveCategoryFailed>(StoresCatalogActionType.SaveCategoryFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onLoadCategory = this.actions$.pipe(
    ofType<LoadCategory>(StoresCatalogActionType.LoadCategory),
    switchMap(action => this.catalogService.loadCategory(action.categoryId, action.storeId, action.catalogId).pipe(
      map(s => new LoadCategorySuccess(s)),
      catchError(a => of(new LoadCategoryFailed()))
    ))
  );

  @Effect()
  onOfferImageUpload = this.actions$.pipe(
    ofType<UploadOfferImage>(StoresCatalogActionType.UploadOfferImage),
    switchMap(a => this.catalogService.uploadOfferImage(a.file, a.storeId, a.contentItemId)
      .pipe(
        map(r => new UploadOfferImageSuccess(r.fileDownloadUri + '?' + new Date().getTime(), a.storeId)),
        catchError(e => {
          if (e.status === 400) {
            const errorMsg = 'An error occured in Logo uploading, please try again';
            if (e.error.errors == null) { e.error.errors = [{ message: errorMsg }]; }
            return of(new UploadOfferImageFailed(e.error.errors.map(er => !!er ? !!er.message ? er.message : errorMsg : errorMsg)));
          } else if (e.status === 413) {
            return of(new UploadOfferImageFailed('File size should not be more than 10 MB'));
          }
          return of(new UploadOfferImageFailed('An error occured in Logo uploading, please try again '));
        }
        )
      )
    ));

  @Effect({ dispatch: false })
  onUploadOfferImageSuccess = this.actions$.pipe(
    ofType<UploadOfferImageSuccess>(StoresCatalogActionType.UploadOfferImageSuccess),
    withLatestFrom(this.offer.select(getOfferDetails)),
    switchMap(([a, s]) => this.catalogService.saveImageToOffer(s, a.imageUrl, a.storeId).pipe(
      map(r => new SaveContentItemSuccess(r)),
      tap(r => this.toastr.success(this.translateSer.instant('admin.store.message.imageUploadSuccess'))))
    ));

  @Effect({ dispatch: false })
  onStoreImageUploadFailed = this.actions$.pipe(
    ofType<UploadOfferImageFailed>(StoresCatalogActionType.UploadOfferImageFailed),
    tap(e => this.toastr.error(e.errorMessage, 'Upload failed!'))
  );

  @Effect()
  onUploadCatalogTranslate = this.actions$.pipe(
    ofType<UploadCatalogTranslate>(StoresCatalogActionType.UploadCatalogTranslate),
    switchMap(a => this.catalogService.uploadCatalogTranslate(a.file, a.storeId, a.catalogId)
      .pipe(
        map(r => new UploadCatalogTranslateSuccess(a.storeId)),
        catchError(e => {
          return of(new UploadCatalogTranslateFailed('An error occured in Logo uploading, please try again ', a.storeId));
        }
        )
      )
    ));

  @Effect({ dispatch: false })
  onUploadCatalogTranslateSuccess = this.actions$.pipe(
    ofType<UploadCatalogTranslateSuccess>(StoresCatalogActionType.UploadCatalogTranslateSuccess),
    tap(r => {
      this.router.navigate(['/manager/stores/' + r.storeId + '/catalog']);
      return this.toastr.success(this.translateSer.instant('admin.store.message.catalogDataUploadSuccess'));
    }
    ));

  @Effect({ dispatch: false })
  onUploadCatalogTranslateFailed = this.actions$.pipe(
    ofType<UploadCatalogTranslateFailed>(StoresCatalogActionType.UploadCatalogTranslateFailed),
    tap(e => {
      this.router.navigate(['/manager/stores/' + e.storeId + '/catalog']);
      this.toastr.error(this.translateSer.instant('admin.store.catalog.contentFailedError'));
    })
  );

  @Effect()
  onAssociateChildCategories = this.actions$.pipe(
    ofType<AssociateChildCategories>(StoresCatalogActionType.AssociateChildCategories),
    switchMap(
      action => this.catalogService.associateChildCategories(
        action.categoriesView, action.offerId, action.storeId, action.catalogId
      ).pipe(
        map(s => new AssociateChildCategoriesSuccess(s, action.offerId, action.storeId, action.catalogId)),
        catchError(a => of(new SaveCategoryFailed()))
    ))
  );

  @Effect({ dispatch: false })
  onAssociateChildCategoriesSuccess = this.actions$.pipe(
    ofType<AssociateChildCategoriesSuccess>(StoresCatalogActionType.AssociateChildCategoriesSuccess),
    tap(a => {
      this.offer.dispatch(new LoadOffer(a.offerId, a.storeId, a.catalogId));
      this.toastr.success(this.translateSer.instant('admin.store.message.childCategoryOffer'));
    })
  );

  @Effect({ dispatch: false })
  onAssociateChildCategoriesFailed = this.actions$.pipe(
    ofType<AssociateChildCategoriesFailed>(StoresCatalogActionType.AssociateChildCategoriesFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onAssociateChildOffers = this.actions$.pipe(
    ofType<AssociateChildOffers>(StoresCatalogActionType.AssociateChildOffers),
    switchMap(action => this.catalogService.associateChildOffers(action.offersView, action.categoryId, action.storeId, action.catalogId)
      .pipe(
        map(s => new AssociateChildOffersSuccess(s)),
        catchError(a => of(new AssociateChildOffersFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onAssociateChildOffersSuccess = this.actions$.pipe(
    ofType<AssociateChildCategoriesSuccess>(StoresCatalogActionType.AssociateChildOffersSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.childOfferCategory')))
  );

  @Effect({ dispatch: false })
  onAssociateChildOffersFailed = this.actions$.pipe(
    ofType<AssociateChildOffersFailed>(StoresCatalogActionType.AssociateChildOffersFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onAssociateOfferVariants = this.actions$.pipe(
    ofType<AssociateOfferVariants>(StoresCatalogActionType.AssociateOfferVariants),
    switchMap(action => this.catalogService.associateOffersVariants(action.offersView, action.offerId, action.storeId, action.catalogId)
      .pipe(
        map(s => new AssociateOfferVariantsSuccess(s)),
        catchError(a => of(new AssociateOfferVariantsFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onAssociateOfferVariantsSuccess = this.actions$.pipe(
    ofType<AssociateOfferVariantsSuccess>(StoresCatalogActionType.AssociateOfferVariantsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.offerVaryAToffer')))
  );

  @Effect({ dispatch: false })
  onAssociateOfferVariantsFailed = this.actions$.pipe(
    ofType<AssociateOfferVariantsFailed>(StoresCatalogActionType.AssociateOfferVariantsFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onVerifyCatalogData = this.actions$.pipe(
    ofType<VerifyCatalogData>(StoresCatalogActionType.VerifyCatalogData),
    switchMap(a => this.catalogService.verifyCatalogData(a.file, a.storeId, a.catalogId)
      .pipe(
        map(r => new VerifyCatalogDataSuccess(r)),
        catchError(e => of(new VerifyCatalogDataFailed(e)))
      )
    )
  );

  @Effect({ dispatch: false })
  onVerifyCatalogDataSuccess = this.actions$.pipe(
    ofType<VerifyCatalogDataSuccess>(StoresCatalogActionType.VerifyCatalogDataSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.catalogVerifySuccess')))
  );

  @Effect({ dispatch: false })
  onVerifyCatalogDataFailed = this.actions$.pipe(
    ofType<VerifyCatalogDataFailed>(StoresCatalogActionType.VerifyCatalogDataFailed),
    tap(a => this.handleCatalogErrors(a))
  );

  @Effect()
  onVerifyCatalogImage = this.actions$.pipe(
    ofType<VerifyCatalogImage>(StoresCatalogActionType.VerifyCatalogImage),
    switchMap(a => this.catalogService.verifyCatalogImage(a.file, a.storeId, a.catalogId)
      .pipe(
        map(r => new VerifyCatalogImageSuccess(r)),
        catchError(e => of(new VerifyCatalogImageFailed(e)))
      )
    )
  );

  @Effect({ dispatch: false })
  onVerifyCatalogImageSuccess = this.actions$.pipe(
    ofType<VerifyCatalogImageSuccess>(StoresCatalogActionType.VerifyCatalogImageSuccess),
    tap(a => this.handleVerifyImageUploadSuccess(a))
  );

  handleVerifyImageUploadSuccess(r: VerifyCatalogImageSuccess) {
    if (r.catalog.categories.length > 0) {
      this.toastr.success(this.translateSer.instant('admin.store.message.verifyCatalogImageSuccess'));
    } else {
      this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
    }
  }
  @Effect({ dispatch: false })
  onVerifyCatalogImageFailed = this.actions$.pipe(
    ofType<VerifyCatalogImageFailed>(StoresCatalogActionType.VerifyCatalogImageFailed),
    tap(a => this.handleCatalogErrors(a, 'verifyCatalogImageFailed'))
  );

  handleCatalogErrors(e, errorAt?: string) {
    if (e.errorMessages != null
      && e.errorMessages.error != null
      && e.errorMessages.error.errors != null) {
      if (errorAt && errorAt === 'verifyCatalogImageFailed') {
        this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
      } else {
        const errorList = e.errorMessages.error.errors.map(err => err.message);
        errorList.forEach(err => this.toastr.error(err, 'Verify failed!'));
      }
    } else {
      if (errorAt && errorAt === 'verifyCatalogImageFailed') {
        this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
      } else {
        this.toastr.error('Catalog Verify Failed!');
      }
    }
  }

  @Effect()
  onUploadCatalogData = this.actions$.pipe(
    ofType<UploadCatalogData>(StoresCatalogActionType.UploadCatalogData),
    switchMap(a => this.catalogService.UploadCatalogData(a.catalog, a.storeId, a.catalogId)
      .pipe(
        map(r => new UploadCatalogDataSuccess(r, a.storeId)),
        catchError(e => of(new UploadCatalogDataFailed(e, a.storeId)))
      )
    )
  );

  @Effect({ dispatch: false })
  onUploadCatalogDataSuccess = this.actions$.pipe(
    ofType<UploadCatalogDataSuccess>(StoresCatalogActionType.UploadCatalogDataSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported'))),
    tap(z => this.router.navigate(['/manager/stores/', z.storeId, 'catalog']))
  );


  @Effect({ dispatch: false })
  onUploadCatalogDataFailed = this.actions$.pipe(
    ofType<UploadCatalogDataFailed>(StoresCatalogActionType.UploadCatalogDataFailed),
    tap(a => this.toastr.error('Catalog import is failed, please try again')),
    tap(z => this.router.navigate(['/manager/stores/', z.storeId, 'catalog']))
  );

  @Effect()
  onDeleteCategory = this.actions$.pipe(
    ofType<DeleteCategory>(StoresCatalogActionType.DeleteCategory),
    switchMap(a => this.catalogService.deleteCategory(a.storeId, a.catalogId, a.categoryId)
      .pipe(
        map(r => new DeleteCategorySuccess(a.storeId, a.catalogId, a.parentOfferId, a.ruleId)),
        catchError(e => of(new DeleteCategoryFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onDeleteCategorySuccess = this.actions$.pipe(
    ofType<DeleteCategorySuccess>(StoresCatalogActionType.DeleteCategorySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.categoryDeleteSuccess'))),
    tap(z => {
      if (z.ruleId) {
        this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules', z.ruleId]);
      } else {
        if (z.parentOfferId != null) {
          const qParam = { fromOptionGrp: true };
          this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.parentOfferId}`], { queryParams: qParam });
        } else {
          this.router.navigate(['/manager/stores/', z.storeId, 'catalog']);
        }
      }

    })
  );


  @Effect({ dispatch: false })
  onDeleteCategoryFailed = this.actions$.pipe(
    ofType<DeleteCategoryFailed>(StoresCatalogActionType.DeleteCategoryFailed),
    tap(a => this.toastr.error('Category Deletion Failed'))
  );

  @Effect()
  onDeleteOffer = this.actions$.pipe(
    ofType<DeleteOffer>(StoresCatalogActionType.DeleteOffer),
    switchMap(a => this.catalogService.deleteOffer(a.storeId, a.catalogId, a.offerId)
      .pipe(
        map(r => new DeleteOfferSuccess(a.storeId, a.catalogId, a.parentOfferId, a.ruleOptionGroupId)),
        catchError(e => of(new DeleteOfferFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onDeleteOfferSuccess = this.actions$.pipe(
    ofType<DeleteOfferSuccess>(StoresCatalogActionType.DeleteOfferSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.offerDeleteSuccess'))),
    tap(z => {
      if (z.ruleOptionGroupId) {
        // tslint:disable-next-line
        this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules', z.parentOfferId, 'option-group', z.ruleOptionGroupId], { queryParams: { catalogId: z.catalogId } });
      } else {
        if (z.parentOfferId != null) {
          const qParam = { fromOptionGrp: true };
          this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.parentOfferId}`], { queryParams: qParam });
        } else {
          this.router.navigate(['/manager/stores/', z.storeId, 'catalog']);
        }
      }

    })
  );


  @Effect({ dispatch: false })
  onDeleteOfferFailed = this.actions$.pipe(
    ofType<DeleteOfferFailed>(StoresCatalogActionType.DeleteOfferFailed),
    tap(a => this.toastr.error('Offer Deletion Failed'))
  );

  @Effect()
  onSaveAvailability = this.actions$.pipe(
    ofType<SaveAvailability>(StoresCatalogActionType.SaveAvailability),
    switchMap(action => this.catalogService.saveAvailability(action.availability, action.storeId)
      .pipe(
        map(s => new SaveAvailabilitySuccess(s, action.storeId)),
        catchError(a => of(new SaveAvailabilityFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onSaveAvailabilitySuccess = this.actions$.pipe(
    ofType<SaveAvailabilitySuccess>(StoresCatalogActionType.SaveAvailabilitySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.createAvailabilitySuccess')))
  );

  @Effect({ dispatch: false })
  onSaveAvailabilityFailed = this.actions$.pipe(
    ofType<SaveAvailabilityFailed>(StoresCatalogActionType.SaveAvailabilityFailed),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.createAvailabilityFail')))
  );

  @Effect()
  onDownloadTranslateCatalogXls = this.actions$.pipe(
    ofType<DownloadTranslateCatalogXls>(StoresCatalogActionType.DownloadTranslateCatalogXls),
    switchMap(action => this.catalogService.downloadTranslateCatalogXls(action.storeId, action.catalogId)
      .pipe(
        map(s => new DownloadTranslateCatalogXlsSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadTranslateCatalogXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  );

  @Effect({ dispatch: false })
  onDownloadTranslateCatalogXlsFailed = this.actions$.pipe(
    ofType<DownloadTranslateCatalogXlsFailed>(
      StoresCatalogActionType.DownloadTranslateCatalogXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect()
  onDownloadToUpdateCatalogXls = this.actions$.pipe(
    ofType<DownloadToUpdateCatalogXls>(StoresCatalogActionType.DownloadToUpdateCatalogXls),
    switchMap(action => this.catalogService.downloadToUpdateCatalogXls(action.storeId, action.catalogId)
      .pipe(
        map(s => new DownloadToUpdateCatalogXlsSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadToUpdateCatalogXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  );

  @Effect({ dispatch: false })
  onDownloadToUpdateCatalogXlsFailed = this.actions$.pipe(
    ofType<DownloadToUpdateCatalogXlsFailed>(
      StoresCatalogActionType.DownloadToUpdateCatalogXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect()
  onDeleteOfferImage = this.actions$.pipe(
    ofType<DeleteOfferImage>(StoresCatalogActionType.DeleteOfferImage),
    switchMap(a => this.catalogService.deleteOfferImage(a.storeId, a.catalogId, a.offerId)
      .pipe(
        map(r => new DeleteOfferImageSuccess(a.storeId, a.catalogId, a.offerId)),
        catchError(e => of(new DeleteOfferImageFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onDeleteOfferImageSuccess = this.actions$.pipe(
    ofType<DeleteOfferImageSuccess>(StoresCatalogActionType.DeleteOfferImageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageRemoveSuccess')))
  );

  @Effect({ dispatch: false })
  onDeleteOfferImageFailed = this.actions$.pipe(
    ofType<DeleteOfferImageFailed>(StoresCatalogActionType.DeleteOfferImageFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  );

  @Effect()
  onImportCatalog = this.actions$.pipe(
    ofType<ImportCatalog>(StoresCatalogActionType.ImportCatalog),
    switchMap(
      action => this.catalogService.ImportCatalog(
        action.catalog.externalDomain,
        action.catalog.externalReference,//.substring(this.foodyLink.length),
        action.storeId
      ).pipe(
        map(s => new ImportCatalogSuccess(s)),
        catchError(a => of(new ImportCatalogFailed(a)))
      ))
  );

  @Effect({ dispatch: false })
  onImportCatalogSuccess = this.actions$.pipe(
    ofType<ImportCatalogSuccess>(StoresCatalogActionType.ImportCatalogSuccess),
    tap(z => {
      if (z && z.catalog && z.catalog.status) {
        if (z.catalog.status === 'IN_PROGRESS') {
          this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogFetching'));
          this.router.navigate(['/manager/stores/', window.location.href.split('/')[5], 'catalog']);
        }
        if (z.catalog.status === 'COMPLETED') {
          this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported'));
          this.router.navigate(['/manager/stores/', window.location.href.split('/')[5], 'catalog']);
        }
      }
    })
  );

  @Effect({ dispatch: false })
  onImportCatalogFailed = this.actions$.pipe(
    ofType<VerifyCatalogDataFailed>(StoresCatalogActionType.ImportCatalogFailed),
    tap(a => this.handleImportCatalogErrors(a))
  );

  handleImportCatalogErrors(e) {
    if (e.errorMessages != null
      && e.errorMessages.error != null
      && e.errorMessages.error.errors != null) {

      if (Array.isArray(e.errorMessages.error.errors) && e.errorMessages.error.errors.length > 0) {
        if (e.errorMessages.error.errors[0].code === 'STORE_NOT_FOUND') {
          this.toastr.error(this.translateSer.instant('admin.store.storeNotfound'));
        }
        else {
          this.toastr.error(this.translateSer.instant('admin.store.catalog.catalogUnabletoimport'));
        }
      }
    }
  }

  @Effect()
  onDownloadOfferImage = this.actions$.pipe(
    ofType<DownloadOfferImage>(StoresCatalogActionType.DownloadOfferImage),
    switchMap(action => this.catalogService.downloadOfferImage(action.url)
      .pipe(
        map(s => new DownloadOfferImageSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadOfferImageFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  );

}
