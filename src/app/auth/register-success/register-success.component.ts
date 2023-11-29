import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
@Component({
  selector: 'app-register-success',
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.scss']
})

export class RegisterSuccessComponent implements OnInit {


  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

  onLocaleChange(e) {
    this.translate.use(e.locale);
  }
}
