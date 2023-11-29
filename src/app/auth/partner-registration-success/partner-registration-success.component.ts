import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
@Component({
  selector: 'app-partner-registration-success',
  templateUrl: './partner-registration-success.component.html',
  styleUrls: ['./partner-registration-success.component.scss']
})
export class PartnerRegistrationSuccessComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  onLocaleChange(e) {
    this.translate.use(e.locale);
  }


  ngOnInit() {
  }
}
