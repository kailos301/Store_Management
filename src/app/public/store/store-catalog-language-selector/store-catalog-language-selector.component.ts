import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CatalogState } from '../+state/stores.reducer';
import { getAvailableCatalogLanguages, getSelectedLang, getCurrentCartUuid } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Lang, ClientStore } from 'src/app/stores/stores';
import { Subject, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectCatalogLanguage, CheckExistingOrder } from '../+state/stores.actions';
import { getSelectedStore } from '../+state/stores.selectors';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-store-catalog-language-selector',
  templateUrl: './store-catalog-language-selector.component.html',
  styleUrls: ['./store-catalog-language-selector.component.scss']
})
export class StoreCatalogLanguageSelectorComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStore: ClientStore;
  orderUuid: string;
  availableCatalogLanguages: Lang[];
  selectedLang: string;
  newLang: string;
  langSelectionForm: FormGroup;
  @ViewChild('langSelectorModal') langModal: ElementRef;
  @Input() haveBackground = false;

  constructor(private store: Store<CatalogState>, private fb: FormBuilder, private renderer: Renderer2, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.availableCatalogLanguages = null;
    this.selectedLang = null;
    this.newLang = null;
    this.langSelectionForm = this.fb.group({
      availableCatalogLanguages: ['']
    });
    // select store catalog languages
    combineLatest([this.store.select(getSelectedStore)
      , this.store.select(getCurrentCartUuid)
      , this.store.select(getAvailableCatalogLanguages)
      , this.store.select(getSelectedLang)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state[0] && state[1]) {
          this.selectedStore = state[0];
          this.orderUuid = state[1];
        }
        if (state[2] && state[2].status === 'FETCHED' && state[3]) {
          this.availableCatalogLanguages = state[2].data;
          this.selectedLang = state[3];
          this.langSelectionForm.get('availableCatalogLanguages').setValue(this.selectedLang);
        }
      });
  }

  setNewCatalogLanguage(event) {
    event.preventDefault();
    this.store.dispatch(new SelectCatalogLanguage(this.newLang));
    // this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid, 'CHECKEXISTING', this.newLang));
    this.OnCloseLangModal(null);
  }

  OnChooseCatalogLang(event) {
    if (this.availableCatalogLanguages.length === 1) {
      return;
    }
    event.preventDefault();
    this.renderer.removeClass(this.langModal.nativeElement, 'hide');
  }

  OnCheckOutsideClose($event, refEl) {
    if ($event.target === refEl) {
      this.OnCloseLangModal($event);
    }
  }

  OnCloseLangModal(event) {
    if (event != null) {
      event.preventDefault();
    }
    this.langSelectionForm.get('availableCatalogLanguages').setValue(this.selectedLang);
    this.renderer.addClass(this.langModal.nativeElement, 'hide');
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
