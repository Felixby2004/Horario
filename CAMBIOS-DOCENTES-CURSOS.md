# Cambios Implementados - Sistema de Docentes y Grupos

## 📋 Resumen de Cambios

Se han implementado las siguientes mejoras al sistema de gestión de docentes:

### 1. **Control de Horas Totales por Docente** ✅
- **Campo agregado**: `horas_totales_asignadas` en el modelo Docente
- **Descripción**: Suma automática de horas de teoría, laboratorio y práctica de todos los cursos asignados a cada docente
- **Validación**: El sistema valida que el total de horas no exceda el máximo de horas semanales configurado por docente
- **Ubicación**: `prisma/schema.prisma` (línea con `horas_totales_asignadas`)

### 2. **Nueva API de Asignación de Cursos** 🔌
**Ruta**: `/api/docentes/asignar-cursos`

#### GET - Obtener cursos asignados
```
GET /api/docentes/asignar-cursos?id_docente=1
```
**Respuesta**:
```json
{
  "exito": true,
  "datos": [
    {
      "id_docente_curso": 1,
      "id_docente": 1,
      "id_curso": 5,
      "tipo_clase": "teoria",
      "experiencia_anios": 3,
      "prioridad": 1,
      "curso": {
        "codigo": "INF101",
        "nombre": "Programación I",
        "horas_teoria": 4,
        "horas_laboratorio": 2,
        "horas_practica": 0
      }
    }
  ],
  "horas_totales": 6
}
```

#### POST - Asignar curso a docente
```
POST /api/docentes/asignar-cursos
Content-Type: application/json

{
  "id_docente": 1,
  "id_curso": 5,
  "tipo_clase": "teoria",
  "experiencia_anios": 3,
  "prioridad": 1
}
```

**Validaciones**:
- ✓ Verifica que el docente exista
- ✓ Verifica que el curso exista
- ✓ Calcula las nuevas horas totales
- ✓ Valida que no excedan el máximo de horas semanales del docente

**Respuesta de error (si excede horas)**:
```json
{
  "error": "Exceso de horas. Horas asignadas: 30, Horas del curso: 15, Total: 45, Máximo permitido: 40",
  "horas_actuales": 30,
  "horas_curso": 15,
  "horas_totales": 45,
  "horas_maximas": 40
}
```

#### DELETE - Desasignar curso
```
DELETE /api/docentes/asignar-cursos
Content-Type: application/json

{
  "id_docente": 1,
  "id_curso": 5
}
```

### 3. **Nueva Página de Asignación de Cursos (Admin)** 📚
**Ruta**: `/dashboard/docentes/asignar-cursos-nuevo?id_docente=1`

**Características**:
- Visualizar horas máximas, asignadas y disponibles del docente
- Ver lista de cursos asignados con opción de desasignar
- Ver lista de cursos disponibles con opción de asignar
- Modal interactivo para asignar cursos con validación previa
- Alertas mejoradas para cada acción

**Acceso**: Desde la página de docentes → Botón "📚 Cursos"

### 4. **Nueva Página para Docentes: Mis Cursos** 👨‍🏫
**Ruta**: `/docente/mis-cursos`

**Características**:
- Los docentes pueden ver solo sus cursos asignados
- Información detallada de cada curso (horas, ciclo, créditos)
- Visualización de horas totales asignadas
- Enlace directo a "Mis Horarios"
- Solo accesible para docentes autenticados

### 5. **Nueva API de Información del Docente Logueado** 🔐
**Ruta**: `/api/docentes/me?id_docente=1`

**Descripción**: Obtiene la información completa del docente autenticado incluyendo cursos asignados

**Respuesta**:
```json
{
  "exito": true,
  "datos": {
    "id_docente": 1,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "codigo_docente": "DOC001",
    "horas_maximas_semanales": 40,
    "horas_totales_asignadas": 15,
    "cursos": [
      {
        "id_docente_curso": 1,
        "curso": {
          "codigo": "INF101",
          "nombre": "Programación I",
          "horas_teoria": 4,
          "horas_laboratorio": 2,
          "horas_practica": 0
        }
      }
    ]
  }
}
```

### 6. **Sistema Mejorado de Alertas** 🔔
**Componentes**: 
- Hook: `useAlertasTemporales()` - En `src/hooks/useAlertasTemporales.ts`
- Componente: `ContenedorAlertas` - En `src/components/ui/ContenedorAlertas.tsx`

**Tipos de alertas**:
- ✅ **Éxito** (verde): Para operaciones completadas exitosamente
- ❌ **Error** (rojo): Para errores en operaciones
- ⚠️ **Advertencia** (amarillo): Para advirtencias o confirmaciones
- ℹ️ **Info** (azul): Para información general

**Características**:
- Aparecen en la esquina superior derecha
- Se desaparecen automáticamente después de 4 segundos (configurable)
- Animación suave de entrada
- Barra de progreso que indica tiempo restante
- Botón para cerrar manualmente
- No interfieren con la interacción del usuario

**Uso**:
```typescript
const { exito, error, advertencia, info } = useAlertasTemporales();

// Mostrar alerta de éxito
exito('Título', 'Mensaje de descripción', 4000); // duracion en ms

// Mostrar alerta de error
error('Error al guardar', 'El correo ya está registrado');

// Mostrar alerta de advertencia
advertencia('Confirmación', '¿Estás seguro?', 0); // 0 = sin auto-cierre

// Mostrar alerta de info
info('Información', 'Tu perfil ha sido actualizado');
```

**Implementación en página**:
```typescript
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';

export default function MiPagina() {
  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  return (
    <>
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />
      {/* Resto del contenido */}
    </>
  );
}
```

## 📦 Cambios en Base de Datos

### Nueva Migración
**Archivo**: `prisma/migrations/20260518_add_horas_totales_docente/migration.sql`

```sql
ALTER TABLE "docente" ADD COLUMN "horas_totales_asignadas" INTEGER NOT NULL DEFAULT 0;
```

### Ejecución de la migración
```bash
npx prisma migrate deploy
# o
npx prisma db push
```

## 🔄 Flujo de Trabajo Recomendado

### Para Administradores:
1. **Crear/Importar Docentes**: Ir a Dashboard → Docentes → Importar
2. **Asignar Cursos**: Ir a Dashboard → Docentes → Botón "📚 Cursos" del docente
3. **Configurar Horas Máximas**: Al importar, configurar `horas_maximas_semanales`
4. **Crear Grupos**: En la sección de Grupos
5. **Configurar Horarios**: Los docentes crearán sus solicitudes durante su ventana

### Para Docentes:
1. **Ver Cursos Asignados**: Panel → Mis Cursos (verán solo sus cursos)
2. **Solicitar Horarios**: Panel → Seleccionar Horarios (solo con cursos asignados)
3. **Ver Horarios Confirmados**: Panel → Mis Horarios

## ⚠️ Restricciones Implementadas

- **Docentes no pueden auto-asignarse cursos**: Solo administrador puede asignar
- **Validación de horas**: No se puede asignar un curso que haría exceder el límite máximo
- **Visibilidad limitada**: Los docentes solo ven sus propios cursos y horarios
- **Pre-requisito**: Se deben asignar cursos ANTES de que el docente solicite horarios

## 🐛 Consideraciones

1. **Recalculación de horas**: Se recalcula automáticamente al asignar o desasignar cursos
2. **Compatibilidad**: Los cambios son retroactivos con los docentes existentes (horas_totales_asignadas = 0)
3. **Sincronización**: Las horas mostradas en cada sección siempre coinciden con los datos de base de datos

## 📝 Próximas mejoras sugeridas

- [ ] Importación de cursos via CSV
- [ ] Exportación de asignaciones de docentes
- [ ] Reportes de carga de docentes
- [ ] Plantillas de asignación por carrera
- [ ] Notificaciones cuando se asignan/desasignan cursos

---

**Última actualización**: 18 de Mayo de 2026
**Versión**: 1.0
