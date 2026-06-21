# Registro de Versiones

## 2026-06-20

### Modulo Docentes
- Se mejoro el formulario de importacion de docentes con dos flujos: registro desde usuarios pendientes e importacion por archivo.
- Se agrego soporte de vista previa para archivos `.xlsx`, `.csv` y `.ods`, con revalidacion antes de confirmar la importacion.
- Se incorporaron validaciones de integridad para codigo, correo, documento, fecha de ingreso, facultad y departamento.
- Se habilito la seleccion y desmarcado individual de registros, junto con correccion editable por fila en la vista previa.
- Se agrego historial de importaciones con resumen de resultados y detalle de procesados.
- Se fortalecio la importacion de usuarios pendientes con validaciones y mensajes mas claros.

### Edicion De Docentes
- Se agrego acceso directo a edicion desde la lista de docentes.
- Se rediseño la pagina de edicion para precargar datos personales, adscripcion, informacion laboral, cursos y grupos asignados.
- Se incorporo confirmacion previa al guardado con resumen de cambios.
- Se agrego historial de modificaciones por docente con trazabilidad de usuario, fecha y cambios.
- Se registran en base de datos las importaciones y ediciones de docentes sin eliminar datos existentes.

### Calidad
- Se centralizaron utilidades de integridad, cambios y trazabilidad para reutilizar reglas entre registro, importacion y edicion.
- Se mantuvo compatibilidad con la arquitectura existente del proyecto y con los campos heredados del modulo docente.
