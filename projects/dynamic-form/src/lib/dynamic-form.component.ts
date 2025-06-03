import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  eDataType,
  IFieldDynamicForm,
  IFieldGroup,
} from './interfaces/fieldDynamicForm.interface';
import {
  FormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeyValue } from './interfaces';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { DynamicFormService } from './dynamic-form.service';
import { APP_DATE_FORMATS, AppDateAdapter } from './utils/date.adapter';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [
    DynamicFormService,
    {
      provide: DateAdapter,
      useClass: AppDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'es-ES',
    },
  ],
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fieldGroups!: IFieldGroup[];
  @Input() isModal: boolean = false;
  @Input() baseUrl!: string;
  @Input() resetFormTrigger!: boolean;
  @Input() isEdit: boolean = false;
  @Input() isReadonlyForm: boolean = false;

  @Output() changeValueSelected = new EventEmitter<{
    form: IFieldDynamicForm;
    value: any;
  }>();
  @Output() formValidityChange = new EventEmitter<boolean>();
  @Output() externalDependenciesValuesChanged = new EventEmitter<void>();

  form!: FormGroup;
  eDataType = eDataType;
  title: string = '';
  titleButton: string = 'Guardar';
  value!: string;
  selectedOption: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modal: MatDialogRef<any>,
    private dynamicFormService: DynamicFormService
  ) { }

  ngOnInit(): void {
    this.inizializarForm();
  }

  ngOnDestroy(): void {
    this.form.reset();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Detecta si el valor de resetFormTrigger cambia
    if (
      changes['resetFormTrigger'] &&
      changes['resetFormTrigger'].currentValue
    ) {
      this.form.reset(); // Resetea el formulario
    }
    // Detecta si el valor de baseUrl cambia
    if (
      changes['baseUrl'] &&
      changes['baseUrl'].currentValue
    ) {
      this.dynamicFormService.setBaseUrl(this.baseUrl);
    }
    // Detecta si el valor de isEdit cambia
    if (
      changes['isEdit'] &&
      changes['isEdit'].currentValue
    ) {
      this.dynamicFormService.setEditMode(this.isEdit);
    }
  }

  inizializarForm() {
    if (this.isReadonlyForm) {
      this.dynamicFormService.setReadonly(true);
    }
    // En el caso que se esta utilizando un formulario desde una modal MatDialog
    if (this.data?.dataForm) {
      this.fieldGroups = this.data.dataForm.fieldGroups;
      this.isModal = true;
      this.title = this.data.title;
      this.titleButton = this.data.dataForm.titleButtonAcceptForm;
      if (this.data.dataForm.baseUrl) {
        this.dynamicFormService.setBaseUrl(this.data.dataForm.baseUrl);
        this.baseUrl = this.data.dataForm.baseUrl;
      }
      if (this.data.dataForm.form) {
        this.form = this.data.dataForm.form;
      }
      if (this.data.dataForm.edit) {
        this.isEdit = this.data.dataForm.edit;
        this.dynamicFormService.setEditMode(this.data.dataForm.edit);
      }
    }

    // Inicializa el formulario
    if (this.fieldGroups) {
      this.form = this.dynamicFormService.functionInitComponent(
        this.fieldGroups,
        this.form
      );

      // Manejar campos con dependencias externas
      this.fieldGroups.forEach((group) => {
        group.fields.forEach((field) => {
          if (field.externalDependencies) {
            this.handleExternalDependencies(field);
          }
        });
      });
    }

    // Emito la validacion actual del form
    this.formValidityChange.emit(this.form.valid);

    // Escucha los cambios de estado del formulario y emite el resultado
    this.form.statusChanges.subscribe(() => {
      this.formValidityChange.emit(this.form.valid);
    });
  }

  /**
   * Método para manejar dependencias externas.
   */
  handleExternalDependencies(field: IFieldDynamicForm) {
    const control = this.form.get(field.name);
    // Llamamos al servicio
    const checkDependencies = this.dynamicFormService.handleExternalDependenciesService(
      field,
      control!
    );

    // Suscribimos el EventEmitter para volver a verificar las dependencias
    // cuando cambien los valores externos
    this.externalDependenciesValuesChanged.subscribe(() => {
      checkDependencies?.();
    });
  }

  // Método para actualizar las dependencias externas
  updateExternalDependencies(values: { [key: string]: any }) {
    // Actualizas la variable en el servicio
    this.dynamicFormService.setExternalDependenciesValues(values);

    // Emite el evento si deseas que otros sitios en el componente reaccionen
    this.externalDependenciesValuesChanged.emit();
  }

  // Método para actualizar el valor de un campo del formulario
  updateFormField(fieldName: string, value: any): void {
    if (this.form && this.form.controls[fieldName]) {
      this.form.controls[fieldName].setValue(value);
    }
  }

  /**
   * Función pública para deshabilitar un campo específico
   * @param fieldName Nombre del campo a deshabilitar
   */
  public disableField(fieldName: string): void {
    const control = this.form.get(fieldName);
    if (control) {
      control.disable();
    } else {
      console.warn(`El campo con nombre "${fieldName}" no existe en el formulario.`);
    }
  }

  /**
   * Función pública para habilitar un campo específico
   * @param fieldName Nombre del campo a habilitar
   */
  public enableField(fieldName: string): void {
    const control = this.form.get(fieldName);
    if (control) {
      control.enable();
    } else {
      console.warn(`El campo con nombre "${fieldName}" no existe en el formulario.`);
    }
  }

  public removeExternalDependency(key: string): void {
    this.dynamicFormService.removeExternalDependency(key);
    this.externalDependenciesValuesChanged.emit();
  }

  public refreshDependentFields(): void {
    // Emit the event to refresh dependencies
    this.externalDependenciesValuesChanged.emit();
  }

  public simulateFieldChange(fieldName: string): void {
    const control = this.form.get(fieldName);
    if (control) {
      const currentValue = control.value;
      control.setValue(currentValue);
    }
  }

  public getFormFieldValue(fieldName: string): any {
    return this.form.get(fieldName)?.value;
  }

  onSubmit() {
    let listadoFormGet: KeyValue = this.dynamicFormService.functionGetFormValue(
      this.form,
      this.fieldGroups
    );
    this.modal.close(listadoFormGet);
  }

  emitEvent(nameForm: IFieldDynamicForm, event?: any) {
    let value: any;
    value = this.form.get(nameForm.name!)?.value;

    if (event) {
      value = event.value;
    }
    this.changeValueSelected.emit({ form: nameForm, value: value });
  }

  getForm(): FormGroup<any> {
    return this.form;
  }

  getErrorMessage(fieldName: string): string | null {
    const control = this.form.get(fieldName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('min')) {
      return `El valor debe ser mayor o igual a ${control.getError('min').min}`;
    }
    if (control?.hasError('max')) {
      return `El valor debe ser menor o igual a ${control.getError('max').max}`;
    }
    if (control?.hasError('email')) {
      return 'Debe ser un correo electrónico válido';
    }
    if (control?.hasError('pattern')) {
      return 'El formato no es válido';
    }
    if (control?.hasError('minlength')) {
      return `Debe tener al menos ${control.getError('minlength').requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Debe tener como máximo ${control.getError('maxlength').requiredLength} caracteres`;
    }

    // Agrega más validaciones según sea necesario
    return null;
  }

  getGridColumns(columnCount: number): string {
    return `repeat(${columnCount || 1}, 1fr)`;
  }

  getColSpanClass(colspan: number | undefined): string {
    return colspan ? `col-span-${colspan}` : 'col-span-1';
  }
}
