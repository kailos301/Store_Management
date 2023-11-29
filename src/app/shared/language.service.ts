import { Injectable, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Lang } from '../stores/stores';
import { ReferenceDataService } from '../api/reference-data.service';
import { WindowRefService } from '../window.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  availableAdminLanguages: Lang[];
  lang: string = null;
  loadedLang: string = null;
  constructor(
      private translate: TranslateService
    , private route: ActivatedRoute
    , private windowService: WindowRefService
    , private referenceDataService: ReferenceDataService
    ) {
    this.route.queryParamMap.subscribe(p => {
      const qParams: any = {...p};
      this.lang = (qParams.params.lang && this.checkValidLangIso(qParams.params.lang.toLowerCase()))
                   ? qParams.params.lang.toLowerCase() : null;
    });
    this.referenceDataService.getLanguages()
        .subscribe(results => {
        // this.availableAdminLanguages =  this.getAvailableAdminLanguages(results.data);
        this.availableAdminLanguages =  results.data.filter(element => element.covered_admin_ui === true);
        this.loadLanguage(this.getAdminUiLang())
            .catch(_ => {
          this.loadedLang = 'en';
          this.loadLanguage('en');
        });
    });
  }

  checkValidLangIso(val: string) {
    const regex = new RegExp('^[a-z]{2,3}$');
    return regex.test(val);
  }

  // If the ui language of the browser exists in the admin language list
  // (which means there are some translations for this language)
  // then the system pre-selects this as admin ui language.
  // If not, falls back to default en language
  private getUserPreferedLangs() {
    let ret = [];
    if (this.windowService.nativeWindow.navigator.languages) {
      ret = this.windowService.nativeWindow.navigator.languages.map((lang) => lang.substring(0, 2));
    } else {
      ret = [this.translate.getBrowserLang()];
    }
    if (this.lang) {
      ret.unshift(this.lang);
    }
    return ret;
  }

  getAdminUiLang() {
    const preferedLanguages = this.getUserPreferedLangs().reverse();
    if (!this.availableAdminLanguages || this.availableAdminLanguages.length === 0) {
      return '';
    }
    let adminLang = this.availableAdminLanguages[0].locale;
    preferedLanguages.forEach(lang => {
      this.availableAdminLanguages.forEach(availableLang => {
        if (availableLang.locale === lang) {
          adminLang = lang;
        }
      });
    });
    return adminLang;
  }

  loadLanguage(locale) {
    return import(`./../../assets/translations/i18n/admin-translation.${locale}.json`)
    .then(lang => {
      this.loadedLang = locale;
      this.translate.setTranslation(locale, lang);
      this.translate.setDefaultLang(locale);
    });
  }
}
