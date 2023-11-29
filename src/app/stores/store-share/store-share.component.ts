import { ClientStore } from './../stores';
import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from '../stores.service';
import { take, takeUntil } from 'rxjs/operators';
import { StoreService } from 'src/app/public/store/store.service';
import { WindowRefService } from 'src/app/window.service';
import { DownloadQRPdf, DownloadQRImage, DownloadFlyerFile } from '../+state/stores.actions';
import { helpPage } from 'src/app/shared/help-page.const';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import dayjs from 'dayjs';

@Component({
  selector: 'app-store-share',
  templateUrl: './store-share.component.html',
  styleUrls: ['./store-share.component.scss']
})
export class StoreShareComponent implements OnInit, OnDestroy {
  store$: Observable<ClientStore>;
  storeDefaultLangId: number;
  id: number;
  initialLoad = false;
  userInterfaceLanguages: any[];
  catalogLanguages: any;
  sharePreviewURL: string;
  private protocol: string;
  private host: string;
  private window: Window;
  selectedUserInterfaceLang = '';
  selectedCatalogLang: string;
  selectedUserInterfaceLocale = '';
  selectedCatalogLocale = '';
  userInterfaceLang: string;
  catalogLang = '';
  userInterfaceLocale: string;
  catalogLocale = '';
  browserDefaultLang: string;
  browserDefaultLocale: string;
  showBrowserMsg = true;
  showStoreDefaultMsg = true;
  destroyed$ = new Subject<void>();
  storeAlias = '';
  locationURL: string;
  sharePreviewHelpPage = helpPage.sharePreview;
  embedCode: string;
  sharePreviewIframeURL: SafeUrl;
  allowOrdering = true;
  @ViewChild('userInterfaceLangPopup') userInterfaceLangPopup: TemplateRef<any>;
  @ViewChild('catalogLanguagesPopup') catalogLanguagesPopup: TemplateRef<any>;
  @ViewChild('qrImage', { static: true }) qrimage: ElementRef;
  @ViewChild('allowOrderingPoppup') allowOrderingPoppup: TemplateRef<any>;
  flyerImgPath: string;

  allowOrderingDialogRef: any;
  wishDate: any;
  constructor(private store: Store<StoresState>,
              private route: ActivatedRoute,
              private storesService: StoresService,
              private storeService: StoreService,
              public dialog: MatDialog,
              private sanitizer: DomSanitizer,
              private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.initialLoad = true;
    this.window = this.windowRefService.nativeWindow;
    this.id = this.route.snapshot.params.id;
    this.fetchFlyerImage();
    this.store$ = this.store.pipe(
      takeUntil(this.destroyed$),
      select(getSelectedStore));
    this.storesService.getUserInterfaceLanguages().pipe(
      takeUntil(this.destroyed$)
    ).subscribe(data => {
      this.userInterfaceLanguages = data.sort((a, b) => a.name.localeCompare(b.name));
      this.browserDefaultLocale = navigator.language.includes('-') ? navigator.language.split('-')[0] : navigator.language;
      this.browserDefaultLang = this.userInterfaceLang = this.userInterfaceLanguages.find(l => l.locale === this.browserDefaultLocale).name;
    });
    this.storeService.getAvailableLanguages(this.id).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(data => {
      this.catalogLanguages = data.data.sort((a, b) => a.name.localeCompare(b.name));
      this.selectedUserInterfaceLocale = this.userInterfaceLocale = this.browserDefaultLocale;
      this.changeCatalogLanguage(true);
    });
    this.store$.pipe(
      takeUntil(this.destroyed$)
    )
      .subscribe(store => {
        this.storeAlias = store.aliasName;
        this.protocol = this.windowRefService.nativeWindowLocation.protocol;
        this.host = this.windowRefService.nativeWindowLocation.host.replace('admin.', '');
        this.locationURL = this.protocol + '//' + this.storeAlias + '.' + this.host;
        if (this.catalogLocale === '') {
          this.catalogLocale = store.language.locale;
        }
        this.generateSharePreviewURL();
      });
  }

  buildQueryString(params: { [key: string]: string }) {
    const query = [];
    for (const key in params) {
      if (params[key]) {
        query.push(key + '=' + params[key]);
      }
    }
    return query.join('&');
  }
  fetchQRImage() {
    // should make https and remove localhost when develop.
    this.storesService.downloadQRImage(this.id, this.sharePreviewURL).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(b => {
      // tslint:disable-next-line
      this.qrimage.nativeElement.src = this.window['URL'].createObjectURL(b.blob);
    });
  }

  getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  generateSharePreviewURL() {
    const queryString = this.buildQueryString({
      clang: this.selectedCatalogLocale,
      ulang: this.showBrowserMsg ? '' : (this.selectedUserInterfaceLocale ? this.selectedUserInterfaceLocale : this.browserDefaultLocale),
      basket: this.allowOrdering ? '' : 'false',
      wish: this.wishDate ? dayjs(new Date(this.wishDate)).format('YYYY-MM-DD') : null,
    });
    this.sharePreviewURL = this.locationURL + (queryString ? '/?' + queryString : '');
    this.sharePreviewIframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.sharePreviewURL);
    this.embedCode = '<iframe frameborder="0" border="none" width="350" height="600" src='
                      + '"' + this.sharePreviewURL + '"' + '></iframe>';

    this.fetchQRImage();
  }

  openUserInterfaceLanPopup() {
    this.dialog.open(this.userInterfaceLangPopup, {
      width: '50%'
    });
  }

  // Allow ordering popup
  openAllowOrderPopup() {
    this.allowOrderingDialogRef = this.dialog.open(this.allowOrderingPoppup, {
      width: '50%'
    });
  }

  setAllowOrdering() {
    this.generateSharePreviewURL();
    this.dialog.closeAll();
  }

  fetchFlyerImage() {
    // should make https and remove localhost when develop.
    this.storesService.downloadOrRenderFlyerImage(this.id, '', true).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(b => {
      // tslint:disable-next-line
      this.flyerImgPath = this.window['URL'].createObjectURL(b.blob);
    },
    error => {});
  }


  removeWishDate() {
    this.wishDate = null;
    this.generateSharePreviewURL();
  }
  onWishDateChange(date) {
    this.wishDate = date;
    this.generateSharePreviewURL();
  }
  openCatalogLanPopup() {
    this.dialog.open(this.catalogLanguagesPopup, {
      width: '50%'
    });
  }

  onNoClick() {
    this.dialog.closeAll();
  }

  copySharePreviewURL() {
    const el = document.createElement('textarea');
    el.value = this.sharePreviewURL;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  copyEmbedCode() {
    const el = document.createElement('textarea');
    el.value = this.embedCode.toString();
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  setUserInterfaceLocale(ulang: string, locale: string) {
    this.userInterfaceLang = ulang;
    this.userInterfaceLocale = locale;
  }

  setCatalogLangLocale(clang: string, locale: string) {
    this.initialLoad = false;
    this.catalogLang = clang;
    this.catalogLocale = locale;
  }

  changeUserInterfaceLang() {
    this.showBrowserMsg = false;
    this.initialLoad = false;
    this.selectedUserInterfaceLang = this.userInterfaceLang;
    this.selectedUserInterfaceLocale = this.userInterfaceLocale;
    this.changeCatalogLanguage(true);
    this.generateSharePreviewURL();
    this.dialog.closeAll();
  }

  changeCatalogLanguage(userInterfaceLangChanged: boolean) {
    if (!this.initialLoad) {
      if (userInterfaceLangChanged && this.catalogLanguages.filter(l => l.locale === this.selectedUserInterfaceLocale).length > 0) {
        this.selectedCatalogLang = this.userInterfaceLang;
        this.selectedCatalogLocale = this.userInterfaceLocale;
        this.showStoreDefaultMsg = false;
      } else {
        this.selectedCatalogLang = !this.catalogLang.length || this.catalogLang === '' ? this.selectedCatalogLang : this.catalogLang;
        if (userInterfaceLangChanged === false || this.selectedCatalogLocale === '') {
          this.selectedCatalogLocale = !this.catalogLocale.length || this.catalogLocale === ''
                                        ? this.selectedCatalogLocale : this.catalogLocale;
        }
        if (userInterfaceLangChanged === false) {
          this.showStoreDefaultMsg = false;
        }
        this.generateSharePreviewURL();
      }
    }
    this.dialog.closeAll();
  }

  downloadImage() {
    this.store.pipe(
      take(1),
    ).subscribe(() => { this.store.dispatch(new DownloadQRImage(this.id, this.sharePreviewURL)); });
  }

  downloadPdf() {
    this.store.pipe(
      take(1),
    ).subscribe(() => { this.store.dispatch(new DownloadQRPdf(this.id)); });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  downloadFlyer() {
    this.store.dispatch(new DownloadFlyerFile(this.id, ''));
  }
}
