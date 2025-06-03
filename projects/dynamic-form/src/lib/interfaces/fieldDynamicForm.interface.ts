import { ValidatorFn } from '@angular/forms';

export interface IFieldDynamicForm {
  key?: string; // nombre del campo
  value?: any; // valor del campo
  valueTOShow?: any; // valor que se toma de referencia para el llenado de las options de los selects
  label: string; // texto que se muestra en el campo
  name: string; // nombre del campo para el formControlName
  type: // tipo de campo que se va a mostrar en el formulario
  | eDataType.input
  | eDataType.select
  | eDataType.date
  | eDataType.dateMultiple
  | eDataType.select_search
  | eDataType.tex_area
  | eDataType.button
  | eDataType.button_toggle
  | eDataType.select_chips
  | eDataType.select_autocomplete
  | eDataType.input_autocomplete
  | eDataType.checkbox;
  controlType?: // tipo de control que se va a mostrar en el formulario
  | 'button'
  | 'checkbox'
  | 'date'
  | 'email'
  | 'number'
  | 'tel'
  | 'text';
  typeModel?: eTypeMOdel.boolean | eTypeMOdel.number;
  placeholder?: string; // texto que se muestra en el campo
  options?: { // opciones que se van a mostrar en el select
    key: string | number | null;
    value: string;
    filterParam?: string;
    [key: string]: any;
  }[];
  selectedOption?: any; // valor seleccionado en el select
  icon?: string; // icono que se va a mostrar en el campo
  visible: boolean; // si el campo se va a mostrar o no
  active?: boolean; // si el campo se va a mostrar o no
  disabled?: boolean; // si el campo esta deshabilitado o no
  multiple?: boolean;
  validation?: ValidatorFn[]; // validaciones que se le van a aplicar al campo
  apiUrl?: string; // url de la api que se va a consumir para llenar el select
  dependency?: string; // campo del cual depende el campo actual
  filterParam?: string; // nombre de parametro a enviar en la api para el post
  dateDependency?: string; // campo del cual depende la fecha el campo actual
  startDateName?: string; // nombre del campo de fecha de inicio
  endDateName?: string; // nombre del campo de fecha de fin
  minDate?: Date; // fecha minima que se puede seleccionar
  maxDate?: Date; // fecha maxima que se puede seleccionar
  minDateFn?: (value: Date) => Date; // Función para calcular la fecha mínima
  maxDateFn?: (value: Date) => Date; // Función para calcular la fecha máxima
  dateFilterFn?: (d: Date | null) => boolean; // Función para filtrar las fechas
  urlParamDependency?: boolean; // cuando se deba enviar el value de la primera dependencia en la misma url dentro del primer {}
  urlQueryParam?: boolean; // cuando se deba enviar elos value de las dependencias como query parms
  urlEndParam?: boolean; // cuando se deba enviar el value de la primera dependencia en la misma url al final
  colspan?: number;
  background?: string; // color de fondo del campo
  valueDependency?: { // cuando se quiere habilitar un campo si el valor de otro campo es igual a un valor especifico
    dependency?: any;
    valueDep?: any;
    disabled?: boolean;
    validation?: ValidatorFn[];
  };
  valueExcludeDependency?: { // cuando se quiere habilitar un campo si el valor de otro campo es diferente a un valor especifico
    dependency?: any;
    valueDep?: any;
    disabled?: boolean;
    validation?: ValidatorFn[];
  };
  externalDependencies?: string[]; // Lista de nombres de dependencias externas
  allOption?: boolean; //Agrega el TODOS en los select
  subscribeMap?: Function;
  inputAutoComplete?: {
    suggestions: any[]; // Sugerencias para autocompletar
    showClear?: boolean; // Mostrar botón de limpiar
    onCompleteMethod?: (event: any) => void; // Método a llamar al completar
    onSelect?: (event: any) => void; // Método a llamar al seleccionar
    onClear?: (event: any) => void; // Método a llamar al limpiar
  }
}

export enum eDataType {
  input,
  select,
  date,
  select_search,
  range,
  button,
  checkbox,
  dateMultiple,
  tex_area,
  button_toggle,
  select_chips,
  select_autocomplete,
  input_autocomplete,
}

export enum eControlType {
  button,
  checkbox,
  date,
  email,
  number,
  tel,
  text,
}

export enum eTypeMOdel {
  boolean,
  number,
}

export interface IFieldGroup {
  title?: string;
  countColumns?: number;
  fields: IFieldDynamicForm[];
  isRangeValidator?: boolean;
}
