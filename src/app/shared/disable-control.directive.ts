import { NgControl } from '@angular/forms';
import { Directive, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line
  selector: '[disableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    if (this.ngControl.control) {
      this.ngControl.control[action]();
    }
  }

  constructor( private ngControl: NgControl ) {
  }

}
