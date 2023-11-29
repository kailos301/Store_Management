import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-partner-program',
  templateUrl: './partner-program.component.html',
  styleUrls: ['./partner-program.component.scss']
})
export class PartnerProgramComponent implements OnInit {

  defaultUrl = '/manager/user/partner';
  isActive = false;
  partnerProgramHelpPage = helpPage.partner;

  constructor(private router: Router) { }
  ngOnInit() {
    this.isActive = (this.defaultUrl === this.router.url);
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.isActive = (val.url === this.defaultUrl);
      }
    });
  }
}
