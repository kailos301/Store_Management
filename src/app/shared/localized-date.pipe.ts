import { Pipe, PipeTransform } from '@angular/core';
import { of, from } from 'rxjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

@Pipe({ name: 'localizedDate' })
export class LocalizedDatePipe implements PipeTransform {
  defaultLocale = 'en';

  /**
   * Using day.js library to render dates in localized format
   * @param value date value to diplay
   * @param pattern pattern for date diplay. Details here https://day.js.org/docs/en/display/format
   * @param locale locale to diplay date in. Format ex. 'en-GB' or plain 'en'.
   * @param tz timezone information, when empty will get user's browser timezone
   */
  transform(value: string, pattern: string, locale: string, tz = '') {
    if (!value || !locale || !tz) {
      return of('');
    }
    return from(this.loadLocale(value, pattern, locale.toLowerCase(), tz)
      .catch(_ => this.loadLocale(value, pattern, locale.split('-')[0], tz))
      .catch(_ => this.loadLocale(value, pattern, this.defaultLocale, tz))
    );

  }

  private loadLocale(value, pattern, locale, tz) {
    return import(`dayjs/locale/${locale}`)
    .then(() => {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(customParseFormat);

      // Here we have an issue with dayjs when timezone and locale are used together
      // Check here for more details. https://github.com/iamkun/dayjs/issues/1219
      // To bypass this we first move the date to appropriate timezone, and format it as string
      // Then we parse the string and localize it appropriately.
      // In the end we just return the formatted date as requested.
      const daysjsVal = dayjs(value).format('YYYY-MM-DD HH:mm');

      return dayjs(daysjsVal, 'YYYY-MM-DD HH:mm').locale(locale).format(pattern);
    });
  }

}

