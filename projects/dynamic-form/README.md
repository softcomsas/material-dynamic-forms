# ✨ material-dynamic-forms

¡Crea formularios dinámicos, potentes y configurables en Angular usando Material Design! 🚀

---

## ¿Qué es esta librería? 🤔

**material-dynamic-forms** es una herramienta para generar formularios dinámicos en Angular, completamente personalizados desde la configuración, compatibles con Angular Material y preparados para casos de uso avanzados como formularios dependientes, campos dinámicos, validaciones, autocompletados y más.

---

## Instalación 🛠️

```bash
npm install material-dynamic-forms
```

Agrega el módulo en tu aplicación:

```typescript
import { DynamicFormModule } from 'material-dynamic-forms';

@NgModule({
  imports: [
    // ...
    DynamicFormModule,
  ],
})
export class AppModule {}
```

---

## Uso Básico 🚦

```html
<lib-dynamic-form
  [fieldGroups]="formularioAgrupado"
  [baseUrl]="urlApi"
  [isEdit]="modoEdicion"
  (changeValueSelected)="onChangeValue($event)">
</lib-dynamic-form>
```

- **fieldGroups**: Arreglo de grupos de campos dinámicos (ver ejemplos abajo).
- **baseUrl**: URL base para consumir APIs de selects dinámicos.
- **isEdit**: Indica si el formulario está en modo edición.
- **changeValueSelected**: Output para escuchar cambios de campos.

---

## Cómo se define un formulario dinámico 📐

El formulario se define con un array de `IFieldGroup`, donde cada grupo incluye un título, cantidad de columnas y una lista de campos (`IFieldDynamicForm`). 

### Ejemplo de definición

```typescript
const formularioAgrupado: IFieldGroup[] = [
  {
    title: 'Datos Personales',
    countColumns: 2,
    fields: [
      {
        label: 'Nombre',
        name: 'nombre',
        type: eDataType.input,
        placeholder: 'Ingrese su nombre',
        visible: true,
        validation: [Validators.required]
      },
      {
        label: 'Fecha de nacimiento',
        name: 'fechaNacimiento',
        type: eDataType.date,
        visible: true
      }
    ]
  }
];
```

---

## Interfaz de campo (`IFieldDynamicForm`) 🧩

| Propiedad                | Tipo           | Descripción |
|--------------------------|----------------|-------------|
| `label`                  | string         | Texto visible en el campo |
| `name`                   | string         | Nombre de control (formControlName) |
| `type`                   | eDataType      | Tipo de campo (input, select, date, etc) |
| `placeholder`            | string         | Texto de ayuda (opcional) |
| `options`                | array          | Opciones para selects/autocompletes |
| `visible`                | boolean        | Si el campo se muestra o no |
| `disabled`               | boolean        | Si el campo está deshabilitado |
| `validation`             | ValidatorFn[]  | Validaciones Angular (requerido, patrón, etc) |
| `apiUrl`                 | string         | URL para cargar opciones dinámicamente |
| `dependency`             | string         | Campo del cual depende este campo |
| `valueDependency`        | objeto         | Dependencia para habilitar según valor de otro campo |
| `externalDependencies`   | string[]       | Dependencias externas para selects dinámicos |
| `multiple`               | boolean        | Selección múltiple (en selects) |
| `colspan`                | number         | Cuántas columnas ocupa el campo |
| ...                      | ...            | ¡Hay muchas más! (ver abajo) |

### Tipos de campo (`eDataType`) 🎛️

- `input`: Campo de texto simple
- `select`: Selector desplegable
- `date`: Selector de fecha
- `checkbox`: Checkbox
- `select_search`: Select con buscador
- `tex_area`: Área de texto
- `button`, `button_toggle`: Botones
- `select_chips`: Select con selección múltiple tipo "chips"
- `select_autocomplete` / `input_autocomplete`: Autocompletes
- ... y más

### Dependencias y dinámicas avanzadas 🔗

Puedes:
- Habilitar/inhabilitar campos según valores de otros (`valueDependency`, `valueExcludeDependency`)
- Consumir APIs para cargar opciones de selects según dependencias o filtros
- Usar funciones para validar rangos de fechas, filtrar fechas válidas, etc.

---

## Interfaz de grupo (`IFieldGroup`) 🏷️

| Propiedad           | Tipo                | Descripción |
|---------------------|---------------------|-------------|
| `title`             | string              | Título del grupo |
| `countColumns`      | number              | Número de columnas en el grid |
| `fields`            | IFieldDynamicForm[] | Lista de campos |
| `isRangeValidator`  | boolean             | Si aplica validación de rango (opcional) |

---

## Ejemplo completo 🌟

```typescript
import { eDataType, IFieldGroup } from 'material-dynamic-forms';

const grupos: IFieldGroup[] = [
  {
    title: 'Información Básica',
    countColumns: 2,
    fields: [
      {
        label: 'Correo Electrónico',
        name: 'email',
        type: eDataType.input,
        placeholder: 'ejemplo@correo.com',
        visible: true,
        validation: [Validators.required, Validators.email]
      },
      {
        label: 'País',
        name: 'pais',
        type: eDataType.select,
        visible: true,
        apiUrl: '/api/paises',
        options: [],
        valueTOShow: 'nombre'
      }
    ]
  }
];
```

---

## Métodos y outputs principales 🧑‍💻

- **(changeValueSelected)**: Output para reaccionar a cambios en los campos.
- **getForm()**: Método para obtener el `FormGroup` subyacente.
- **externalDependenciesValuesChanged**: Output para detectar cambios en dependencias externas.

---

## Personalización y buenas prácticas 👩‍🎨

- Puedes crear validadores personalizados y pasarlos a los campos.
- Usa dependencias entre campos para formularios complejos.
- Aprovecha la integración con Angular Material para una UI consistente.

---

## API pública (servicio) 🔍

El servicio `DynamicFormService` permite:
- Inicializar formularios (`functionInitComponent`)
- Gestionar dependencias internas y externas
- Extraer valores mapeados del formulario (`functionGetFormValue`)
- Construir URLs dinámicas para selects dependientes

---

## Publicar en NPM 🚀

Si eres el mantenedor, puedes publicar la librería así:

```bash
ng build dynamic-form
cd dist/dynamic-form
npm publish --access public
```

Asegúrate de tener configurado tu usuario en npm y permisos para publicar.

---

## Contribuir 🤝

¿Ideas, bugs o mejoras? ¡Tu feedback es bienvenido! Haz un PR o abre un issue en el repo.

---

## Licencia 📄

MIT

---

## Créditos y agradecimientos 🙌

Desarrollado con ❤️ por [softcomsas](https://github.com/softcomsas).

---

> Para ver más ejemplos y documentación, consulta los archivos en la carpeta `/projects/dynamic-form` del repo.
