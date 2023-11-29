import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { CatalogState } from 'src/app/public/store/+state/stores.reducer';
import { ImportCatalog } from '../+state/stores-catalog.actions';

@Component({
  selector: 'app-catalog-link',
  templateUrl: './catalog-link.component.html',
  styleUrls: ['./catalog-link.component.scss']
})
export class CatalogLinkComponent implements OnInit, OnDestroy {
  catalogImportForm: FormGroup;
  storeId: any;
  private destroyed$ = new Subject();
  foodyLink: any;
  woltLink: any;

  constructor(
    private actRoute: ActivatedRoute,
    private fb: FormBuilder,
    private catalog: Store<CatalogState>,
  ) {
    this.foodyLink = 'https://foody.com.cy/';
    this.woltLink = "https://wolt.com/";
  }

  ngOnInit(): void {
    const params = this.actRoute.params as any;
    this.storeId = params._value.id;

    this.catalogImportForm = this.fb.group({
      externalDomain: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      externalReference: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100)
        ])
      ]
    });

    this.catalogImportForm.get('externalDomain').valueChanges.subscribe(v => {
      if (v && v.length > 0) {
        if (v == "FOOD.CY")
          this.catalogImportForm.get('externalReference').setValue(this.foodyLink);
        else if (v == "WOLT.COM")
        this.catalogImportForm.get('externalReference').setValue(this.woltLink);
      }
      else {
        this.catalogImportForm.get('externalReference').setValue('');
      }
    });
  }

  getControl(name: string) {
    return this.catalogImportForm.get(name);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  importCatalog() {
    this.catalogImportForm.markAllAsTouched();
    if (this.catalogImportForm.valid) {
      this.catalog.dispatch(new ImportCatalog(this.catalogImportForm.getRawValue(), this.storeId));
    }
  }

}
