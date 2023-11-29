import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Language } from 'src/app/api/types/Language';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { LanguageService } from 'src/app/shared/language.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() locale = new EventEmitter<{[key: string]: any}>();
  @Input() isSuccessPage = false;
  languagesList: Language[] = [];
  languageId: any;
  private destroy$ = new Subject();
  constructor(private referenceDataService: ReferenceDataService,
              private langLoader: LanguageService,
              private transServ: TranslateService) { }

  ngOnInit() {
    this.referenceDataService.getLanguages().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.languagesList = res.data.filter(language => language.covered_admin_ui === true);
      const langObj = this.languagesList.find(x => x.locale === this.langLoader.getAdminUiLang());
      if (this.transServ.currentLang) {
        const currUsedLang = this.languagesList.find(x => x.locale === this.transServ.currentLang);
        this.languageId = currUsedLang.id;
        this.locale.emit({ id: currUsedLang.id, locale: currUsedLang.locale });
      } else if (langObj) {
        this.languageId = langObj.id;
        this.locale.emit({ id: langObj.id, locale: langObj.locale });
      } else {
        const defLanu = this.languagesList.find(x => x.locale === 'en');
        this.languageId = defLanu.id;
        this.locale.emit({ id: defLanu.id, locale: defLanu.locale });
      }
    });
  }
  onLanguageChange($event) {
    const localeObj = this.languagesList.find(f => +f.id === +$event.value);
    this.locale.emit({ id: localeObj.id, locale: localeObj.locale });
  }
}
