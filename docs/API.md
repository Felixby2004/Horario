# Documentación de API - Sistema de Horarios UNT

## Autenticación

### POST /api/auth/login
Iniciar sesión en el sistema.

**Request:**
```json
{
  "codigo": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "exito": true,
  "token": "jwt_token_here",
  "usuario": {
    "id": 1,
    "codigo": "admin",
    "rol": "administrador"
  }
}
```

## Docentes

### GET /api/docentes
Obtener lista de docentes.

**Query Parameters:**
- `activo` (boolean): Filtrar por docentes activos
- `categoria` (string): Filtrar por categoría

**Response:**
```json
{
  "exito": true,
  "datos": [
    {
      "id_docente": 1,
      "nombres": "Juan",
      "apellidos": "Pérez",
      "categoria": "principal",
      "modalidad": "tiempo_completo"
    }
  ]
}
```

### POST /api/docentes
Crear nuevo docente.

**Request:**
```json
{
  "codigo_docente": "DOC001",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "categoria": "principal",
  "modalidad": "tiempo_completo",
  "correo_electronico": "juan.perez@unt.edu.pe"
}
```

### GET /api/docentes/{id}
Obtener detalles de un docente.

### PUT /api/docentes/{id}
Actualizar docente.

### DELETE /api/docentes/{id}
Eliminar docente.

## Cursos

### GET /api/cursos
Obtener lista de cursos.

### POST /api/cursos
Crear nuevo curso.

**Request:**
```json
{
  "codigo_curso": "CS101",
  "nombre": "Programación I",
  "horas_teoria": 3,
  "horas_laboratorio": 2,
  "horas_practica": 0,
  "creditos": 4,
  "ciclo": 1
}
```

### POST /api/cursos/importar
Importar cursos desde Excel/CSV.

**Request:** multipart/form-data
- `archivo`: File (Excel o CSV)

## Horarios

### GET /api/horarios
Obtener horarios asignados.

**Query Parameters:**
- `periodo` (number): ID del período académico
- `docente` (number): ID del docente
- `curso` (number): ID del curso

### POST /api/horarios
Asignar nuevo horario.

**Request:**
```json
{
  "id_periodo": 1,
  "id_curso": 1,
  "id_grupo": 1,
  "id_docente": 1,
  "id_ambiente": 1,
  "dia_semana": "lunes",
  "hora_inicio": "08:00",
  "hora_fin": "09:30"
}
```

### POST /api/horarios/validar
Validar horario antes de confirmar.

### POST /api/horarios/validar-todo
Validar todos los horarios de un período.

### POST /api/horarios/generar-automatico
Generar horarios automáticamente.

**Request:**
```json
{
  "id_periodo": 1,
  "id_curso": 1
}
```

## Ventanas de Atención

### GET /api/ventanas
Obtener ventanas de atención.

### POST /api/ventanas
Crear nueva ventana.

**Request:**
```json
{
  "nombre": "Ventana Principal",
  "fecha_inicio": "2025-01-20",
  "fecha_fin": "2025-01-25",
  "hora_inicio": "08:00",
  "hora_fin": "17:00"
}
```

### GET /api/ventanas/{id}/cola
Obtener cola de docentes de una ventana.

## Notificaciones

### POST /api/notificaciones/enviar
Enviar notificación.

**Request:**
```json
{
  "id_docente": 1,
  "tipo": "email",
  "asunto": "Recordatorio",
  "mensaje": "Mensaje aquí"
}
```

### GET /api/notificaciones/historial
Obtener historial de notificaciones.

## Reportes

### POST /api/reportes/aula
Generar reporte PDF de horario por aula.

**Request:**
```json
{
  "id_periodo": 1,
  "id_ambiente": 1
}
```

**Response:** PDF file

### POST /api/reportes/gestion
Generar reporte ejecutivo.

### POST /api/reportes/conflictos
Generar reporte de conflictos.

## Estadísticas

### GET /api/estadisticas/dashboard
Obtener estadísticas del dashboard.

**Response:**
```json
{
  "exito": true,
  "datos": {
    "totalHorarios": 150,
    "totalDocentes": 45,
    "totalCursos": 60,
    "ocupacionPromedio": 75
  }
}
```

### GET /api/estadisticas/mapa-calor
Obtener datos para mapa de calor.

### GET /api/estadisticas/resumen-completo
Obtener resumen completo del período.

## Configuración

### GET /api/configuracion/restricciones
Obtener restricciones del sistema.

### PUT /api/configuracion/restricciones
Actualizar restricciones.

### GET /api/configuracion/dias-no-laborables
Obtener días no laborables.

### POST /api/configuracion/dias-no-laborables
Agregar día no laborable.

## Auditoría

### GET /api/auditoria
Obtener registros de auditoría.

**Query Parameters:**
- `usuario` (string): Filtrar por usuario
- `accion` (string): Filtrar por acción
- `desde` (date): Fecha desde
- `hasta` (date): Fecha hasta

## Códigos de Estado

- `200`: Éxito
- `201`: Creado
- `400`: Solicitud inválida
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error del servidor

## Rate Limiting

- Máximo 100 solicitudes por minuto por IP
- Máximo 1000 solicitudes por hora por usuario

## Autenticación

Todas las rutas excepto `/api/auth/login` requieren un token JWT en el header:

```
Authorization: Bearer {token}
```
