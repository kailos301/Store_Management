import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { OrderMetaData, Cart, OrderMetaState } from '../../+state/stores.reducer';
import { Store } from '@ngrx/store';
import { getCurrentOrderMetaState } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { AddOrderMeta } from '../../+state/stores.actions';
import { HelperService } from 'src/app/public/helper.service';

@Component({
  selector: 'app-store-checkout-special-note',
  templateUrl: './store-checkout-special-note.component.html',
  styleUrls: ['./store-checkout-special-note.component.scss']
})
export class StoreCheckoutSpecialNoteComponent implements OnInit, OnDestroy {

  specialNoteFg: FormGroup;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  constructor(  private fb: FormBuilder
              , private store: Store<Cart>
              , public helper: HelperService
             ) { }

  ngOnInit() {

    // get order meta data
    this.store.select(getCurrentOrderMetaState)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
      if (d) {
          this.orderMetaData  = d;
          if (this.specialNoteFg) {
            this.specialNoteFg.patchValue({specialNote: d.data.comment || ''});
          }
      }
    });

    // set form validation rules:
    this.specialNoteFg = this.fb.group({
      specialNote: [(this.orderMetaData && this.orderMetaData.data.comment)
                    ? this.orderMetaData.data.comment
                    : '' ,  Validators.compose([Validators.maxLength(256)])],
    });

  } // EOF: ngOnInit

  getControl(name: string, form: string = 'specialNoteFg') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  addOrderMeta(metaKey, control, formGroup = '') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
