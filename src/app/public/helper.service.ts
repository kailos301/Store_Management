import { Injectable, ElementRef, Inject } from '@angular/core';
import { ClientStore } from '../stores/stores';
import { Store } from '@ngrx/store';
import { ErrorMessage } from './store/+state/stores.actions';
import { Subject } from 'rxjs';
import { WINDOW } from './window-providers';
import { DOCUMENT } from '@angular/common';
import { LocalStorageService } from 'src/app/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private storageService: LocalStorageService,
    private store: Store<any>,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any
  ) { }

  formatText(content: string): string {
    const regex = new RegExp(
      // protocol part(optional)
      '(([\\w]+:)?\/\/)?' +
      // email address local part(optional)
      '(' +
      '([\\d\\w]|%[a-f\\d]{2,2})+' +
      '(:([\\d\\w]|%[a-f\\d]{2,2})+)?' +
      '@' +
      ')?' +
      // domain part
      '([\\d\\w][-\\d\\w]{0,253}[\\d\\w]\\.)+' +
      '[\\w]{2,63}' +
      // port number part(optional)
      '(:[\\d]+)?' +
      // path part(optional)
      '(\/([-+_~.\\d\\w]|%[a-f\\d]{2,2})*)*' +
      // hash and query param part(optional)
      '(' +
      // allow query param after hash(optional) (extral requirement)
      '(#(\/?[-+_~.\\d\\w]|%[a-f\\d]{2,2})*)(\\?(&?([-+_~.\\d\\w]|%[a-f\\d]{2,2})[=]?)*)' +
      '|' +
      // query param part(optional)
      '(\\?(&?([-+_~.\\d\\w]|%[a-f\\d]{2,2})[=]?)*)?' +
      // hash part(optional)
      '(#(\/?[-+_~.\\d\\w]|%[a-f\\d]{2,2})*)?' +
      ')',
      'ig'
    );
    let result = content.replace(regex, (url) => {
      return '<a href="' + url + '">' + url + '</a>';
    });
    const boldStrings = result.split('**');
    result = boldStrings.map((str, index) => {
      if (index % 2 && index !== boldStrings.length - 1) {
        return '<b>' + str + '</b>';
      }
      return str;
    }).join('');
    const italicStrings = result.split('__');
    result = italicStrings.map((str, index) => {
      if (index % 2 && index !== boldStrings.length - 1) {
        return '<i>' + str + '</i>';
      }
      return str;
    }).join('');
    return result;
  }

  getExcerpt(content: string, numOfChars: number) {
    if (!content || content.length === 0) {
      return {
        excerpt: '',
        reminder: ''
      };
    }
    if (content.length < numOfChars) {
      return {
        excerpt: this.formatText(content.replace(/(\r\n|\n|\r)/gm, '<br>')),
        reminder: ''
      };
    }
    let excerptCont = content.substr(0, numOfChars);

    // re-trim if we are in the middle of a word
    excerptCont = excerptCont.substr(
      0,
      Math.min(
        excerptCont.length,
        excerptCont.lastIndexOf(' ') ? excerptCont.lastIndexOf(' ') : excerptCont.length,
      )
    );
    return {
      excerpt: this.formatText(excerptCont.replace(/(\r\n|\n|\r)/gm, '<br>')),
      reminder: this.formatText(content.substring(excerptCont.length).replace(/(\r\n|\n|\r)/gm, '<br>')),
    };
  }

  checkLocationInputValidity(value, min = 0, max = 0) {
    if (min !== 0 && max !== 0) {
      const regex = new RegExp('^([a-z0-9-_ ]){' + min + ',' + max + '}$', 'i');
      return regex.test(value);
    }
    return /^([a-z0-9-_ ]){1,10}$/i.test(value);
  }

  // not in use anymore
  // it will trunn a string into acceptable slug
  slugify(val: string) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return val.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * check if the value passed is valid language two or three letter iso
   * @param val string, language two or three letter iso
   */
  checkValidLangIso(val: string) {
    const regex = new RegExp('^[a-z]{2,3}$');
    return regex.test(val);
  }

  scrollCalc(el: ElementRef = null) {
    if (el != null) {
      if (el.nativeElement.offsetHeight + el.nativeElement.scrollTop >= el.nativeElement.scrollHeight
        || (!el.nativeElement.scrollTop && el.nativeElement.offsetHeight === el.nativeElement.scrollHeight)) {
        return false;
      } else {
        return true;
      }
    } else {
      const h = this.window.innerHeight || this.document.documentElement.clientHeight || this.document.body.clientHeight;
      if (this.window.scrollY + h >= this.document.body.scrollHeight) {
        return false;
      } else {
        return true;
      }
    }
  }
  scrollShowElement(el: ElementRef) {
    if (!el) {
      return false;
    }
    const elPos = el.nativeElement.offsetTop + el.nativeElement.offsetHeight;
    if (this.window.scrollY > elPos) {
      return true;
    } else {
      return false;
    }
  }
  scrollPage(el: ElementRef = null) {
    const subject: Subject<any> = new Subject<any>();
    this.doScrolling(el, 300, 50, false, 'down', subject);
  }

  scrollTo(offsetTop: number, scrollSpeed = 700, el: ElementRef = null) {
    const subject: Subject<any> = new Subject<any>();
    this.doScrolling(el, scrollSpeed, offsetTop, true, 'down', subject);
  }

  doScrolling(el, duration, scrollBy, fromTop, direction, subject: Subject<any>) {
    const w = this.window;
    let startingY = 0;
    let currentY = 0;
    if (el != null) {
      startingY = currentY = el.nativeElement.scrollTop;
    } else {
      startingY = currentY = w.scrollY;
    }
    if (fromTop) {
      scrollBy = scrollBy - startingY;
      if (scrollBy === currentY) {
        return;
      }
    }
    let start;

    w.requestAnimationFrame(function step(timestamp) {
      start = (!start) ? timestamp : start;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      if (el != null) {
        (direction === 'down') ? el.nativeElement.scrollTop = startingY + Math.floor(scrollBy * percent)
          : el.nativeElement.scrollTop = startingY - Math.floor(scrollBy * percent);
      } else {
        (direction === 'down') ? w.scroll(0, startingY + Math.floor(scrollBy * percent))
          : w.scroll(0, startingY - Math.floor(scrollBy * percent));
      }

      if (time < duration) {
        w.requestAnimationFrame(step);
        subject.next({});
      } else {
        subject.complete();
      }
    });
  }

  focusTextArea(element) {
    if (element.children[0].nodeName === 'TEXTAREA') {
      element.children[0].focus();
      if (this.isAndroid()) {
        setTimeout(() => {
          element.children[0].scrollIntoView();
        }, 300);
      }
    }
  }

  isAndroid() {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return false;
    }
    if (/android/i.test(userAgent)) {
      return true;
    }
    return false;
  }

  isIOS() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('ipad') > -1 || ua.indexOf('iphone') > -1 ||  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  calcInnerHeight() {
    const lgWidth = 992;
    const headerHeightWithoutSidebar = 100;
    const headerHeightWithSidebar = 120;
    if (this.window.innerWidth < lgWidth) {
      return this.window.innerHeight - headerHeightWithoutSidebar;
    }
    return this.window.innerHeight - headerHeightWithSidebar;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  generateDeviceID() {
    const pattern = [8, 4, 4, 4, 12];
    const chars = 'abcdef';
    return pattern
      .map((len) => {
        return Array(len)
          .fill(0)
          .map(() => {
            const i = this.getRandomInt(16);
            return i < 10 ? i.toString() : chars[i - 10];
          })
          .join('');
      })
      .join('-');
  }

  getDeviceID() {
    let deviceID = this.storageService.getSavedState('deviceID');
    if (!deviceID) {
      deviceID = this.generateDeviceID();
      this.storageService.setSavedState(deviceID, 'deviceID');
    }
    return deviceID;
  }

}
