import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatChipsModule} from '@angular/material/chips';


const MaterialModules = [
  MatPaginatorModule,
  MatTableModule,
  MatSortModule,
  MatCheckboxModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatTooltipModule,
  MatSelectModule,
  MatButtonToggleModule,
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  MatSnackBarModule,
  MatCardModule,
  MatListModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSidenavModule,
  MatBadgeModule,
  MatRippleModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatRadioModule,
  MatDividerModule,
  MatProgressBarModule,
  MatTabsModule,
  MatProgressSpinnerModule,
  MatGridListModule,
  MatChipsModule
];

@NgModule({
  imports: [MaterialModules],
  exports: [MaterialModules]
})
export class MaterialModule { }
