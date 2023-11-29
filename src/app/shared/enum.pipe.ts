import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'enumValue' })
export class EnumPipe implements PipeTransform {
  transform(value: string): string {
        if (!value) { return ''; }

        const wordsRegex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;
        const v = value.replace('_', ' ');
        return this.toCamelCase(v.match(wordsRegex));
    }

    private toCamelCase(str: string[]) {
        return str.map((s) => {
            const lowercaseValue = s.toLowerCase();
            return lowercaseValue.substr(0, 1).toUpperCase() + lowercaseValue.substr(1);
        }).join(' ');
    }
}

