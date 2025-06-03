import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  IFieldGroup,
  IFieldDynamicForm,
  eDataType,
  KeyValue,
  ObjectKeyValue,
  eTypeMOdel,
} from './interfaces';
import { getValueFromProperty, transformToObject } from './functions/functions';

@Injectable()
export class DynamicFormService {
  private baseUrl: string = '';

  // Agregamos esta variable para almacenar los valores externos
  private externalDependenciesValues: { [key: string]: any } = {};

  // Declarar formGroupControls como propiedad
  private formGroupControls: { [key: string]: AbstractControl } = {};

  // Variable para manejar el modo de edición
  private isEditMode: boolean = false;

  private isReadonly: boolean = false; // Add readonly flag

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  // Método para establecer el modo de edición
  public setEditMode(isEdit: boolean): void {
    this.isEditMode = isEdit;
  }

  // Add method to set readonly
  public setReadonly(isReadonly: boolean): void {
    this.isReadonly = isReadonly;
  }

  // Permite setear/actualizar los valores externos desde el componente
  public setExternalDependenciesValues(values: { [key: string]: any }): void {
    this.externalDependenciesValues = {
      ...this.externalDependenciesValues,
      ...values,
    };
  }

  public removeExternalDependency(key: string): void {
    if (this.externalDependenciesValues.hasOwnProperty(key)) {
      delete this.externalDependenciesValues[key];
    }
  }

  functionInitComponent(
    fieldGroupsDynamicForm: IFieldGroup[],
    form: FormGroup
  ): FormGroup {
    this.formGroupControls = {};
    let isRangeValidator: boolean = false;

    const initializeControl = (field: IFieldDynamicForm) => {
      const initialValue =
        field.value !== undefined
          ? field.value
          : field.type === eDataType.select_chips
            ? []
            : '';
      const validators = this.isReadonly ? [] : field.validation || [];
      const isDisabled =
        this.isReadonly || !!field.dependency || field.disabled;
      return this.fb.control(
        { value: initialValue, disabled: isDisabled },
        validators
      );
    };

    const handleDependenciesValue = (
      field: IFieldDynamicForm,
      control: any
    ) => {
      if (!field.valueDependency && !field.valueExcludeDependency) {
        return;
      }

      const updateField = () => {
        const depValue = field.valueDependency
          ? this.formGroupControls[field.valueDependency.dependency] &&
          this.formGroupControls[field.valueDependency.dependency].value
          : field.valueExcludeDependency
            ? this.formGroupControls[field.valueExcludeDependency.dependency] &&
            this.formGroupControls[field.valueExcludeDependency.dependency]
              .value
            : undefined;
        const valueComparar = field.valueDependency
          ? field.valueDependency.valueDep
          : field.valueExcludeDependency
            ? field.valueExcludeDependency.valueDep
            : undefined;

        if (field.valueDependency && depValue === valueComparar) {
          control.enable();
          control.clearValidators();
          control.setValidators(field.valueDependency.validation ?? []);
          control.updateValueAndValidity();
        } else if (field.valueExcludeDependency && depValue !== valueComparar) {
          control.enable();
          control.clearValidators();
          control.setValidators(field.valueExcludeDependency.validation ?? []);
          control.updateValueAndValidity();
        } else {
          control.disable();
          control.reset();
          control.clearValidators();
          control.updateValueAndValidity();
        }
      };

      if (field.valueDependency) {
        this.formGroupControls[
          field.valueDependency.dependency
        ].valueChanges.subscribe(updateField);
      } else if (field.valueExcludeDependency) {
        this.formGroupControls[
          field.valueExcludeDependency.dependency
        ].valueChanges.subscribe(updateField);
      }

      updateField();
    };

    const handleDependencies = (field: IFieldDynamicForm, control: any) => {
      if (!field.dependency) {
        return;
      }

      const dependencyFields = field.dependency.split(',');
      dependencyFields.forEach((depField) => {
        if (!this.formGroupControls[depField]) {
          this.formGroupControls[depField] = this.fb.control(
            '',
            Validators.required
          );
        }
      });

      const updateField = () => {
        if (
          (field.valueDependency || field.valueExcludeDependency) &&
          control.disabled
        ) {
          return;
        }

        const allDependenciesFilled = dependencyFields.every(
          (depField) =>
            this.formGroupControls[depField] &&
            this.formGroupControls[depField]?.value
        );

        if (allDependenciesFilled) {
          const dependencyValue =
            this.formGroupControls[dependencyFields[0]].value;

          if (
            !field.valueDependency &&
            !field.valueExcludeDependency &&
            field.disabled
          ) {
            control.disable();
          } else {
            control.enable();
          }
          if (!this.isEditMode) control.reset();

          // Verificar si hay dependencias externas
          const hasExternalDeps =
            field.externalDependencies && field.externalDependencies.length > 0;

          // Aquí se unifica la lógica de obtención de datos
          if (field.apiUrl && dependencyValue) {
            this.fetchOptions(field, dependencyValue, hasExternalDeps);
          }
        } else {
          control.reset();
          field.options = [];
          if (!field.valueDependency && !field.valueExcludeDependency) {
            control.disable();
          }
        }
      };

      dependencyFields.forEach((depField) => {
        this.formGroupControls[depField].valueChanges.subscribe(updateField);
      });

      updateField();
    };

    const handleDynamicDateConstraints = (
      field: IFieldDynamicForm,
      control: any
    ) => {
      if (!field.dateDependency || (!field.minDateFn && !field.maxDateFn)) {
        return;
      }

      const dependencyField = this.formGroupControls[field.dateDependency];
      if (!dependencyField) {
        console.error(
          `El campo de dependencia ${field.dateDependency} no existe.`
        );
        return;
      }

      const updateConstraints = () => {
        const dependencyValue: Date | null = dependencyField.value
          ? new Date(dependencyField.value)
          : null;

        if (dependencyValue) {
          // Asegurarse de que la hora sea 00:00:00
          dependencyValue.setHours(0, 0, 0, 0);
        }

        if (field.minDateFn && dependencyValue) {
          const calculatedMinDate = field.minDateFn(dependencyValue);
          field.minDate = calculatedMinDate;
          control.setValidators([
            ...(control.validator ? [control.validator] : []),
            Validators.min(calculatedMinDate.getTime()),
          ]);
        }

        if (field.maxDateFn && dependencyValue) {
          const calculatedMaxDate = field.maxDateFn(dependencyValue);
          field.maxDate = calculatedMaxDate;
          control.setValidators([
            ...(control.validator ? [control.validator] : []),
            Validators.max(calculatedMaxDate.getTime()),
          ]);
        }

        control.updateValueAndValidity();
      };

      dependencyField.valueChanges.subscribe(updateConstraints);
      updateConstraints(); // Aplicar al inicializar

      // Forzar una actualización manual del valor del campo dependiente
      setTimeout(() => {
        dependencyField.updateValueAndValidity();
      }, 0);
    };

    fieldGroupsDynamicForm.forEach((group: IFieldGroup) => {
      group.fields.forEach((field: IFieldDynamicForm) => {
        if (field.visible) {
          // Inicializar control
          const control = initializeControl(field);

          // Agregar control al objeto de controles
          if (field.name) this.formGroupControls[field.name] = control;

          // Agregar opciones al campo select sin dependencias
          if (
            field.apiUrl &&
            !field.urlParamDependency &&
            !field.urlQueryParam &&
            !field.urlEndParam
          ) {
            this.fetchOptions(field, null, false);
          }
          if (!this.isReadonly) {
            // Manejar dependencias de values de campos internas
            if (field.valueDependency || field.valueExcludeDependency)
              handleDependenciesValue(field, control);

            // Manejar dependencias de campos
            if (field.dependency) handleDependencies(field, control);

            // Manejar dependencias de fechas
            if (field.type === eDataType.date)
              handleDynamicDateConstraints(field, control);
          }
        }
      });
      isRangeValidator = group.isRangeValidator ?? false;
    });

    form = this.fb.group(this.formGroupControls);
    if (isRangeValidator) form.setValidators(this.rangeValidator);
    if (this.isEditMode) {
      this.markControlsAsTouched(form);
    }

    if (this.isReadonly) {
      form.disable(); // Disable the entire form if readonly
    }

    return form;
  }

  markControlsAsTouched(form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity(); // Actualiza los errores y validaciones
      }
    });
  }

  public handleExternalDependenciesService(
    field: IFieldDynamicForm,
    control: AbstractControl
  ): () => void {
    if (!control) {
      console.warn(`Control no encontrado para el campo ${field.name}`);
      return () => { };
    }

    const checkDependencies = () => {
      // 1) Verificar dependencias externas
      const depsExtOk = field.externalDependencies?.every(
        (dep) => this.externalDependenciesValues?.[dep] !== undefined
      );

      // 2) Verificar dependencias de formulario (field.dependency)
      let depsFormOk = true;
      if (field.dependency) {
        const dependencyFields = field.dependency.split(',');
        // Chequea que todos esos campos tengan algún valor
        depsFormOk = dependencyFields.every(
          (depField) => !!this.formGroupControls[depField]?.value
        );
      }

      // Si todo está OK, habilitar campo y llamar a la API
      if (depsExtOk && depsFormOk) {
        control.enable();
        if (field.apiUrl) {
          // Verificar si hay dependencias externas
          const hasExternalDeps =
            field.externalDependencies && field.externalDependencies.length > 0;
          // fetchOptions con "useExternalDeps = true" si hay dependencias externas
          this.fetchOptions(field, undefined, hasExternalDeps);
        }
      } else if (!this.isEditMode || !control.value) {
        // Si no está en modo edición o el control no tiene valor, deshabilita
        control.disable();
        control.reset();
        field.options = [];
      }
      // En modo edición y tiene valor, no hacer nada para mantener el valor
    };

    // Ejecuta inicialmente
    checkDependencies();

    // Retorna la función para que el componente la invoque cuando cambien las dependencias
    return checkDependencies;
  }

  rangeValidator: ValidatorFn = (
    group: AbstractControl
  ): { [key: string]: any } | null => {
    const desde = Number(group.get('desde')?.value);
    const hasta = Number(group.get('hasta')?.value);
    return desde <= hasta ? null : { rangeError: true };
  };

  functionGetFormValue(
    form: FormGroup,
    fieldGroupsDynamicForm: IFieldGroup[]
  ): KeyValue {
    let dataFilterSend: KeyValue = {} as KeyValue;

    fieldGroupsDynamicForm.forEach((group) => {
      group.fields.forEach((fieldDynamicForm) => {
        const control = form.get(fieldDynamicForm.name!);

        if (control) {
          if (control.value !== '' && control.value !== null) {
            fieldDynamicForm.active = true;

            switch (fieldDynamicForm.type) {
              case eDataType.select:
                fieldDynamicForm.value = control.value;
                if (control.value === -1) {
                  fieldDynamicForm.options = [
                    { key: -1, value: 'TODOS' },
                    ...fieldDynamicForm.options!,
                  ];
                }
                fieldDynamicForm.selectedOption =
                  fieldDynamicForm.options?.find(
                    (option) => option.key === control.value
                  );
                fieldDynamicForm.filterParam!
                  ? (dataFilterSend[fieldDynamicForm.filterParam!] =
                    fieldDynamicForm.selectedOption
                      ? (fieldDynamicForm.selectedOption[
                        'key'
                      ] as ObjectKeyValue)
                      : null)
                  : (dataFilterSend[fieldDynamicForm.name!] =
                    fieldDynamicForm.selectedOption
                      ? transformToObject(
                        fieldDynamicForm.selectedOption as ObjectKeyValue
                      )
                      : null);
                break;
              case eDataType.date:
                fieldDynamicForm.value = control.value || null;
                dataFilterSend[fieldDynamicForm.name!] = fieldDynamicForm.value;
                break;
              default:
                fieldDynamicForm.value =
                  fieldDynamicForm.typeModel === eTypeMOdel.number
                    ? Number(control.value)
                    : control.value;
                //fieldDynamicForm.value = control.value;
                dataFilterSend[fieldDynamicForm.name!] = fieldDynamicForm.value;
                break;
            }
          } else {
            fieldDynamicForm.active = false;
            fieldDynamicForm.value = null;
            dataFilterSend[fieldDynamicForm.name!] = null;
          }
        }
      });
    });

    return dataFilterSend;
  }

  private buildUrlAndParams(
    field: IFieldDynamicForm,
    dependencyValue?: any,
    useExternalDeps: boolean = false
  ): { url: string; params: HttpParams } {
    let url = `${this.baseUrl}${field.apiUrl}`;
    let params = new HttpParams();

    // 1. urlParamDependency (ej: /api/{id})
    if (field.urlParamDependency && dependencyValue) {
      url = url.replace(/\{.*?\}/g, dependencyValue);
    }
    // 2. urlQueryParam (ej: ?depField=value)
    else if (field.urlQueryParam && field.dependency) {
      const dependencyFields = field.dependency.split(',');
      dependencyFields.forEach((depField) => {
        params = params.set(depField, this.formGroupControls[depField].value);
      });
    }
    // 3. urlEndParam (ej: /api/id)
    else if (field.urlEndParam && dependencyValue) {
      url = `${url}/${dependencyValue}`;
    }

    // 4. Agregar dependencias externas si se indica
    if (useExternalDeps && field.externalDependencies) {
      field.externalDependencies.forEach((dep) => {
        if (this.externalDependenciesValues[dep] !== undefined) {
          params = params.append(dep, this.externalDependenciesValues[dep]);
        }
      });
    }

    return { url, params };
  }

  private fetchOptions(
    field: IFieldDynamicForm,
    dependencyValue?: any,
    useExternalDeps: boolean = false
  ): void {
    if (!field.apiUrl) {
      return;
    }

    const { url, params } = this.buildUrlAndParams(
      field,
      dependencyValue,
      useExternalDeps
    );

    this.http.get(url, { params }).subscribe((res: any) => {
      field.options = field.subscribeMap
        ? field.subscribeMap(res).map((item: any) => ({
          key: item.id,
          value: field.valueTOShow
            ? getValueFromProperty(item, field.valueTOShow)
            : item.nombre || item.name,
          data: item.data,
        }))
        : res.data.map((item: any) => ({
          key: item.id,
          value: field.valueTOShow
            ? item[field.valueTOShow]
            : item.nombre || item.name,
          data: item,
        }));
      field.options?.sort((a, b) =>
        (a.value || '').localeCompare(b.value || '')
      );
    });
  }
}
