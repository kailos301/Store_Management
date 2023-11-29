import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightSearch',
})
export class HighlightSearchPipe implements PipeTransform {
  transform(value: string, args: any): any {
    if (!args) {
      return value;
    }
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    const isSpecialChar = format.test(args);

    if (isSpecialChar) {
      args = this.escapeRegExp(args);
    }

    const regex = new RegExp(args, 'i');
    const match = value.match(regex);

    if (!match) {
      return value;
    }

    return value.replace(regex, `<span class='highlight-search'>${match[0]}</span>`);
  }

  escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); // replace special char by escape sequence
  }
}
