# Plan de Integración de Alertas Mejoradas en Todo el Sistema

## 📊 Resumen Ejecutivo

Se encontraron **100+ instancias de `alert()`** en el sistema que deben reemplazarse con el sistema profesional de alertas mejoradas. Este documento proporciona:

1. **Listado completo de archivos** que necesitan actualización
2. **Patrón estándar** de implementación
3. **Orden de prioridad** recomendado
4. **Ejemplos de implementación** para cada tipo de operación

---

## 🎯 Patrón de Implementación Estándar

### 1. Importar el Hook y Componente

```typescript
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
```

### 2. Inicializar en el Componente

```typescript
const { alertas, eliminarAlerta, exito, error, advertencia, info } = useAlertasTemporales();
```

### 3. Agregar el Contenedor en el JSX

```typescript
return (
  <div>
    <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />
    {/* Resto del contenido */}
  </div>
);
```

### 4. Reemplazar `alert()` con los Métodos del Hook

```typescript
// ANTES:
if (data.exito) {
  alert('✅ Usuario actualizado exitosamente');
  cargarUsuarios();
}

// DESPUÉS:
if (data.exito) {
  exito('✅ Usuario actualizado', 'Los cambios se han guardado correctamente');
  cargarUsuarios();
}
```

---

## 📋 Archivos Críticos por Categoría

### 🟥 PRIORIDAD ALTA (Operaciones Frecuentes)

#### 1. **Gestión de Usuarios** - 4 alertas
- Archivo: `src/app/dashboard/usuarios/page.tsx`
- Operaciones:
  - Activar/desactivar usuario
  - Eliminar usuario
- Líneas aprox: 42, 46, 60, 64

#### 2. **Horarios** - 8 alertas
- Archivos:
  - `src/app/dashboard/horarios/page.tsx` (4 alertas)
  - `src/app/dashboard/docentes/ventanas/page.tsx` (4 alertas)
- Operaciones:
  - Eliminar horario
  - Asignar horario en ventana
  - Enviar solicitudes

#### 3. **Grupos** - 8 alertas
- Archivos:
  - `src/app/dashboard/grupos/page.tsx` (3 alertas)
  - `src/app/dashboard/grupos/[id]/page.tsx` (5 alertas)
- Operaciones:
  - Crear grupo
  - Actualizar grupo
  - Desactivar grupo

#### 4. **Ambientes** - 6 alertas
- Archivos:
  - `src/app/dashboard/ambientes/page.tsx` (2 alertas)
  - `src/app/dashboard/ambientes/nuevo/page.tsx` (2 alertas)
  - `src/app/dashboard/ambientes/[id]/page.tsx` (2 alertas)
- Operaciones:
  - Crear ambiente
  - Actualizar ambiente
  - Desactivar ambiente

#### 5. **Solicitudes** - 6 alertas
- Archivo: `src/app/dashboard/solicitudes/page.tsx`
- Operaciones:
  - Aprobar solicitud
  - Rechazar solicitud

---

### 🟧 PRIORIDAD MEDIA (Operaciones Importantes)

#### 6. **Períodos Académicos** - 3 alertas
- Archivos:
  - `src/app/dashboard/periodos/page.tsx` (2 alertas)
  - `src/app/dashboard/periodos/nuevo/page.tsx` (1 alerta)
- Operaciones:
  - Crear período
  - Cambiar estado de período

#### 7. **Ventanas de Atención** - 6 alertas
- Archivos:
  - `src/app/dashboard/ventanas/page.tsx` (3 alertas)
  - `src/components/ventanas/ConfiguradorVentanas.tsx` (2 alertas)
- Operaciones:
  - Crear ventana
  - Eliminar ventana

#### 8. **Docentes** - 8 alertas
- Archivos:
  - `src/app/dashboard/docentes/nuevo/page.tsx` (3 alertas)
  - `src/app/dashboard/docentes/PaginasDocentesCompletas.tsx` (1 alerta)
  - `src/app/docente/seleccionar-horarios/page.tsx` (2 alertas)
- Operaciones:
  - Crear docente
  - Registrar evaluación
  - Enviar solicitudes de horarios

#### 9. **Cursos** - 2 alertas
- Archivo: `src/app/dashboard/cursos/nuevo/page.tsx`
- Operaciones:
  - Crear curso

#### 10. **Autenticación** - 1 alerta
- Archivo: `src/app/auth/register/page.tsx`
- Operaciones:
  - Registro exitoso

---

### 🟨 PRIORIDAD BAJA (Operaciones Menos Frecuentes)

#### 11. **Configuración** - 2 alertas
- Archivo: `src/app/dashboard/configuracion/PaginasConfiguracion.tsx`

#### 12. **Notificaciones** - 2 alertas
- Archivo: `src/app/dashboard/notificaciones/page.tsx`

#### 13. **Reportes** - 10+ alertas
- Archivos en `src/app/dashboard/reportes/`
  - `page.tsx` (3 alertas)
  - `laboratorio/page.tsx` (2 alertas)
  - `gestion/page.tsx` (2 alertas)
  - `docente/page.tsx` (2 alertas)
  - `aula/page.tsx` (3 alertas)
  - `vista-docente/page.tsx` (1 alerta)

#### 14. **Otros** - 4 alertas
- `src/app/dashboard/PaginasEspecificas.tsx`
- `src/app/dashboard/PaginasComplementarias.tsx`
- `src/app/dashboard/PaginasAdicionales.tsx`
- `src/hooks/HooksEspecializados.ts`

---

## 🔄 Orden Recomendado de Implementación

### Fase 1: Fundamentos (5-7 horas)
1. ✅ `src/app/dashboard/usuarios/page.tsx` - Gestión de usuarios
2. ✅ `src/app/dashboard/ambientes/page.tsx` - Ambientes básicos
3. ✅ `src/app/dashboard/grupos/page.tsx` - Grupos básicos

**Por qué**: Estos son patrones simples (crear, actualizar, eliminar) que establecen el patrón reutilizable.

### Fase 2: Horarios y Docentes (7-9 horas)
4. `src/app/dashboard/horarios/page.tsx` - Gestión de horarios
5. `src/app/dashboard/docentes/nuevo/page.tsx` - Crear docentes
6. `src/app/dashboard/docentes/ventanas/page.tsx` - Asignar horarios en ventanas

**Por qué**: Operaciones complejas pero críticas para el flujo principal.

### Fase 3: Entidades Complementarias (5-7 horas)
7. `src/app/dashboard/periodos/page.tsx` - Períodos académicos
8. `src/app/dashboard/solicitudes/page.tsx` - Solicitudes
9. `src/app/dashboard/ventanas/page.tsx` - Ventanas de atención

**Por qué**: Operaciones de soporte que mejoran la UX general.

### Fase 4: Finalización (5-7 horas)
10. Todos los archivos de `reportes/`
11. Archivos complementarios (`PaginasEspecificas.tsx`, etc.)
12. Validación y pruebas

---

## 💡 Ejemplos de Implementación

### Ejemplo 1: Crear Recurso (CREATE)

```typescript
const handleCrearAmbiente = async (datos) => {
  try {
    const response = await fetch('/api/ambientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const data = await response.json();

    if (data.exito) {
      // ✅ NUEVO: Alerta mejorada
      exito(
        '✅ Ambiente creado',
        `El ambiente "${datos.nombre}" ha sido creado exitosamente`
      );
      cargarAmbientes();
    } else {
      // ❌ NUEVO: Error mejorado
      error(
        '❌ Error al crear ambiente',
        data.mensaje || 'No pudimos crear el ambiente'
      );
    }
  } catch (err) {
    error(
      '❌ Error inesperado',
      'Ocurrió un error. Por favor intenta nuevamente'
    );
  }
};
```

### Ejemplo 2: Actualizar Recurso (UPDATE)

```typescript
const handleActualizarGrupo = async (id, datos) => {
  try {
    const response = await fetch(`/api/grupos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const data = await response.json();

    if (data.exito) {
      exito(
        '✅ Grupo actualizado',
        'Los cambios se han guardado correctamente'
      );
      cargarGrupos();
    } else {
      error(
        '❌ Error al actualizar',
        data.mensaje || 'No pudimos guardar los cambios'
      );
    }
  } catch (err) {
    error('❌ Error', 'Intenta nuevamente');
  }
};
```

### Ejemplo 3: Eliminar Recurso (DELETE)

```typescript
const handleEliminarHorario = async (id) => {
  if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return;

  try {
    const response = await fetch(`/api/horarios/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.exito) {
      exito(
        '✅ Horario eliminado',
        'El horario ha sido eliminado del sistema'
      );
      cargarHorarios();
    } else {
      error(
        '❌ No se pudo eliminar',
        data.mensaje || 'Intenta nuevamente'
      );
    }
  } catch (err) {
    error('❌ Error', 'Ocurrió un error al eliminar');
  }
};
```

### Ejemplo 4: Acción con Validación

```typescript
const handleAprobarSolicitud = async (id) => {
  try {
    const response = await fetch(`/api/solicitudes/${id}/aprobar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentario: '' })
    });

    const data = await response.json();

    if (data.exito) {
      exito(
        '✅ Solicitud aprobada',
        'La solicitud ha sido aprobada exitosamente'
      );
      cargarSolicitudes();
    } else {
      error(
        '❌ Error al aprobar',
        data.mensaje || 'No pudimos aprobar la solicitud'
      );
    }
  } catch (err) {
    error('❌ Error inesperado', 'Por favor intenta nuevamente');
  }
};
```

---

## 🎨 Tipos de Alertas Disponibles

```typescript
// Éxito (verde)
exito('✅ Título', 'Mensaje descriptivo');

// Error (rojo)
error('❌ Título', 'Mensaje descriptivo');

// Advertencia (amarillo/naranja)
advertencia('⚠️ Título', 'Mensaje descriptivo');

// Información (azul)
info('ℹ️ Título', 'Mensaje descriptivo');
```

---

## 📝 Checklist de Implementación

- [ ] Fase 1: Usuarios, Ambientes, Grupos
- [ ] Fase 2: Horarios, Docentes, Ventanas
- [ ] Fase 3: Períodos, Solicitudes
- [ ] Fase 4: Reportes y complementarios
- [ ] Validación: Probar todas las alertas
- [ ] Testing: Verificar estilos en diferentes tamaños
- [ ] Documentación: Actualizar si es necesario

---

## 🚀 Beneficios de Esta Implementación

✅ **Experiencia del usuario mejorada** - Alertas profesionales sin popups
✅ **Apariencia consistente** - Las mismas alertas en todo el sistema
✅ **Mejor UX visual** - Animaciones suave y diseño moderno
✅ **Mejor accesibilidad** - Las alertas se auto-descartan después de 5s
✅ **Fácil mantenimiento** - Un único patrón reutilizable
✅ **Escalable** - Fácil de extender con nuevos tipos de alertas

---

**Última actualización**: 18 de mayo, 2026
**Estado**: Plan completo, listo para implementación
**Tiempo estimado**: 24-32 horas para completar todas las fases
