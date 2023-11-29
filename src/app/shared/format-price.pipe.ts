import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatPrice'})
export class FormatPrice implements PipeTransform {

  transform(price: number, langCode: string, currency: string, currencySymbol: string): string {
    if (langCode && currency) {
      return price.toLocaleString(langCode, {style: 'currency', currency, currencyDisplay: 'code'})
                  .replace(currency, currencySymbol);
    }
    return '';
  }
}
