import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error.component';
import { Error500Component } from './error500.component';
import { SharedModule } from '../shared/shared.module';
import { LanguageService } from '../shared/language.service';



@NgModule({
  declarations: [ErrorComponent, Error500Component],
  imports: [
    CommonModule, SharedModule
  ],
  exports: [ErrorComponent, Error500Component],
  providers: [LanguageService]
})
export class ErrorModule { }
