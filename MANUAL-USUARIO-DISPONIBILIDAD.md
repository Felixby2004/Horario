# 👥 Manual de Usuario: Disponibilidad y Convocatoria de Horarios

## 📚 Tabla de Contenidos

1. [Para Docentes](#para-docentes)
2. [Para la Secretaría](#para-la-secretaría)
3. [Para Administradores](#para-administradores)
4. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 👨‍🏫 Para Docentes

### 1️⃣ Registrar Tu Disponibilidad

#### ¿Cuándo puedo hacerlo?
- Durante el período de **Fase de Disponibilidad** establecido por administración
- Generalmente **antes de iniciar el ciclo académico**
- El sistema mostrará las fechas disponibles

#### Pasos para registrar:

1. **Inicia sesión** en el sistema con tu usuario de docente
2. Dirígete a **Panel → Horarios → Registrar Disponibilidad**
3. Verás una **matriz de días y horas**
4. **Selecciona los bloques horarios** en los que estás disponible:
   - ✅ Verde = Disponible
   - ❌ Gris = No disponible
5. Puedes agregar **notas adicionales** si lo deseas
6. Haz clic en **"Guardar Disponibilidad"**

#### 📋 Ejemplo de Matriz

```
      08:00  08:30  09:00  09:30  10:00  ...
Lunes   ✅     ✅     ❌     ✅     ✅
Mar.    ✅     ✅     ✅     ❌     ✅
Mié.    ✅     ✅     ✅     ✅     ✅
Jue.    ✅     ✅     ❌     ✅     ✅
Vie.    ❌     ✅     ✅     ✅     ✅
Sab.    ❌     ❌     ❌     ❌     ❌
```

#### 💡 Consejos

- Sé **realista** con tu disponibilidad
- **No marques** como disponible si tienes otras responsabilidades
- Puedes usar **"Notas"** para explicar tus restricciones (ej: "Prefiero mañanas")
- Si cometes un error, puedes **actualizar** tu disponibilidad cuantas veces quieras

---

### 2️⃣ Ver tu Citación

#### ¿Qué es una citación?
Una **citación** es una cita programada por la secretaría para que asistas a la **asignación de horarios** en un horario específico de 15 minutos.

#### Pasos para ver tu citación:

1. Inicia sesión en el sistema
2. Ve a **Panel → Horarios → Mis Citaciones**
3. Verás una **tarjeta con tu citación** que incluye:
   - 📅 **Fecha** de la cita
   - ⏰ **Hora** exacta (ej: 08:00 - 08:15)
   - 🎫 **Número de turno** (orden en que serás atendido)
   - 📝 **Estado**: Programada, Confirmada, Rechazada, etc.

#### 📌 Ejemplo de Citación

```
┌─────────────────────────────────────────┐
│ Turno #5                     [Programada]│
│                                         │
│ 📅 Martes, 28 de mayo de 2026          │
│ ⏰ 08:15 - 08:30                        │
│ 🎫 Número de Turno: 5                   │
│                                         │
│ [✓ Confirmar] [✕ Rechazar]              │
└─────────────────────────────────────────┘
```

---

### 3️⃣ Confirmar tu Citación

#### ¿Por qué debo confirmar?
Para que la secretaría sepa que **asistirás** a tu citación.

#### Pasos:

1. Ve a **"Mis Citaciones"**
2. Busca tu citación con estado **"Programada"**
3. Haz clic en el botón **"✓ Confirmar Asistencia"**
4. Verás un mensaje de confirmación

#### ✅ Confirmado
```
┌────────────────────────────────────┐
│ ✓ Tu asistencia ha sido confirmada │
└────────────────────────────────────┘
```

---

### 4️⃣ Rechazar tu Citación

#### ¿Cuándo puedo rechazarla?
Si **no puedes asistir** a la citación programada.

#### Pasos:

1. Ve a **"Mis Citaciones"**
2. Haz clic en **"✕ Rechazar"**
3. **Explica el motivo** de tu rechazo
4. Haz clic en **"Confirmar Rechazo"**
5. La secretaría será notificada para reprogramarte

#### 📝 Ejemplo de Rechazo

```
┌──────────────────────────────────────────┐
│ ¿Por qué rechazas esta citación?        │
│                                          │
│ [Cuadro de texto]                        │
│ Tengo clase hasta las 8:30 ese día       │
│                                          │
│ [Confirmar Rechazo] [Cancelar]           │
└──────────────────────────────────────────┘
```

---

### ⚠️ Lo Que Debes Saber

- **Confirmación obligatoria**: Es importante que confirmes O rechaces tu citación
- **Cambios de disponibilidad**: Si tu situación cambió después de registrarte, contacta con coordinación
- **Recordatorios**: Recibirás un email 24 horas antes de tu citación
- **Contacto**: Si tienes problemas, escribe a: horarios@unt.edu.pe

---

## 👩‍💼 Para la Secretaría

### 1️⃣ Crear una Fase de Disponibilidad

#### Acceso
Panel → Administración → Crear Fase de Disponibilidad

#### Pasos:

1. Haz clic en **"Nueva Fase"**
2. Completa los campos:
   - **Período Académico**: Selecciona el período
   - **Fecha Inicio**: Cuándo comienza el registro
   - **Fecha Fin**: Cuándo termina el registro
   - **Bloques de Tiempo**: Intervalo (30, 15 minutos)
   - **Instrucciones** (opcional): Indicaciones para docentes

3. Haz clic en **"Crear Fase"**

#### Ejemplo

```
Crear Nueva Fase de Disponibilidad
┌─────────────────────────────────────────┐
│ Período: 2026-II                        │
│ Fecha Inicio: 20/05/2026                │
│ Fecha Fin: 25/05/2026                   │
│ Bloques de Tiempo: 30 minutos           │
│ Instrucciones:                          │
│ [Por favor registra tu disponibilidad   │
│  horaria para el próximo semestre...]   │
│                                         │
│ [Crear] [Cancelar]                      │
└─────────────────────────────────────────┘
```

---

### 2️⃣ Abrir la Fase para Registro

#### Pasos:

1. Ve a **"Fases de Disponibilidad"**
2. Encuentra la fase creada (estado: "No Iniciada")
3. Haz clic en **"Editar"**
4. Cambia el estado a **"Abierta"**
5. Haz clic en **"Guardar"**

#### 📊 Monitoreo de Registro

En la misma pantalla puedes ver:
- **Total de docentes**: Cuántos deben registrarse
- **Registros completados**: Cuántos ya se registraron
- **Porcentaje**: % de completación
- **Lista de docentes**: Quiénes aún no se han registrado

```
Estado de Registro de Disponibilidad
┌─────────────────────────────────────┐
│ Total de Docentes: 50               │
│ Completados: 45 (90%)               │
│ Pendientes: 5 (10%)                 │
│                                     │
│ ⚠️ Docentes Pendientes:              │
│ • Dr. Juan García                   │
│ • Dra. María López                  │
│ • Dr. Carlos Mendez                 │
│ • Dra. Ana Ruiz                     │
│ • Dr. Pedro Sánchez                 │
└─────────────────────────────────────┘
```

---

### 3️⃣ Cerrar la Fase

#### Pasos:

1. Una vez que el período de registro ha terminado
2. Ve a **"Fases de Disponibilidad"**
3. Haz clic en **"Editar"** en la fase
4. Cambia el estado a **"Cerrada"**
5. Haz clic en **"Guardar"**

#### 📌 Nota
Asegúrate que todos los docentes que necesitas hayan registrado antes de cerrar.

---

### 4️⃣ Generar Citaciones Escalonadas

#### Acceso
Panel → Horarios → Generar Citaciones

#### Pasos:

1. **Selecciona la Ventana de Atención**:
   - Elige para cuál ventana vas a programar citas
   - Muestra: Fecha y horario de la ventana

2. **Busca docentes**:
   - Usa la barra de búsqueda para encontrar docentes
   - Filtra por nombre, apellido o código

3. **Selecciona docentes** a citar:
   - Haz clic en cada docente que quieras incluir
   - Verás su número de turno asignado automáticamente

4. **Ordena según criterios**:
   - Haz clic en **"Ordenar por Categoría + Antigüedad"** (recomendado)
   - El sistema reordena automáticamente respetando prioridades

5. **Revisa la lista** de citados:
   - Verifica que el orden sea correcto
   - Puedes agregar o quitar docentes

6. **Haz clic en "Generar Citaciones"**

#### 📋 Ejemplo de Selección

```
Generador de Citaciones Escalonadas
┌─────────────────────────────────────────┐
│ Ventana: Nombrados Principales          │
│ Fecha: 28/05/2026, 08:00-13:00         │
│                                         │
│ Docentes Disponibles (50)               │
│ ┌─────────────────────────────────────┐ │
│ │ Dr. Juan Pérez - Principal - 15 años│ │
│ │ Código: D001 [✓] Turno: 1           │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Dr. Carlos Gómez - Asociado - 10 a. │ │
│ │ Código: D002 [ ] Turno: --          │ │
│ └─────────────────────────────────────┘ │
│ ... más docentes                        │
│                                         │
│ [Ordenar por Categoría] [Generar ✓]    │
└─────────────────────────────────────────┘
```

---

### 5️⃣ Monitorear Confirmaciones

#### Acceso
Panel → Horarios → Citaciones → Estado de Confirmaciones

#### Información disponible:
- **Total de citaciones**: Cuántas se generaron
- **Confirmadas**: Docentes que ya confirmaron
- **Pendientes**: Aún no confirman
- **Rechazadas**: Docentes que rechazaron

#### 📊 Ejemplo

```
Estado de Confirmaciones
┌──────────────────────────────────┐
│ Total: 50                         │
│ Confirmadas: 45 (90%)  ✓          │
│ Pendientes: 4 (8%)     ⏳         │
│ Rechazadas: 1 (2%)     ✕          │
│                                  │
│ Docentes Pendientes:             │
│ • Dr. García (Turno 5)           │
│ • Dra. López (Turno 8)           │
│ • Dr. Méndez (Turno 12)          │
│ • Dra. Ruiz (Turno 15)           │
└──────────────────────────────────┘
```

---

### 6️⃣ Reprogramar Citaciones Rechazadas

#### Pasos:

1. Ve a **"Citaciones Rechazadas"**
2. Para cada una, verás el **motivo del rechazo**
3. Puedes:
   - **Reprogramar**: Asignar nuevo turno en otra ventana
   - **Contactar**: Enviar mensaje al docente

#### ✉️ Ejemplo de Rechazo

```
Citación Rechazada
┌─────────────────────────────────────┐
│ Dr. Pedro Sánchez                   │
│ Turno Original: 20                  │
│ Motivo: "Tengo otra actividad"      │
│                                     │
│ [Reprogramar] [Contactar] [Ver más] │
└─────────────────────────────────────┘
```

---

## 🔧 Para Administradores

### Configuraciones Avanzadas

#### 1. Minutos por Turno
- Ir a: Configuración → Turnos de Atención
- Por defecto: **15 minutos**
- Puedes cambiar a 10, 20, 30, 60 minutos

#### 2. Permitir Reprogramación
- Ir a: Configuración → Turnos de Atención
- Por defecto: **Habilitado**
- Docentes pueden reprogramar si no pueden asistir

#### 3. Días Previos Mínimos
- Ir a: Configuración → Turnos de Atención
- Por defecto: **1 día**
- Tiempo mínimo antes de la cita para confirmar

#### 4. Envío Automático de Recordatorios
- Los recordatorios se envían **24 horas antes** automáticamente
- Puedes revisar logs en: Auditoría → Notificaciones

---

## ❓ Preguntas Frecuentes

### Docentes

**P: ¿Qué pasa si no registra disponibilidad?**
R: El sistema no podrá generarte una citación. Procura registrarte dentro del período establecido.

**P: ¿Puedo cambiar mi disponibilidad después de registrarla?**
R: Sí, puedes actualizar tu disponibilidad cuantas veces quieras **mientras la fase esté abierta**.

**P: ¿Qué significan los colores en la matriz?**
R: 
- ✅ **Verde**: Disponible para esa hora
- ❌ **Gris**: No disponible para esa hora

**P: ¿Cuánto dura cada turno?**
R: Por defecto **15 minutos**, pero puede variar según configuración.

**P: ¿Qué pasa si no confirmo mi citación?**
R: Recibirás recordatorios por email. Es importante que confirmes o rechaces para que la secretaría sepa tu intención.

**P: ¿Puedo cambiar la fecha/hora de mi citación?**
R: Si tiene que rechazarla, la secretaría puede reprogramarte en otro turno disponible.

---

### Secretaría

**P: ¿Cómo sé si todos los docentes se registraron?**
R: Ve a la fase de disponibilidad y verás un porcentaje de completación con lista de pendientes.

**P: ¿Qué criterio de ordenamiento debo usar?**
R: **Combinado** (Categoría + Antigüedad) es la opción más equilibrada y respeta las prioridades institucionales.

**P: ¿Qué pasa si un docente rechaza múltiples citaciones?**
R: Puedes contactarlo directamente para entender sus restricciones y encontrar un horario que funcione.

**P: ¿Puedo generar más citaciones después?**
R: Sí, puedes generar citaciones en múltiples ventanas de atención para diferentes grupos de docentes.

**P: ¿Cómo se calcula la hora final del turno?**
R: Se suma el intervalo de minutos a la hora de inicio. Ej: 08:00 + 15 min = turno 08:00-08:15.

---

### Administradores

**P: ¿Cuál es el máximo número de docentes que puede procesar?**
R: El sistema está optimizado para **hasta 500 docentes** por período sin problemas de rendimiento.

**P: ¿Hay auditoría de cambios?**
R: Sí, todos los cambios se registran en Auditoría → Historial de Citaciones.

**P: ¿Los recordatorios se envían automáticamente?**
R: Sí, mediante un cron job que verifica diariamente. Asegúrate de configurar correctamente el CRON_SECRET.

---

## 📞 Contacto y Soporte

Si tienes problemas o dudas:
- 📧 Email: horarios@unt.edu.pe
- 🕐 Horario de atención: L-V 08:00-17:00
- 🏢 Ubicación: Oficina de Coordinación Académica

---

**Última actualización**: Mayo 24, 2026
