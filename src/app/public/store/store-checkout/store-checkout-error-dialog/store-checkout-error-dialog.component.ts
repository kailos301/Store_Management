import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleOrderSubmitError } from '../../+state/stores.actions';
import { getCheckoutState } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-checkout-error-dialog',
  templateUrl: './store-checkout-error-dialog.component.html',
  styleUrls: ['./store-checkout-error-dialog.component.scss']
})
export class StoreCheckoutErrorDialogComponent implements OnInit, OnDestroy {

  @ViewChild('errorDialog', { static: true }) errorDialog: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  errors = [];

  constructor(private renderer: Renderer2, private store: Store<any>) { }

  ngOnInit() {
    this.store.select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        if (d.checkoutState.data.orderSubmitError.visible) {
          this.errors = d.checkoutState.data.orderSubmitError.errors;
          this.openErrorDialog();
        } else {
          this.closeErrorDialog();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismissErrorDialog() {
    this.store.dispatch(new ToggleOrderSubmitError(false));
  }

  openErrorDialog() {
    this.renderer.removeClass(this.errorDialog.nativeElement, 'hide');
  }

  private closeErrorDialog() {
    this.renderer.addClass(this.errorDialog.nativeElement, 'hide');
  }

}
