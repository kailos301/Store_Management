import { getSelectedStore } from './../../+state/stores.selectors';
import { UpdateStoreSettings } from './../../+state/stores.actions';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StoresState } from './../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToggleSquare } from '../+state/payment.actions';

@Component({
    selector: 'app-store-payment-square',
    templateUrl: './store-payment-square.component.html',
    styleUrls: ['./store-payment-square.component.scss']
})
export class StorePaymentSquareComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject();
    squareForm: FormGroup;
    squareEnabled: boolean;

    constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

    ngOnInit(): void {

        this.squareForm = this.fb.group({
            SQUARE_APPLICATION_ID: ['', Validators.compose([Validators.maxLength(100)])],
            SQUARE_ACCESS_TOKEN: ['', Validators.compose([Validators.maxLength(100)])],
            SQUARE_LOCATION_ID: ['', Validators.compose([Validators.maxLength(100)])]
        }, { validator: this.requiredFieldsValidator() });

        this.store.pipe(
            select(getSelectedStore),
            filter(s => s && s.id !== -1),
            takeUntil(this.destroy$)
        ).subscribe(s => {
            this.squareForm.patchValue(s.settings, {emitEvent: false});
            this.squareEnabled = s.settings.PAYMENT_SQUARE_CREDIT_CARD_ENABLED;
        });

        this.squareForm.valueChanges.subscribe(v => {
            if (!v.SQUARE_ACCESS_TOKEN.trim() &&
                !v.SQUARE_APPLICATION_ID.trim() &&
                !v.SQUARE_LOCATION_ID.trim()
                ) {
                this.squareEnabled = false;
                this.toggleSquarePayments(false);
            }

        });

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    getControl(name: string) {
        return this.squareForm.get(name);
    }

    toggleSquarePayments(e) {
        // Do not enable square payments if no access token and application id defined
        if (this.squareForm.controls.SQUARE_ACCESS_TOKEN.value.trim().length === 0
            && this.squareForm.controls.SQUARE_APPLICATION_ID.value.trim().length === 0
            && e) {
            setTimeout(() => {
                this.squareEnabled = false;
            });
            return;
        }
        if (this.squareForm.valid) {
            const formData = this.squareForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings({PAYMENT_SQUARE_CREDIT_CARD_ENABLED: e, ...formData}));
        } else {
            setTimeout(() => {
                this.squareEnabled = false;
            });

        }
    }

    updateSettings() {
        if (this.squareForm.valid) {
            const formData = this.squareForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings(formData));
        }
    }

    requiredFieldsValidator(): ValidatorFn {

        return (control: AbstractControl): {[key: string]: any} | null => {
            const applicationId = control.get('SQUARE_APPLICATION_ID').value.trim();
            const accessToken = control.get('SQUARE_ACCESS_TOKEN').value.trim();
            const locationId = control.get('SQUARE_LOCATION_ID').value.trim();

            control.get('SQUARE_APPLICATION_ID').setErrors( {required: null} );
            control.get('SQUARE_APPLICATION_ID').updateValueAndValidity({emitEvent: false, onlySelf: true});
            control.get('SQUARE_ACCESS_TOKEN').setErrors( {required: null} );
            control.get('SQUARE_ACCESS_TOKEN').updateValueAndValidity({emitEvent: false, onlySelf: true});
            control.get('SQUARE_LOCATION_ID').setErrors( {required: null} );
            control.get('SQUARE_LOCATION_ID').updateValueAndValidity({emitEvent: false, onlySelf: true});

            if (!!applicationId || !!accessToken || !!locationId) {
                if (!applicationId) {
                    control.get('SQUARE_APPLICATION_ID').setErrors( {required: true} );
                }
                if (!accessToken) {
                    control.get('SQUARE_ACCESS_TOKEN').setErrors( {required: true} );
                }
                if (!locationId) {
                    control.get('SQUARE_LOCATION_ID').setErrors( {required: true} );
                }
            }

            return null;

        };

    }

}
