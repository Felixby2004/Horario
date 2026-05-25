# 📋 Sistema de Disponibilidad y Convocatoria Escalonada

## 📌 Descripción General

Este sistema permite a los docentes registrar su disponibilidad de horarios antes del ciclo académico y que la secretaría asigne citaciones escalonadas (turnos de 15 minutos) para la asignación de horarios, ordenadas por criterios de prioridad como antigüedad y categoría.

---

## 🏗️ Arquitectura del Sistema

### Fases del Proceso

```
1. FASE DE DISPONIBILIDAD (Admin crea fase)
   ↓
2. DOCENTES REGISTRAN DISPONIBILIDAD (Durante período abierto)
   ↓
3. ADMIN PROCESA DISPONIBILIDAD (Cierra fase y genera datos)
   ↓
4. SECRETARIA CREA CITACIONES (Asigna docentes a turnos)
   ↓
5. DOCENTES CONFIRMAN/RECHAZAN CITACIONES
   ↓
6. SEGUIMIENTO Y RECORDATORIOS AUTOMÁTICOS
```

---

## 📊 Modelos de Datos

### 1. **FaseDisponibilidad**
Controla el período en que los docentes pueden registrar disponibilidad.

```sql
CREATE TABLE fase_disponibilidad (
  id_fase_disponibilidad SERIAL PRIMARY KEY,
  id_periodo INT NOT NULL UNIQUE,
  estado ENUM ('no_iniciada', 'abierta', 'cerrada', 'procesada'),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  bloques_tiempo VARCHAR(50), -- Intervalo en minutos (30, 15, etc.)
  instrucciones TEXT,
  activo BOOLEAN,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

### 2. **DisponibilidadDocenteRegistro**
Registra la matriz de disponibilidad de cada docente.

```sql
CREATE TABLE disponibilidad_docente_registro (
  id_registro SERIAL PRIMARY KEY,
  id_docente INT,
  id_fase INT,
  matriz_disponibilidad JSONB, -- {"lunes": [T,T,F,T,...], "martes": [...]}
  bloques_preferidos JSONB,
  notas VARCHAR(500),
  completado BOOLEAN,
  fecha_registro TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

### 3. **CitacionDocente**
Representa la cita programada de un docente para asignación de horarios.

```sql
CREATE TABLE citacion_docente (
  id_citacion SERIAL PRIMARY KEY,
  id_docente INT,
  id_periodo INT,
  id_ventana INT,
  fecha_citacion DATE,
  hora_inicio VARCHAR(5),
  hora_fin VARCHAR(5),
  numero_orden_turno INT,
  estado ENUM ('programada', 'confirmada_docente', 'rechazada', 'completada', 'cancelada'),
  confirmado_docente BOOLEAN,
  fecha_confirmacion TIMESTAMP,
  razon_rechazo VARCHAR(300),
  observaciones TEXT,
  notificacion_enviada BOOLEAN,
  recordatorio_enviado BOOLEAN,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

### 4. **ConfiguracionTurnosAtencion**
Configura detalles de turnos para cada ventana de atención.

```sql
CREATE TABLE configuracion_turnos_atencion (
  id_configuracion SERIAL PRIMARY KEY,
  id_ventana INT UNIQUE,
  minutos_por_turno INT DEFAULT 15,
  cantidad_turnos INT,
  permitir_reprogramacion BOOLEAN DEFAULT true,
  dias_previos_minimo INT DEFAULT 1,
  activo BOOLEAN,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

### 5. **HistorialCitacion**
Auditoría de cambios en citaciones.

```sql
CREATE TABLE historial_citacion (
  id_historial SERIAL PRIMARY KEY,
  id_citacion INT,
  accion VARCHAR(50), -- 'crear', 'programar', 'confirmar', 'rechazar', etc.
  estado_anterior ENUM,
  estado_nuevo ENUM,
  cambios JSONB,
  razon TEXT,
  usuario_id INT,
  fecha_registro TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Fase de Disponibilidad

#### **GET /api/disponibilidad/fase**
Obtiene información de la fase de disponibilidad de un período.

```bash
GET /api/disponibilidad/fase?idPeriodo=1
```

**Respuesta:**
```json
{
  "id_fase_disponibilidad": 1,
  "id_periodo": 1,
  "estado": "abierta",
  "fecha_inicio": "2026-05-20T00:00:00Z",
  "fecha_fin": "2026-05-25T00:00:00Z",
  "bloques_tiempo": "30",
  "instrucciones": "Selecciona tu disponibilidad...",
  "activo": true
}
```

#### **POST /api/disponibilidad/fase**
Crea una nueva fase (solo admin/coordinador).

```bash
POST /api/disponibilidad/fase
```

**Body:**
```json
{
  "idPeriodo": 1,
  "fechaInicio": "2026-05-20T08:00:00Z",
  "fechaFin": "2026-05-25T18:00:00Z",
  "bloquesTiempo": 30,
  "instrucciones": "Registra tu disponibilidad de horarios..."
}
```

#### **PUT /api/disponibilidad/fase**
Actualiza estado de la fase.

```bash
PUT /api/disponibilidad/fase
```

**Body:**
```json
{
  "idFase": 1,
  "estado": "abierta"
}
```

---

### Registro de Disponibilidad (Docente)

#### **GET /api/disponibilidad/registro**
Obtiene el registro de disponibilidad del docente actual.

```bash
GET /api/disponibilidad/registro?idFase=1
```

#### **POST /api/disponibilidad/registro**
Registra la disponibilidad del docente.

```bash
POST /api/disponibilidad/registro
```

**Body:**
```json
{
  "idFase": 1,
  "matrizDisponibilidad": {
    "lunes": [true, true, false, true, true, true, true, true, true, true],
    "martes": [true, true, true, false, true, true, true, true, true, true],
    "miércoles": [true, true, true, true, false, true, true, true, true, true],
    "jueves": [true, true, true, true, true, true, true, true, false, true],
    "viernes": [false, true, true, true, true, true, true, true, true, true],
    "sábado": [false, false, false, false, false, false, false, false, false, false]
  },
  "bloques_preferidos": {
    "matutinos": ["08:00-10:00", "10:00-12:00"],
    "vespertinos": []
  },
  "notas": "Prefiero bloques matutinos"
}
```

---

### Citaciones

#### **GET /api/citaciones**
Obtiene citaciones del docente actual o todas las del período (admin).

```bash
GET /api/citaciones?idPeriodo=1&estado=programada
GET /api/citaciones?idPeriodo=1&idDocente=5 # Solo admin
```

**Respuesta:**
```json
[
  {
    "id_citacion": 1,
    "id_docente": 5,
    "fecha_citacion": "2026-05-28",
    "hora_inicio": "08:00",
    "hora_fin": "08:15",
    "numero_orden_turno": 1,
    "estado": "programada",
    "confirmado_docente": false,
    "docente": {
      "codigo_docente": "D001",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "categoria": "principal",
      "antigued dad": 10
    }
  }
]
```

#### **POST /api/citaciones**
Crea citaciones escalonadas (solo admin).

```bash
POST /api/citaciones
```

**Body:**
```json
{
  "idVentana": 1,
  "docentes": [
    { "id_docente": 5, "numero_orden_turno": 1 },
    { "id_docente": 8, "numero_orden_turno": 2 },
    { "id_docente": 12, "numero_orden_turno": 3 }
  ],
  "observaciones": "Citaciones generadas basadas en disponibilidad"
}
```

#### **PUT /api/citaciones**
Actualiza estado de citación (confirmar, rechazar, etc.).

```bash
PUT /api/citaciones
```

**Body:**
```json
{
  "idCitacion": 1,
  "confirmadoDocente": true
}
```

O para rechazar:
```json
{
  "idCitacion": 1,
  "estado": "rechazada",
  "razonRechazo": "Conflicto con otra actividad"
}
```

---

### Procesamiento de Disponibilidad

#### **POST /api/disponibilidad/procesar**
Procesa registros de disponibilidad y genera citaciones automáticamente (solo admin).

```bash
POST /api/disponibilidad/procesar
```

**Body:**
```json
{
  "idFase": 1,
  "criterioOrdenamiento": "combinado" // 'antiguedad', 'categoria', 'combinado'
}
```

**Respuesta:**
```json
{
  "mensaje": "Disponibilidad procesada y citaciones generadas",
  "citacionesCreadas": 45,
  "docentesProcesados": 50,
  "resultados": [...]
}
```

#### **GET /api/disponibilidad/procesar/estado**
Obtiene estado de procesamiento de una fase.

```bash
GET /api/disponibilidad/procesar/estado?idFase=1
```

---

### Recordatorios

#### **POST /api/citaciones/recordatorios**
Envía recordatorios a docentes 24 horas antes de su citación (para cron jobs).

```bash
POST /api/citaciones/recordatorios
Authorization: Bearer {CRON_SECRET}
```

#### **GET /api/citaciones/recordatorios/pendientes**
Obtiene cantidad de recordatorios pendientes.

```bash
GET /api/citaciones/recordatorios/pendientes
```

---

## 🎨 Componentes React

### 1. **MatrizDisponibilidad**
Componente para seleccionar disponibilidad en matriz de días/horas.

```tsx
import MatrizDisponibilidad from '@/components/disponibilidad/MatrizDisponibilidad';

<MatrizDisponibilidad
  bloquesTiempo={30}
  horaInicio="08:00"
  horaFin="18:00"
  onSeleccion={(matriz) => console.log(matriz)}
  matrizInicial={datosExistentes}
/>
```

### 2. **RegistroDisponibilidad**
Panel completo para que docentes registren disponibilidad.

```tsx
import RegistroDisponibilidad from '@/components/disponibilidad/RegistroDisponibilidad';

<RegistroDisponibilidad idFase={1} />
```

### 3. **GeneradorCitaciones**
Panel para secretaría para generar citaciones escalonadas.

```tsx
import GeneradorCitaciones from '@/components/citaciones/GeneradorCitaciones';

<GeneradorCitaciones idPeriodo={1} idVentana={1} />
```

### 4. **MisCitaciones**
Panel para docentes para ver y gestionar sus citaciones.

```tsx
import MisCitaciones from '@/components/citaciones/MisCitaciones';

<MisCitaciones idPeriodo={1} />
```

---

## 🔄 Flujo Completo de Uso

### PASO 1: Administrador crea la fase de disponibilidad

```bash
POST /api/disponibilidad/fase
{
  "idPeriodo": 1,
  "fechaInicio": "2026-05-20T08:00:00Z",
  "fechaFin": "2026-05-25T18:00:00Z",
  "bloquesTiempo": 30,
  "instrucciones": "Registra tu disponibilidad..."
}
```

### PASO 2: Administrador abre la fase

```bash
PUT /api/disponibilidad/fase
{
  "idFase": 1,
  "estado": "abierta"
}
```

### PASO 3: Docentes registran disponibilidad

```bash
POST /api/disponibilidad/registro
{
  "idFase": 1,
  "matrizDisponibilidad": { ... },
  "notas": "..."
}
```

### PASO 4: Administrador cierra la fase

```bash
PUT /api/disponibilidad/fase
{
  "idFase": 1,
  "estado": "cerrada"
}
```

### PASO 5: Administrador procesa disponibilidad

```bash
POST /api/disponibilidad/procesar
{
  "idFase": 1,
  "criterioOrdenamiento": "combinado"
}
```

### PASO 6: Secretaría genera citaciones

Usa el componente **GeneradorCitaciones** o:

```bash
POST /api/citaciones
{
  "idVentana": 1,
  "docentes": [
    { "id_docente": 5, "numero_orden_turno": 1 },
    ...
  ]
}
```

### PASO 7: Se envían notificaciones automáticamente

Las notificaciones se envían via email cuando se crean las citaciones.

### PASO 8: Docentes confirman/rechazan

```bash
PUT /api/citaciones
{
  "idCitacion": 1,
  "confirmadoDocente": true
}
```

### PASO 9: Sistema envía recordatorios

```bash
POST /api/citaciones/recordatorios
Authorization: Bearer {TOKEN}
```

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Email para notificaciones
GMAIL_USER=tu_correo@gmail.com
GMAIL_PASSWORD=tu_contraseña_aplicacion

# Token para cron jobs
CRON_SECRET=tu_token_secreto

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/horarios_unt
```

### Configurar Cron Jobs (Recordatorios Automáticos)

Si usas **Vercel Cron Functions**:

```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/citaciones/recordatorios",
      "schedule": "0 8 * * *" // Diariamente a las 8 AM
    }
  ]
}
```

O usar **node-cron** en un servidor independiente:

```javascript
import cron from 'node-cron';

cron.schedule('0 8 * * *', async () => {
  await fetch('http://localhost:3000/api/citaciones/recordatorios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
});
```

---

## 📊 Criterios de Prioridad para Ordenamiento

### 1. **Por Antigüedad**
Los docentes con más años de servicio obtienen turnos más tempranos.

### 2. **Por Categoría**
Orden de prioridad: Principal > Asociado > Auxiliar > Jefe de Práctica

### 3. **Combinado** (Recomendado)
1. Primero por categoría
2. Luego por antigüedad dentro de la misma categoría

---

## 📝 Ejemplo de Matriz de Disponibilidad

```json
{
  "lunes": [
    true,  // 08:00-08:30
    true,  // 08:30-09:00
    false, // 09:00-09:30 (No disponible)
    true,  // 09:30-10:00
    true,  // 10:00-10:30
    true,  // 10:30-11:00
    false, // 11:00-11:30
    true,  // 11:30-12:00
    false, // 12:00-12:30 (Almuerzo)
    false  // 12:30-13:00
  ],
  "martes": [true, true, true, false, true, true, true, true, false, false],
  "miércoles": [true, true, true, true, true, true, true, true, false, false],
  "jueves": [true, true, false, true, true, true, false, true, true, true],
  "viernes": [false, true, true, true, true, true, true, true, true, false],
  "sábado": [false, false, false, false, false, false, false, false, false, false]
}
```

---

## 🔔 Sistema de Notificaciones

### Eventos que Generan Notificaciones

1. **Citación Asignada**: Se envía cuando se crea la citación
2. **Recordatorio 24h Antes**: Se envía automáticamente
3. **Confirmación Recibida**: Cuando el docente confirma
4. **Cambios de Programa**: Si se modifica fecha/hora
5. **Citación Cancelada**: Notificación de cancelación

### Canales Disponibles

- 📧 Email (vía Gmail)
- 📱 WhatsApp (opcional, requiere API Business)
- 💬 Telegram (opcional, requiere Bot Token)

---

## ✅ Ventajas del Sistema

✅ **Registro previo de disponibilidad**: Los docentes pueden planificar mejor
✅ **Citaciones escalonadas**: Evita congestión en un solo horario
✅ **Priorización inteligente**: Respeta antigüedad y categoría
✅ **Notificaciones automáticas**: Recordatorios por email
✅ **Confirmación flexible**: Docentes pueden confirmar o rechazar
✅ **Auditoría completa**: Historial de todos los cambios
✅ **Fácil administración**: Panel intuitivo para secretaría

---

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo del Sistema de Gestión de Horarios.

---

**Última actualización**: Mayo 24, 2026
**Versión**: 1.0.0
