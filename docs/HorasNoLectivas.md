# Implementación de Horas No Lectivas - UNT

## 1. Resumen General
Se implementa la funcionalidad para gestionar horas no lectivas, preparación y evaluación, y validación de carga académica para docentes de la UNT.

## 2. Reglas de Negocio

### 2.1 Cálculo de horas lectivas y preparación
**Horas Lectivas de Clase (HT + HP + HL):**  
Suma de todas las horas de teoría, práctica y laboratorio del docente en un período.

**Preparación y Evaluación (P&E):**  
- 50% de las horas lectivas (redondeado hacia arriba si es impar)
- No se agendan en el calendario
- Se registra como valor numérico en la carga académica

### 2.2 Rubros No Lectivos
| Rubro | Descripción | Datos de Sustento Requeridos |
|-------|-------------|-------------------------------|
| Tutoria / Consejería | Atención a estudiantes | Nombre curso, ciclo, cantidad alumnos |
| Investigación | Proyectos de investigación | Número inscripción, código PIC, título, duración |
| Responsabilidad Social | Proyectos con la comunidad | Nombre proyecto |
| Gestión y Gobierno | Cargos administrativos | Número resolución Decanal/Rectoral |
| Asesoría de Tesis / Jurado | Tesis y jurados | Número resolución |
| Perfeccionamiento | Estudios de posgrado | Nombre programa |

**Todos los rubros deben estar calendarizados semanalmente** (día, hora inicio, hora fin)

### 2.3 Metas de Carga Académica
| Tipo de Dedicación | Horas Totales Requeridas |
|---------------------|---------------------------|
| Dedicación Exclusiva | 45 |
| Tiempo Completo | 40 |
| Tiempo Parcial (20h) | 20 |

### 2.4 Fórmula de Validación
```
Horas Totales = Horas Lectivas + P&E + Suma de Horas No Lectivas
```
El sistema **solo permite avanzar si Horas Totales = Meta de la jornada** y no hay cruces en la agenda.

---

## 3. Flujo de Aprobación
```
Docente → Registro → Enviar → Revisión (Admin) → Validación (Admin) → Aprobación → Publicación
```

### Estados:
| Estado | Descripción |
|--------|-------------|
| borrador | Docente está editando |
| enviado | Docente ha enviado para revisión |
| en_revision | Admin está revisando |
| observado | Admin ha hecho observaciones, regresa a docente |
| validado | Horas y cruces validadas |
| aprobado | Carga académica aprobada |
| publicado | Carga publicada |
| cancelado | Cancelado |

---

## 4. Modelo de Datos

### 4.1 Enums Nuevos
- `TipoDedicacionLaboral`: Nuevos tipos de dedicación
- `TipoActividadNoLectiva`: Los 6 rubros no lectivos
- `EstadoCargaAcademica`: Estados del flujo de aprobación

### 4.2 Modelo CargaAcademica
- `id_docente`: Relación con docente
- `id_periodo`: Relación con período
- `horas_lectivas`: Sumatoria HT + HP + HL
- `horas_preparacion_evaluacion`: 50% HT/HP/HL (redondeado)
- `horas_no_lectivas`: Suma de actividades no lectivas
- `horas_totales`: Total general
- `horas_meta`: Meta según tipo de dedicación
- `estado`: Estado del flujo de aprobación
- `fecha_envio`, `fecha_aprobacion`, `aprobado_por`

### 4.3 Modelo ActividadNoLectiva
- `id_carga_academica`: Relación con la carga académica
- `tipo_actividad`: Tipo de actividad
- `datos_sustento`: JSON con datos específicos del rubro
- `horarios_actividad`: Array de horarios [{dia_semana, hora_inicio, hora_fin}]
- `horas_asignadas`: Total de horas para esta actividad
- `estado`: Estado de la actividad

### 4.4 Modelo HistorialCargaAcademica
Registro completo de cambios en la carga académica.

---

## 5. Migración
El archivo `prisma/migration_horas_no_lectivas.sql` contiene el código SQL para aplicar la migración.

Pasos para ejecutar:
1. Asegúrate de tener backup de la base de datos
2. Ejecuta el script en tu BD PostgreSQL
3. Ejecuta `npx prisma generate` para actualizar el cliente

---

## 6. Pasos Siguientes
1. Crear APIs REST para la gestión
2. Implementar frontend para docente y admin
3. Desarrollar lógica de cálculo automático
4. Agregar validaciones de cruces en la agenda
5. Integrar con reportes y formatos oficiales

