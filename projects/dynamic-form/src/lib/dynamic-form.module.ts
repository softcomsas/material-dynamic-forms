import { NgModule } from '@angular/core';
import { DynamicFormComponent } from './dynamic-form.component';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [
    DynamicFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MultiSelectModule,
    DropdownModule,
    AutoCompleteModule
  ],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // Registrar el set de íconos de Material (por ejemplo, Google Material Icons)
    this.matIconRegistry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'https://fonts.googleapis.com/icon?family=Material+Icons'
      )
    );
  }
}
