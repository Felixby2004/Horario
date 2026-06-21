# Prerrequisitos múltiples en cursos

## Resumen técnico

El módulo de cursos ahora soporta múltiples prerrequisitos por curso mediante una relación explícita en base de datos.

### Estructura de datos

- Tabla principal: `curso`
- Tabla relacional nueva: `curso_prerequisito`
- Clave compuesta: `id_curso`, `id_curso_prerequisito`
- Campo legado conservado: `curso.prerequisitos`

El campo `prerequisitos` se mantiene como texto derivado para no romper reportes, exportaciones ni vistas existentes. La fuente de verdad ahora es la relación `curso_prerequisito`.

### Flujo de actualización

1. Ejecutar `npx prisma db push`
2. Ejecutar `npm run prisma:generate`
3. Sincronizar o migrar datos históricos de prerrequisitos si existían registros previos con un solo valor textual

### Contratos de API

#### `POST /api/cursos`

Acepta:

```json
{
  "codigo": "CS301",
  "nombre": "Ingeniería de software",
  "tipo_curso": "EP",
  "id_departamento": 3,
  "creditos": 4,
  "ciclo": 6,
  "prerequisito_ids": [12, 18, 25]
}
```

#### `PUT /api/cursos/{id}`

Acepta:

```json
{
  "prerequisito_ids": [12, 18, 25]
}
```

Responde además con:

- `prerequisito_ids`
- `prerequisitos_detalle`
- `prerequisitos` como texto derivado

### Validaciones implementadas

- Un curso no puede ser prerrequisito de sí mismo.
- No se permiten prerrequisitos duplicados.
- Todos los prerrequisitos deben existir y estar activos.
- La lógica reutilizable `evaluarCumplimientoPrerequisitos()` verifica si un estudiante cumple todos los cursos previos exigidos.

## Guía de usuario

### Crear un curso con varios prerrequisitos

1. Ir a `Dashboard > Cursos > Nuevo curso`
2. Completar los datos generales
3. En `Prerrequisitos`, buscar y agregar uno o varios cursos previos
4. Guardar el curso

### Editar los prerrequisitos de un curso

1. Ir a `Dashboard > Cursos`
2. Elegir `Editar`
3. En `Carga y prerrequisitos`, agregar cursos previos o quitar los ya seleccionados
4. Guardar cambios

### Comportamiento esperado

- Si un curso exige `B`, `C` y `D`, el estudiante debe haber aprobado los tres.
- Si falta uno o más, el sistema reporta los prerrequisitos faltantes.
- Las exportaciones y vistas siguen mostrando el resumen de prerrequisitos de manera legible.
