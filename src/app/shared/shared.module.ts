import { ApiModule } from './../api/api.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagerComponent } from './pager/pager.component';
import { UserDetailsFormComponent } from './user-details-form/user-details-form.component';
import { DownloadDirective } from './download.directive';
import { EnumPipe } from './enum.pipe';
import { HighlightSearchPipe } from './highlight-search/highlights-search.pipe';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { DisableControlDirective } from './disable-control.directive';
import { LocalizedDatePipe } from './localized-date.pipe';
import { LocalizedCurrencyPipe } from './localized-currency.pipe';
import { FormatPrice } from './format-price.pipe';
import { HelpIconComponent } from './help-icon/help-icon.component';
import { PriceInputComponent } from './price-input/price-input.component';
import { PreventDoubleClickDirective } from './directives/prevent-double-click.directive';
import { NotificationSoundDirective } from './directives/notification-sound.directive';
import { NgxTrimDirective, NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MonthDatePickerComponent } from './month-date-picker/month-date-picker.component';
import { DayDatePickerComponent } from './day-date-picker/day-date-picker.component';
import { GoTimepickerComponent } from './go-timepicker/go-timepicker.component';
@NgModule({
  declarations: [
    PagerComponent, UserDetailsFormComponent, DownloadDirective, EnumPipe, HighlightSearchPipe,
    ImageUploadComponent, DisableControlDirective, LocalizedDatePipe, LocalizedCurrencyPipe,
    HelpIconComponent, FormatPrice, PriceInputComponent, PreventDoubleClickDirective,
    NotificationSoundDirective, MonthDatePickerComponent, DayDatePickerComponent, GoTimepickerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ApiModule,
    TranslateModule,
    NgxTrimDirectiveModule
  ],
  exports: [
    PagerComponent, UserDetailsFormComponent, DownloadDirective, EnumPipe, HighlightSearchPipe, ImageUploadComponent,
    TranslateModule, DisableControlDirective, LocalizedDatePipe, LocalizedCurrencyPipe,
    HelpIconComponent, FormatPrice, PriceInputComponent, PreventDoubleClickDirective,
    NotificationSoundDirective, NgxTrimDirective, MonthDatePickerComponent, DayDatePickerComponent, GoTimepickerComponent
  ]
})
export class SharedModule { }
