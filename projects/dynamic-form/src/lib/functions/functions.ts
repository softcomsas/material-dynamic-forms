import {
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from '@angular/common/http';
import { ConfirmEventType, MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { ObjectKeyValue } from '../interfaces';

export function handleError(error: HttpErrorResponse) {
  let errorData = {
    status: 0,
    message: '',
  };
  switch (error.status) {
    case HttpStatusCode.Unauthorized:
      removeItemStorage();
      return throwError(error.error.message);

    case HttpStatusCode.BadRequest:
    case HttpStatusCode.Conflict:
      return throwError(error.error.message);
    case HttpStatusCode.PaymentRequired:
      errorData.status = error.status;
      errorData.message = error.error.data.mensaje;
      return throwError(errorData);
    case HttpStatusCode.UnprocessableEntity:
      return throwError(error.error);
    case HttpStatusCode.TooEarly:
      return throwError(error.error.message.errors);
    case HttpStatusCode.InternalServerError:
      return throwError(error.error.previous.message);

    default:
      return throwError('Something bad happened; please try again later.');
  }
}

export function removeNullValuesFromQueryParams(params: HttpParams) {
  const paramsKeysAux = params.keys();
  paramsKeysAux.forEach((key) => {
    const value = params.get(key);
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'undefined'
    ) {
      params['map'].delete(key);
    }
  });
  return params;
}

export const FunctionRejectData = (
  type: any,
  _messageService: MessageService
) => {
  switch (type) {
    case ConfirmEventType.REJECT:
      _messageService.add({
        severity: 'error',
        summary: 'Rechazada',
        detail: 'Rechazada la acción',
      });
      break;
    case ConfirmEventType.CANCEL:
      _messageService.add({
        severity: 'warn',
        summary: 'Cancelado',
        detail: 'Cancelada la acción',
      });
      break;
  }
};

export function filterObjectKeys<T extends object, K extends keyof T>(
  obj: T,
  keysToKeep: readonly K[]
): Pick<T, K> {
  const newObj: Partial<T> = {};

  keysToKeep.forEach((key: K) => {
    if (key in obj) {
      newObj[key] = obj[key];
    }
  });

  return newObj as Pick<T, K>;
}

export function getValueFromProperty(row: any, property: string): any {
  if (!row || !property) {
    return undefined;
  }
  const properties = property.split('.');
  // Itera sobre las propiedades para acceder al valor final
  let value = row;
  for (const prop of properties) {
    value = value[prop];
    if (value === undefined) {
      return undefined;
    }
  }
  return value;
}

export function removeItemStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('session_id');
  localStorage.removeItem('remember');
}

export const transformToObject = (
  objectSelect: ObjectKeyValue
): { id: number; nombre: string } => {
  return {
    id: Number(objectSelect.key),
    nombre: objectSelect.value,
  };
};
