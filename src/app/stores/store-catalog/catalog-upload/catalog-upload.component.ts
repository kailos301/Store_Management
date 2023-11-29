import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { CatalogState } from '../+state/stores-catalog.reducer';
import {
  VerifyCatalogData,
  UploadCatalogData,
  VerifyCatalogImage,
  DownloadTranslateCatalogXls,
  UploadCatalogTranslate,
  DownloadToUpdateCatalogXls
} from '../+state/stores-catalog.actions';
import { Observable, Subject } from 'rxjs';
import { getCatalogOverview } from '../+state/stores-catalog.selectors';
import { takeUntil } from 'rxjs/operators';
import { StoreCatalog } from '../stores-catalog';
import { helpPage } from 'src/app/shared/help-page.const';
import { StoresCatalogService } from '../stores-catalog.service';

@Component({
  selector: 'app-catalog-upload',
  templateUrl: './catalog-upload.component.html',
  styleUrls: ['./catalog-upload.component.scss']
})
export class CatalogUploadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  storeId: any;
  catalogId: any;
  catalog$: Observable<any>;
  catalogData: StoreCatalog;
  catalogUploadHelpPage = helpPage.catalogManageByExcel;
  importMode: string;
  isCategoryEmpty: boolean;
  isUploadTranslate = false;
  file: any;

  constructor(
    private store: Store<any>,
    private catalog: Store<CatalogState>,
    private activeRoute: ActivatedRoute,
    private storeCatalogService: StoresCatalogService) { }

  ngOnInit() {
    const params = this.activeRoute.params as {[key: string]: any};
    this.catalogId = params._value.catalogId;
    this.storeId = params._value.id;
    this.importMode = this.activeRoute.snapshot.queryParams.importMode;
    this.setHelperPage(this.importMode);
    this.isCategoryEmpty = !(this.importMode === 'EXCEL' || this.importMode === 'UPDATE_EXCEL');
  }

  setHelperPage(importMode: string): void {
    if (importMode === 'UPDATE_EXCEL' || importMode === 'EXCEL') {
      this.catalogUploadHelpPage = helpPage.catalogManageByExcel;
    } else if (importMode === 'TRANSLATE') {
      this.catalogUploadHelpPage = helpPage.catalogChangeAndTranslateLable;
    } else if (importMode === 'IMAGE') {
      this.catalogUploadHelpPage = helpPage.catalogImportFromPhoto;
    }
  }

  verifyCatalog(fileInput: any) {
    if (this.importMode !== 'TRANSLATE') {
      const file =  fileInput.target.files[0] as File;
      this.file = file;
      this.catalog.dispatch(new VerifyCatalogData(file, this.storeId, this.catalogId));
      this.catalog$ = this.catalog.pipe(select(getCatalogOverview));
      this.catalog$.pipe(takeUntil(this.destroy$)).subscribe(data => this.catalogData = data);
    } else {
      this.file =  fileInput.target.files[0] as File;
    }
  }

  verifyCatalogImage(fileInput: any) {
    const file =  fileInput.target.files[0] as File;
    this.catalog.dispatch(new VerifyCatalogImage(file, this.storeId, this.catalogId));
    this.catalog$ = this.catalog.pipe(select(getCatalogOverview));
    this.catalog$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.catalogData = data;
      if (this.catalogData !== undefined) {
        this.isCategoryEmpty = (this.catalogData.categories.length < 1);
      }
    });
  }

  uploadTranslation() {
    this.isUploadTranslate = true;
    this.store.dispatch(new UploadCatalogTranslate(this.file, this.storeId, this.catalogId));
  }

  acceptAndUpload(event: any) {
    event.target.disabled = true;
    this.catalog.dispatch(new UploadCatalogData(this.catalogData, this.storeId, this.catalogId));
  }

  downloadXls() {
    this.store.dispatch(new DownloadTranslateCatalogXls(this.storeId, this.catalogId));
  }

  downloadToUpdateXls() {
    this.store.dispatch(new DownloadToUpdateCatalogXls(this.storeId, this.catalogId));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
