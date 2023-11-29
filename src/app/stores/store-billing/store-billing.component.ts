import { Component } from '@angular/core';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-store-billing',
  templateUrl: './store-billing.component.html',
  styleUrls: ['./store-billing.component.scss']
})
export class StoreBillingComponent {
  storeBillingHelpPage = helpPage.billing;
  constructor() { }

}
