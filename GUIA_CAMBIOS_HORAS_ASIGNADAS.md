# ✅ Sistema de Asignación de Cursos - Correción y Mejoras Implementadas

## 🔧 Problemas Resueltos

### 1. **Error de Prisma en POST /api/docentes/asignar-cursos**
- ❌ **Problema**: El API lanzaba error de tipo de campo al intentar actualizar `docente.horas_totales_asignadas`
- ✅ **Solución**: Se rediseñó la lógica para calcular correctamente las horas basadas en `horas_asignadas` específicas

### 2. **Falta de Soporte para Asignación Parcial de Horas**
- ❌ **Problema**: El sistema asumía que un docente enseña TODAS las horas de un curso
- ✅ **Solución**: Se agregó campo `horas_asignadas` en `DocenteCurso` para especificar exactamente cuántas horas enseña cada docente

---

## 📋 Cambios Realizados

### Base de Datos
```sql
-- archivo: prisma/schema.prisma
model DocenteCurso {
  ...
  horas_asignadas   Int       @default(0)  // ← NUEVO CAMPO
  ...
}

-- archivo: prisma/migrations/20260518_add_horas_asignadas_docente_curso/migration.sql
ALTER TABLE "docente_curso" ADD COLUMN "horas_asignadas" INTEGER NOT NULL DEFAULT 0;
```

### API Endpoints

#### POST /api/docentes/asignar-cursos (MODIFICADO)
**Request Body:**
```json
{
  "id_docente": 1,
  "id_curso": 101,
  "tipo_clase": "teoria",
  "horas_asignadas": 4  // ← NUEVO: Cuántas horas enseña este docente
}
```

**Validaciones Implementadas:**
- ✓ `horas_asignadas` es requerido
- ✓ `horas_asignadas` debe estar entre 1 y 40
- ✓ Total de horas no debe exceder `docente.horas_maximas_semanales`

**Lógica Corregida:**
```javascript
// ANTES (incorrecto):
const horasTotalesNuevas = horasActuales + horasCurso; // Usaba todas las horas del curso

// AHORA (correcto):
const horasTotalesNuevas = horasActuales + horas_asignadas; // Usa solo las horas que asigna
```

#### GET /api/docentes/asignar-cursos (MODIFICADO)
**Response incluye:**
```json
{
  "exito": true,
  "datos": [
    {
      "id_docente_curso": 1,
      "tipo_clase": "teoria",
      "horas_asignadas": 4,  // ← NUEVO: Se retorna el valor asignado
      "curso": { ... }
    }
  ],
  "horas_totales": 4  // ← AHORA: SUM(horas_asignadas)
}
```

#### DELETE /api/docentes/asignar-cursos (MODIFICADO)
- Recalcula `horas_totales_asignadas` usando `horas_asignadas` en lugar de horas del curso

### UI Dashboard
**Archivo**: `src/app/dashboard/docentes/asignar-cursos-nuevo/page.tsx`

**Nuevo Campo en Modal:**
```
Tipo de Clase: [Seleccionar]
¿Cuántas horas enseñará este docente? [input: 1-40]
  Máx: 6 hrs (según tipo seleccionado)
  Nota: Si hay 6 horas de Teoría, pueden distribuirse entre docentes (ej: 4 + 2 horas)
```

**Validaciones del Frontend:**
- ✓ Valida que `horas_asignadas > 0`
- ✓ Valida que no exceda máximo permitido por tipo
- ✓ Calcula y muestra resumen en tiempo real
- ✓ Botón de asignación deshabilitado si no hay horas especificadas

**Tabla de Cursos Asignados - Nueva Columna:**
| Código | Nombre | Horas Totales | Tipo | **Horas a Enseñar** | Acción |
|--------|--------|---------------|------|-------------------|--------|
| CC-105 | Ing. Software | 6 hrs | Teoría | **4 hrs** | ❌ |

---

## 🎯 Casos de Uso Soportados

### Caso 1: Múltiples docentes en una modalidad
```
Curso: Análisis Matemático I (6 horas de Teoría)

Asignación:
- Docente A: 4 horas de Teoría
- Docente B: 2 horas de Teoría
Total: 6 horas cubiertas ✓

Cálculo de carga horaria:
- Docente A total: 4 horas (de este curso)
- Docente B total: 2 horas (de este curso)
```

### Caso 2: Control de capacidad
```
Docente X (máximo 40 horas/semana):
- Lunes-Viernes Curso A: 6 horas
- Lunes-Viernes Curso B: 4 horas
- Lunes-Viernes Curso C: 3 horas
Total: 13 horas ✓ (dentro de límite)

Intenta asignar Curso D (10 horas):
→ Error: Exceso de horas. Total sería 23 hrs (dentro de límite)
→ Éxito: Si suma es ≤ 40
```

### Caso 3: Desasignación
```
Docente Y tiene asignado:
- Curso A: 5 horas de Teoría
- Curso B: 3 horas de Laboratorio

Al desasignar Curso A:
- horas_totales_asignadas se recalcula: 3 (solo Curso B)
- Base de datos se actualiza correctamente
```

---

## 🧪 Cómo Probar

### 1. Verificar Base de Datos
```bash
# La columna horas_asignadas debe existir:
npx prisma studio

# O consultar directamente:
SELECT * FROM docente_curso LIMIT 5;
# Debe mostrar columna: horas_asignadas
```

### 2. Probar API POST
```bash
curl -X POST http://localhost:3000/api/docentes/asignar-cursos \
  -H "Content-Type: application/json" \
  -d '{
    "id_docente": 1,
    "id_curso": 101,
    "tipo_clase": "teoria",
    "horas_asignadas": 4
  }'
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "datos": {
    "id_docente_curso": 1,
    "horas_asignadas": 4,
    "tipo_clase": "teoria"
  },
  "mensaje": "Curso asignado exitosamente. Docente enseñará 4 horas en este curso."
}
```

### 3. Probar desde UI
1. Ir a Dashboard → Docentes
2. Click en "Asignar Cursos" para un docente
3. Click en "➕ Asignar" en un curso disponible
4. En el modal:
   - Seleccionar "Tipo de Clase"
   - Ingresar número de horas (1-max según tipo)
   - Ver resumen actualizado
   - Click "✅ Asignar X horas"

### 4. Errores Esperados
```
❌ "horas_asignadas es requerido"
   → No ingresaste horas o es 0

❌ "Las horas asignadas deben estar entre 1 y 40"
   → Número fuera de rango

❌ "Exceso de horas. Horas actuales: X, Horas a asignar: Y, Total: Z, Máximo permitido: 40"
   → Total excede el máximo del docente
```

---

## 📊 Estructura de Datos Actualizada

### DocenteCurso (antes y después)
```javascript
// ANTES:
{
  id_docente_curso: 1,
  id_docente: 1,
  id_curso: 101,
  tipo_clase: "teoria",
  experiencia_anios: 5,
  prioridad: 1
}

// AHORA:
{
  id_docente_curso: 1,
  id_docente: 1,
  id_curso: 101,
  tipo_clase: "teoria",
  horas_asignadas: 4,        // ← NUEVO
  experiencia_anios: 5,
  prioridad: 1
}
```

### Docente.horas_totales_asignadas (cálculo)
```javascript
// ANTES:
// Sumaba TODAS las horas de cada curso asignado (incorrecto)
horas_totales = cursos.map(c => c.horas_teoria + c.horas_lab + c.horas_prac).reduce(...)

// AHORA:
// Suma solo las horas_asignadas de cada DocenteCurso (correcto)
horas_totales = docenteCursos.map(dc => dc.horas_asignadas).reduce((a,b) => a+b, 0)
```

---

## ✅ Checklist de Verificación

- [x] Campo `horas_asignadas` agregado a schema Prisma
- [x] Migración creada y aplicada a base de datos
- [x] API POST ahora acepta `horas_asignadas`
- [x] API POST valida rango 1-40 y máximas del docente
- [x] API GET retorna `horas_asignadas` en respuesta
- [x] API DELETE recalcula correctamente
- [x] UI Modal pide `horas_asignadas` del usuario
- [x] UI muestra detalles de horas por tipo de clase
- [x] UI tabla muestra columna de horas a enseñar
- [x] Validaciones de error mejoradas
- [x] Mensajes de éxito más descriptivos
- [x] Sin errores de compilación TypeScript
- [x] Sistema de alertas integrado

---

## 🚀 Próximos Pasos (Opcionales)

1. **Reportes**: Crear reporte de distribución de horas por docente y curso
2. **Validación de cobertura**: Alertar si no se cubren todas las horas de un tipo de clase
3. **Historial**: Registrar cambios de asignación de horas
4. **Optimización**: Algoritmo genético podría considerar el campo `horas_asignadas`

