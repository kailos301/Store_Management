import { Component, OnInit, OnDestroy, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Language } from 'src/app/api/types/Language';
import { ContentItemModel, TranslationDialogData } from '../stores-catalog';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClientStore } from '../../stores';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { MatDialog } from '@angular/material/dialog';
import { TranslationComponent } from '../overlay/translation/translation.component';

@Component({
  selector: 'app-content-translation',
  templateUrl: './content-translation.component.html',
  styleUrls: ['./content-translation.component.scss']
})
export class ContentTranslationComponent implements OnInit, OnDestroy {

  @Input() content: ContentItemModel[];
  @Input() mode: string;
  @Output() submitEvent = new EventEmitter<ContentItemModel[]>();
  store$: Observable<ClientStore>;
  storeDefaultLangId: number;
  contentItemForm: FormGroup;
  private destroy$ = new Subject();
  languagesList: Language[];
  displayedColumns: string[] = ['language', 'name', 'shortDescription', 'edit'];
  variantColumns: string[] = ['language', 'priceDescription', 'edit'];
  translationPresent = false;

  constructor(private referenceDataService: ReferenceDataService, private store: Store<StoresState>, public dialog: MatDialog) { }

  ngOnInit() {

    this.store$ = this.store.pipe(
      select(getSelectedStore), tap(data => { this.storeDefaultLangId = data.language.id; })
    );

    this.referenceDataService.getLanguages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.languagesList =  results.data;
      });
    if (this.content === undefined) {
        this.content = [];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLanguageName(langId) {
    const lang = this.getLanguage(langId);
    return lang.name;
  }

  getLanguage(langId) {
    let i = 0;
    if (this.languagesList != null) {
      for (i = 0; i < this.languagesList.length; i++) {
        if (langId === this.languagesList[i].id) {
          return this.languagesList[i];
        }
      }
    }
    return langId;
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

  addTranslation() {
    this.translationPresent = false;
    const inputData: TranslationDialogData = { languageList: this.languagesList, translation: null, mode: 'CREATE', source: this.mode };
    const dialogRef = this.dialog.open(TranslationComponent, {
      width: '70%',
      data: inputData,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (!this.checkIfTranslationPresent(result.value)) {
          this.content = this.content.concat({...result.value, languageId: +result.value.languageId});
          this.submitEvent.emit(this.content);
        }
      }
    });
  }

  deleteTranslation(translation: ContentItemModel) {
    this.content = this.content.filter((el) => {
      return el.languageId !== translation.languageId;
    });
    this.submitEvent.emit(this.content);
  }

  editTranslation(translation: ContentItemModel) {
    this.translationPresent = false;
    const inputData: TranslationDialogData = { languageList: this.languagesList, translation, mode: 'EDIT', source: this.mode };
    const dialogRef = this.dialog.open(TranslationComponent, {
      width: '70%',
      data: inputData,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action === 'DELETE') {
          this.deleteTranslation(result.formData.value);
        } else {
          this.content = this.content.filter((el) => {
            return el.languageId !== translation.languageId;
          });
          this.content = this.content.concat(result.value);
          this.submitEvent.emit(this.content);
        }
      }
    });
  }
}
