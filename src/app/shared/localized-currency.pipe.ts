import { Pipe, PipeTransform } from '@angular/core';
import { registerLocaleData, DatePipe, CurrencyPipe } from '@angular/common';
import { of, from } from 'rxjs';

@Pipe({ name: 'localizedCurrency' })
export class LocalizedCurrencyPipe implements PipeTransform {
  defaultLocale = 'en';

  transform(value: any, currencyCode: string, locale: string) {
    if (!value || !locale) {
      return of('');
    }

    return from(this.loadLocale(value, currencyCode, locale)
      .catch(_ => this.loadLocale(value, currencyCode, locale.split('-')[0]))
      .catch(_ => this.loadLocale(value, currencyCode, this.defaultLocale))
    );

  }

  private loadLocale(value, currencyCode, locale) {
    const currencyPipe = new CurrencyPipe(locale);
    return import(`@angular/common/locales/${locale}.js`)
    .then(lang => {
      registerLocaleData(lang.default);
      return currencyPipe.transform(value, currencyCode, 'symbol', '', locale);
    });
  }

}
