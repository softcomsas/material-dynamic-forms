import { NativeDateAdapter } from '@angular/material/core';

const CONST_TYPE_STRING = 'string';
const CONST_TYPE_NUMBER = 'number';
const CONST_TYPE_NUMERIC = 'numeric';
const CONST_TYPE_LONG = 'long';
const CONST_DISPLAY_FORMAT_INPUT = 'input';
const CONST_DISPLAY_FORMAT_INPUTMONTH = 'inputMonth';

export class AppDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === CONST_TYPE_STRING && value.indexOf('/') > -1) {
      const str = value.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);
      return new Date(year, month, date);
    }
    const timestamp = typeof value === CONST_TYPE_NUMBER ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
  override format(date: Date, displayFormat: string): string {
    if (displayFormat === CONST_DISPLAY_FORMAT_INPUT) {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
    } else if (displayFormat === CONST_DISPLAY_FORMAT_INPUTMONTH) {
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return this._to2digit(month) + '/' + year;
    } else {
      return date.toDateString();
    }
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}

export const APP_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: CONST_TYPE_NUMERIC, day: CONST_TYPE_NUMERIC },
  },
  display: {
    dateInput: CONST_DISPLAY_FORMAT_INPUT,
    monthYearLabel: CONST_DISPLAY_FORMAT_INPUTMONTH,
    dateA11yLabel: { year: CONST_TYPE_NUMERIC, month: CONST_TYPE_LONG, day: CONST_TYPE_NUMERIC },
    monthYearA11yLabel: { year: CONST_TYPE_NUMERIC, month: CONST_TYPE_LONG },
  },
};
