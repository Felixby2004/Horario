# ✅ Funcionalidad Completa: Editar y Eliminar Cursos

## 🎯 Funcionalidades Implementadas

### 1. **Editar Horas de un Curso**
- Acceso desde la tabla en "Gestión de Cursos"
- Modal para editar:
  - ✏️ Nombre del curso
  - 📚 Horas de Teoría (0-20)
  - 🔬 Horas de Laboratorio (0-20)
  - 📖 Horas de Práctica (0-20)
  - 🎓 Créditos
  - 📅 Ciclo

**Validaciones:**
- El nombre no puede estar vacío
- Las horas no pueden ser negativas
- Los créditos no pueden ser negativos
- Se muestra total de horas en tiempo real

### 2. **Eliminar Cursos**
- Botón "🗑️ Eliminar" en cada fila de la tabla
- Confirmación antes de eliminar
- El curso se marca como inactivo (`activo = false`)
- NO se elimina de la BD, solo se desactiva
- Los cursos inactivos no aparecen en la lista

---

## 📝 Archivos Modificados

### 1. Frontend - Dashboard
**Archivo:** `src/app/dashboard/cursos/page.tsx`

**Cambios:**
- Agregados estados para manejar modal de edición
- Función `handleAbrirModalEditar()` - Abre modal con datos del curso
- Función `handleGuardarCambios()` - Envía PUT al API
- Función `handleEliminarCurso()` - Envía DELETE al API
- Modal con formulario para editar horas y datos
- Nueva columna "Acciones" con botones Editar y Eliminar
- Integración con sistema de alertas (`ContenedorAlertas`)
- Filtro para mostrar solo cursos activos

**Características del Modal:**
```
┌─────────────────────────────┐
│ Editar Curso                │
├─────────────────────────────┤
│ Código:    CC-105  [disabled]
│ Nombre:    [input field]
│ Horas:     T:[0-20] L:[0-20] P:[0-20]
│ Créditos:  [0-10]    Ciclo: [1-10]
│ Total:     X horas
│ [Cancelar]  [Guardar]
└─────────────────────────────┘
```

### 2. Backend - API
**Archivo:** `src/app/api/cursos/[id]/route.ts`

**Métodos Actualizados:**

#### GET `/api/cursos/{id}`
- Validación mejorada
- Retorna respuesta con formato consistente
- Mejor manejo de errores

#### PUT `/api/cursos/{id}`
- **Nuevo:** Validación de datos
- **Nuevo:** Validación de existencia del curso
- **Nuevo:** Valores por defecto si algunos campos no se envían
- Actualiza: nombre, horas, créditos, ciclo
- Respuesta: `{ exito: true, datos: curso, mensaje: "..." }`

Ejemplo de uso:
```bash
curl -X PUT http://localhost:3000/api/cursos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ingeniería de Software I",
    "horas_teoria": 4,
    "horas_laboratorio": 0,
    "horas_practica": 2,
    "creditos": 3,
    "ciclo": 5
  }'
```

#### DELETE `/api/cursos/{id}`
- **Nuevo:** Validación de existencia
- **Nuevo:** Nombre del curso en respuesta
- Cambia `activo = false` (soft delete)
- NO elimina el registro de la BD
- Respuesta: `{ exito: true, mensaje: "..." }`

Ejemplo de uso:
```bash
curl -X DELETE http://localhost:3000/api/cursos/1
```

---

## 🔄 Flujo de Uso

### Editar un Curso:
1. Ir a Dashboard → Gestión de Cursos
2. Click en botón "✏️ Editar" de un curso
3. Se abre modal con datos actuales
4. Modificar los campos deseados:
   - Nombre
   - Horas (Teoría, Lab, Práctica)
   - Créditos
   - Ciclo
5. Click en "✅ Guardar"
6. Sistema valida los datos
7. Se muestra alerta de éxito
8. Tabla se actualiza automáticamente

### Eliminar un Curso:
1. Ir a Dashboard → Gestión de Cursos
2. Click en botón "🗑️ Eliminar" de un curso
3. Aparece confirmación: "¿Estás seguro de que deseas eliminar..."
4. Click en "OK" para confirmar
5. El curso se marca como inactivo
6. Desaparece de la lista
7. Se muestra alerta de éxito

---

## 📊 Validaciones Implementadas

### En Frontend:
- ✅ Nombre no puede estar vacío
- ✅ Horas no pueden ser negativas
- ✅ Créditos no pueden ser negativos
- ✅ Rango de horas: 0-20
- ✅ Rango de créditos: 0-10
- ✅ Rango de ciclo: 1-10

### En Backend:
- ✅ Validación de existencia del curso (GET, PUT, DELETE)
- ✅ Validación de datos (PUT)
- ✅ Validación de valores negativos
- ✅ Validación de nombre vacío

### UI Feedback:
- ✅ Modales deshabilitadas durante operaciones
- ✅ Botones deshabilitados durante carga
- ✅ Indicador de carga "⏳ Guardando..."
- ✅ Alertas de éxito y error
- ✅ Confirmación antes de eliminar
- ✅ Total de horas mostrado en tiempo real

---

## 🎨 Componentes UI Utilizados

- **TablaDatos**: Componente reutilizable para mostrar tabla
- **Boton**: Componente botón reutilizable
- **ContenedorAlertas**: Sistema de alertas temporal
- **useAlertasTemporales**: Hook para manejar alertas

---

## 📋 Estados de Datos

### Curso (antes y después):
```javascript
// Estructura del Curso
{
  id_curso: 1,
  codigo: "CC-105",
  nombre: "Ingeniería de Software I",
  horas_teoria: 4,
  horas_laboratorio: 0,
  horas_practica: 2,
  creditos: 3,
  ciclo: 5,
  activo: true,  // ← Se usa para eliminar
  fecha_creacion: "2025-01-18T10:00:00Z"
}

// Al eliminar, solo cambia:
{
  ...
  activo: false  // ← Campo clave para "eliminación"
}
```

---

## 🧪 Cómo Probar

### Test Manual - Editar:
1. Abre "Gestión de Cursos"
2. Haz click en "✏️ Editar" de cualquier curso
3. Cambia:
   - Nombre a "Curso Actualizado"
   - Horas de Teoría a 6
   - Horas de Lab a 2
4. Click "✅ Guardar"
5. Verifica que aparezca alerta de éxito
6. Recarga la página
7. Verifica que los cambios persistan

### Test Manual - Eliminar:
1. Abre "Gestión de Cursos"
2. Haz click en "🗑️ Eliminar" de cualquier curso
3. Confirma en el diálogo
4. Verifica que desaparezca de la lista
5. Verifica que aparezca alerta de éxito
6. Recarga la página
7. Verifica que no aparezca en la lista

### Test API - cURL:

**Editar:**
```bash
curl -X PUT http://localhost:3000/api/cursos/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","horas_teoria":4}'
# Respuesta: {"exito":true,"datos":{...},"mensaje":"..."}
```

**Eliminar:**
```bash
curl -X DELETE http://localhost:3000/api/cursos/1
# Respuesta: {"exito":true,"mensaje":"Curso XXX eliminado exitosamente"}
```

---

## ✨ Características Adicionales

- **Soft Delete**: Los cursos eliminados no se pierden, solo se marcan como inactivos
- **Validaciones en Tiempo Real**: El modal muestra total de horas mientras escribes
- **UX Mejorada**: Botones deshabilitados durante operaciones
- **Feedback Visual**: Alertas con emojis para mejor identificación
- **Búsqueda Funcional**: Los cursos eliminados no aparecen en búsqueda
- **Código Limpio**: Funciones bien organizadas y legibles

---

## 🔗 Rutas Relacionadas

- `/dashboard/cursos` - Gestión (lista, edita, elimina)
- `/dashboard/cursos/nuevo` - Crear nuevo curso
- `/api/cursos` - GET todos, POST nuevo
- `/api/cursos/{id}` - GET, PUT, DELETE individual

---

## 📌 Notas Importantes

1. **No es eliminación física**: Los registros se mantienen en BD con `activo = false`
2. **Cascadas**: Otros registros relacionados no se eliminarán (Grupos, DocenteCurso, etc.)
3. **Permisos**: Considera agregar validación de permisos para restricción a admin
4. **Auditoría**: Considera agregar campos de `updated_by` y `updated_at` en Prisma si necesitas auditar cambios

---

## ✅ Checklist

- [x] Modal de edición funcional
- [x] Validaciones en frontend
- [x] Validaciones en backend
- [x] API PUT actualizado
- [x] API DELETE funcional (soft delete)
- [x] Sistema de alertas integrado
- [x] Tabla con botones de acción
- [x] Filtro de cursos activos
- [x] Sin errores de compilación
- [x] UX/UI mejorada
- [x] Confirmación antes de eliminar

