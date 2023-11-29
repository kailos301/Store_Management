import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleSameDayOrderingDisabled } from '../../+state/stores.actions';
import { getCheckoutState } from '../../+state/stores.selectors';
import { SameDayOrderingError } from '../../types/SameDayOrderingError';

@Component({
  selector: 'app-same-day-ordering-dialog',
  templateUrl: './same-day-ordering-dialog.component.html',
  styleUrls: ['./same-day-ordering-dialog.component.scss']
})
export class SameDayOrderingDialogComponent implements OnInit, OnDestroy {

  @ViewChild('errorsDialog', { static: true }) errorsDialog: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  sameDayOrderingErrors: SameDayOrderingError[];

  constructor(private renderer: Renderer2, private store: Store<any>) { }

  ngOnInit() {
    this.store.select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        this.sameDayOrderingErrors = d.checkoutState.data.sameDayOrderingErrors.errors;
        if (d.checkoutState.data.sameDayOrderingErrors.visible) {
          this.openErrorsDialog();
        } else {
          this.closeErrorsDialog();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismissErrorsDialog() {
    this.store.dispatch(new ToggleSameDayOrderingDisabled(false));
  }

  openErrorsDialog() {
    this.renderer.removeClass(this.errorsDialog.nativeElement, 'hide');
  }

  private closeErrorsDialog() {
    this.renderer.addClass(this.errorsDialog.nativeElement, 'hide');
  }

}
