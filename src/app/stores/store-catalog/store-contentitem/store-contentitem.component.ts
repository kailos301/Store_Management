import { Component, OnInit, OnDestroy, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Language } from 'src/app/api/types/Language';
import { ContentItemModel } from '../stores-catalog';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClientStore } from '../../stores';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-store-contentitem',
  templateUrl: './store-contentitem.component.html',
  styleUrls: ['./store-contentitem.component.scss']
})
export class StoreContentitemComponent implements OnInit, OnDestroy {
  @Input() content: ContentItemModel[];
  @Input() mode: string;
  @Output() submitEvent = new EventEmitter<ContentItemModel[]>();
  store$: Observable<ClientStore>;
  contentItemForm: FormGroup;
  contentItemVariantForm: FormGroup;
  private destroy$ = new Subject();
  languagesList: Language[];
  assignedTranslations: ContentItemModel[] = [];
  translationPresent = false;
  storeDefaultLangId: number;
  storeContentitemHelpPage = helpPage.catalog;

  constructor(private fb: FormBuilder, private referenceDataService: ReferenceDataService, private store: Store<StoresState>) { }

  ngOnInit() {
    this.store$ = this.store.pipe(
      select(getSelectedStore), tap(data => { this.storeDefaultLangId = data.language.id; })
    );
    this.contentItemForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])],
      longDescription: [null, Validators.compose([Validators.maxLength(1000)])],
      languageId: ['', Validators.required]
    });
    this.contentItemVariantForm = this.fb.group({
      priceDescription: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      languageId: ['', Validators.required]
    });

    forkJoin([this.referenceDataService.getLanguages()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.languagesList = results[0].data;
      });

  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getControl(name: string) {
    return this.contentItemForm.get(name);
  }

  getVariantControl(name: string) {
    return this.contentItemVariantForm.get(name);
  }

  publishVariantContentItem() {
    this.translationPresent = false;
    if (!this.checkIfTranslationPresent(this.contentItemVariantForm.value)) {
      const { languageId, priceDescription } = this.contentItemVariantForm.value;
      if (this.content === undefined) {
        this.content = [];
      }
      this.content.push({ languageId, priceDescription });
      this.submitEvent.emit(this.content);
    }
    this.contentItemVariantForm.reset();
  }

  publishContentItem() {
    this.translationPresent = false;
    if (!this.checkIfTranslationPresent(this.contentItemForm.value)) {
      const { languageId, name, shortDescription, longDescription } = this.contentItemForm.value;
      if (this.content === undefined) {
        this.content = [];
      }
      this.content.push({ languageId, name, shortDescription, longDescription });
      this.submitEvent.emit(this.content);
    }
    this.contentItemForm.reset();
  }

  getLanguageName(langId) {
    const lang = this.getLanguage(langId);
    return lang.name;
  }
  getLanguage(langId) {
    let i = 0;
    if (this.languagesList != null && this.languagesList !== undefined) {
      for (i = 0; i < this.languagesList.length; i++) {
        if (+langId === +this.languagesList[i].id) {
          return this.languagesList[i];
        }
      }
    }
    return langId;
  }

  deleteTranslation(translation: ContentItemModel) {
    this.content = this.content.filter((el) => {
      return el.languageId !== translation.languageId;
    });
    this.submitEvent.emit(this.content);
  }
  get name() {
    return this.contentItemForm.get('name');
  }

  get shortDescription() {
    return this.contentItemForm.get('shortDescription');
  }

  get longDescription() {
    return this.contentItemForm.get('longDescription');
  }

  get language() {
    return this.contentItemForm.get('language');
  }

  checkIfTranslationPresent(translation) {
    if (this.content === undefined) {
      this.content = [];
    }
    const selectedTranslation = this.content.filter((el) => {
      return +el.languageId === +translation.languageId;
    });
    if (selectedTranslation.length === 0 && +translation.languageId !== +this.storeDefaultLangId) {
      return false;
    } else {
      this.translationPresent = true;
      return true;
    }
  }

}
