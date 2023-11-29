import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreOrderingRulesRoutingModule } from './store-ordering-rules-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoreOrderingRulesViewComponent } from './store-ordering-rules-view/store-ordering-rules-view.component';
import { StoreOrderingRulesComponent } from './store-ordering-rules.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { RuleOptionComponent } from './rule-option/rule-option.component';
import { RuleOptionGroupComponent } from './rule-option-group/rule-option-group.component';
import { StoreCatalogModule } from '../store-catalog/store-catalog.module';
import { StoreModule } from '@ngrx/store';
import { orderingRuleInitialState, storesOrderingRuleReducer } from './+state/store-ordering-rules.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoresEffects } from './+state/store-ordering-rules.effets';


@NgModule({
  declarations: [StoreOrderingRulesViewComponent, StoreOrderingRulesComponent, RuleOptionGroupComponent, RuleOptionComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    DragDropModule,
    MatSelectModule,
    MatListModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
    MatTableModule,
    TimepickerModule.forRoot(),
    MatCheckboxModule,
    StoreModule.forFeature('orderingRule', storesOrderingRuleReducer, { initialState: orderingRuleInitialState }),
    EffectsModule.forFeature([StoresEffects]),
    // Order of the below 2 module imports is important,
    // otherwise catalog routing rules will be executed instead of ordering rules routing ones
    StoreOrderingRulesRoutingModule,
    StoreCatalogModule
  ]
})
export class StoreOrderingRulesModule { }
