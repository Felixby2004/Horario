# 🧬 Algoritmo Genético para Generación Automática de Horarios

## 📖 Guía Completa de Implementación

### Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Cómo Funciona](#cómo-funciona)
3. [Requisitos Previos](#requisitos-previos)
4. [Cómo Usar](#cómo-usar)
5. [Parámetros del Algoritmo](#parámetros-del-algoritmo)
6. [Arquitectura Técnica](#arquitectura-técnica)
7. [Casos de Uso](#casos-de-uso)
8. [Limitaciones y Mejoras Futuras](#limitaciones-y-mejoras-futuras)

---

## Resumen Ejecutivo

El **Algoritmo Genético para Generación de Horarios** es un sistema inteligente que:

✅ **Genera horarios automáticamente** basado en datos existentes
✅ **Optimiza la distribución** de clases, docentes y ambientes
✅ **Detecta y reporta conflictos** que deben resolverse
✅ **Permite ajustes manuales** antes de guardar definitivamente
✅ **Escalable** - Funciona con cualquier cantidad de datos

### Beneficios Principales

- **Ahorro de tiempo**: Generación automática vs. manual (horas → minutos)
- **Mejor distribución**: Balanceo de carga de docentes
- **Menos conflictos**: Validación automática de restricciones
- **Flexibilidad**: Se pueden hacer ajustes post-generación
- **Experiencia mejorada**: Menos estrés para el administrador

---

## Cómo Funciona

### Conceptos Básicos

Un **Algoritmo Genético (AG)** es una técnica de optimización que simula la evolución biológica:

```
[Población Inicial] 
    ↓
[Evaluar Aptitud] → Medir calidad de cada solución
    ↓
[Seleccionar] → Elegir los mejores
    ↓
[Cruzar] → Combinar características
    ↓
[Mutar] → Introducir variación
    ↓
[Nueva Generación] → Repetir hasta convergencia
```

### Componentes del Algoritmo

#### 1. **Cromosoma** (Una Solución)
Un cromosoma representa un horario completo con todas las asignaciones:
```typescript
{
  id: "cromosoma_1234",
  horarios: [
    {
      docente: "Dr. García",
      curso: "Matemática I",
      grupo: "A",
      ambiente: "Aula 101",
      dia: 0,          // Lunes
      hora_inicio: "08:00",
      hora_fin: "10:00"
    },
    // ... más asignaciones
  ],
  aptitud: 87.5  // Puntuación de calidad (0-100)
}
```

#### 2. **Función de Aptitud** (Evaluación)
Mide la calidad de un horario penalizando:
- ❌ Conflictos de docentes (docente en 2 lugares simultáneamente)
- ❌ Conflictos de ambientes (aula usada por 2 clases)
- ❌ Indisponibilidades de docentes
- ❌ Horarios fuera del rango permitido
- ✅ Distribución equilibrada de carga

Fórmula simplificada:
```
aptitud = 100
         - (conflictos_docente × 10)
         - (conflictos_ambiente × 10)
         - (indisponibilidades × 5)
         - (horarios_invalidos × 15)
         + bonus_distribucion_carga
```

#### 3. **Selección** (Natural Selection)
Se eligen los cromosomas con mayor aptitud:
```
Población de 50 cromosomas
    ↓
Ordenar por aptitud
    ↓
Seleccionar top 25 (los mejores 50%)
```

#### 4. **Cruzamiento** (Crossover)
Se combinan dos soluciones para crear descendencia:
```
Padre 1: [H1, H2, H3 | H4, H5, H6]
Padre 2: [H7, H8, H9 | H10, H11, H12]
           ↓
Hijo 1:  [H1, H2, H3, H10, H11, H12]
Hijo 2:  [H7, H8, H9, H4, H5, H6]
```

#### 5. **Mutación** (Variation)
Se introducen cambios aleatorios para explorar nuevas soluciones:
```
Horario original:
  Lunes 08:00 - Aula 101

Mutaciones posibles:
  ✓ Cambiar día: Martes 08:00 - Aula 101
  ✓ Cambiar hora: Lunes 10:00 - Aula 101
  ✓ Cambiar aula: Lunes 08:00 - Aula 202
```

---

## Requisitos Previos

Antes de usar el generador, asegúrate de tener:

### 1. **Datos Maestros Configurados**

#### Períodos Académicos
- Al menos un período activo
- Fechas de inicio/fin bien definidas

#### Docentes
- Docentes registrados y activos
- Cursos asignados a cada docente
- Horas máximas semanales definidas
- Disponibilidades registradas (opcional pero recomendado)

#### Cursos
- Cursos activos en el sistema
- Horas definidas (teoría, laboratorio, práctica)
- Ciclos asignados correctamente

#### Grupos
- Grupos creados para cada curso
- Cantidad de matriculados registrada
- Período académico asociado

#### Ambientes
- Ambientes activos y disponibles
- Tipos de ambiente correctos (aula, laboratorio, etc.)
- Capacidades registradas

### 2. **Configuración del Sistema**

```
Acceso: /dashboard/horarios/generar-algoritmico

Requisitos:
✓ Usuario con rol "Administrador del Sistema"
✓ Navegador moderno (Chrome, Firefox, Edge)
✓ Conexión de internet estable
✓ JavaScript habilitado
```

### 3. **Verificación Previa**

Antes de ejecutar, verifica:
```bash
# Cantidad de registros
- Docentes: ¿50+?
- Cursos: ¿100+?
- Grupos: ¿500+?
- Ambientes: ¿30+?
- Horarios libres: ¿Suficientes?
```

Si alguno es < a lo recomendado, el algoritmo puede fallar o generar horarios pobres.

---

## Cómo Usar

### Paso 1: Acceder al Generador

```
Dashboard → Horarios → [🧬 Generar Horarios IA]
```

O directamente:
```
https://tudominio.com/dashboard/horarios/generar-algoritmico
```

### Paso 2: Seleccionar Período

```typescript
┌─────────────────────────────────────┐
│ Período Académico *                 │
│ ┌─────────────────────────────────┐ │
│ │ 2026-I (SEMESTRE I - 2026)    ▼ │ │
│ └─────────────────────────────────┘ │
│ Esto determinará qué docentes,      │
│ cursos y grupos se usarán           │
└─────────────────────────────────────┘
```

### Paso 3: Configurar Parámetros (Opcional)

Los valores por defecto funcionan bien, pero puedes ajustar:

| Parámetro | Defecto | Rango | Efecto |
|-----------|---------|-------|--------|
| **Tamaño Población** | 50 | 10-200 | Mayor = más opciones, más lento |
| **Generaciones** | 100 | 10-500 | Mayor = mejor solución, más lento |
| **Prob. Cruzamiento** | 0.8 | 0.3-1.0 | Mayor = más combinaciones |
| **Prob. Mutación** | 0.1 | 0.01-0.5 | Mayor = más exploración |

**Recomendaciones Rápidas:**

- **Prueba Rápida**: Población=20, Generaciones=30
- **Balanceado**: Población=50, Generaciones=100 (defecto)
- **Máxima Calidad**: Población=150, Generaciones=300

### Paso 4: Ejecutar el Algoritmo

```
Clic en: [🚀 Generar Horarios]

Espera a que termine (generalmente 30-120 segundos)
```

### Paso 5: Revisar Resultados

```
✅ Generación Exitosa

Métricas:
- Asignaciones: 487
- Aptitud: 82.5/100
- Docentes Cubiertos: 45
- Grupos Asignados: 98
- Ambientes Utilizados: 28
- ⚠️ Conflictos Detectados: 3
```

### Paso 6: Resolver Conflictos

```
Si hay conflictos:

1. Haz clic en: [👁️ Ver Horarios Generados]
2. Identifica los conflictos (marcados en rojo)
3. Ajusta manualmente si es necesario
4. Si hay muchos conflictos, intenta generar de nuevo
   con parámetros diferentes
```

### Paso 7: Guardar Definitivamente

```
Clic en: [💾 Guardar Definitivo]

Los horarios se guardarán en la BD con estado "borrador"
Luego puedes revisarlos, modificarlos o publicarlos
```

---

## Parámetros del Algoritmo

### Tamaño de Población

**¿Qué es?** Cantidad de soluciones diferentes en cada generación

**Efecto:**
- Pequeño (10-20): Rápido pero soluciones pobres
- Medio (50): Balance óptimo (RECOMENDADO)
- Grande (100-200): Mejor calidad pero muy lento

**Cuándo ajustar:**
```
Si el resultado es malo → Aumentar a 100
Si es muy lento → Reducir a 30
```

### Generaciones

**¿Qué es?** Número de iteraciones del algoritmo

**Efecto:**
- Pocas (10-30): Convergencia rápida pero subóptima
- Medias (100): Buen balance (RECOMENDADO)
- Muchas (300+): Mejor solución pero espera larga

**Cuándo ajustar:**
```
Si no mejora después de 100 → Aumentar a 200
Si tarda mucho → Reducir a 50
```

### Probabilidad de Cruzamiento

**¿Qué es?** Probabilidad de combinar dos soluciones

**Rango:** 0.3 a 1.0 (30% a 100%)

**Efecto:**
- Baja (0.3-0.5): Menos combinación, más diversidad
- Alta (0.8-1.0): Más explotación de buenas soluciones

**Recomendación:** Mantener en 0.8

### Probabilidad de Mutación

**¿Qué es?** Probabilidad de cambio aleatorio

**Rango:** 0.01 a 0.5 (1% a 50%)

**Efecto:**
- Baja (0.05): Convergencia más rápida
- Alta (0.2-0.3): Más exploración, evita mínimos locales

**Recomendación:** Mantener en 0.1

---

## Arquitectura Técnica

### Archivos Principales

```
src/
├── services/horarios/
│   └── AlgoritmoGenetico.ts          # Lógica del AG
├── app/api/horarios/
│   ├── generar-algoritmico/
│   │   └── route.ts                  # API para ejecutar AG
│   └── guardar-generados/
│       └── route.ts                  # API para guardar resultados
└── app/dashboard/horarios/
    ├── generar-algoritmico/
    │   └── page.tsx                  # UI del generador
    └── page.tsx                      # Link al generador
```

### Flujo de Datos

```
1. Frontend (UI)
   └─→ usuario inicia generación
       └─→ [POST] /api/horarios/generar-algoritmico

2. Backend (Algoritmo)
   └─→ AlgoritmoGenetico.ts
       ├─→ Cargar datos de BD
       ├─→ Generar población inicial
       ├─→ Iterar generaciones
       ├─→ Guardar temporalmente
       └─→ Retornar resultados

3. Frontend (Resultados)
   └─→ Mostrar métricas
       └─→ Opción: [Ver] [Guardar] [Regenerar]

4. Backend (Guardado Final)
   └─→ [POST] /api/horarios/guardar-generados
       └─→ Mover de temporal a definitivo
```

### Base de Datos

**Tablas Utilizadas:**

```sql
-- Lectura:
SELECT * FROM docente;
SELECT * FROM curso;
SELECT * FROM grupo;
SELECT * FROM ambiente;
SELECT * FROM disponibilidad_docente;

-- Escritura:
INSERT INTO seleccion_temporal_horario; -- Durante generación
INSERT INTO horario_asignado;           -- Al guardar
```

**Tabla Temporal:** `seleccion_temporal_horario`
- Vence después de 24 horas
- Permite revisar antes de guardar
- Se limpia automáticamente

---

## Casos de Uso

### Caso 1: Generación Inicial de Período

**Escenario:**
```
Es inicio del semestre. Tenemos todos los datos:
- 50 docentes
- 100 cursos
- 500 grupos
- 30 aulas

Necesitamos generar horarios para 500 grupos en 30 minutos
```

**Solución:**
```
1. Selecciona el período
2. Mantén parámetros por defecto (Población=50, Generaciones=100)
3. Ejecuta: [🚀 Generar Horarios]
4. Espera 1-2 minutos
5. Revisa conflictos (generalmente < 5%)
6. Haz ajustes menores si es necesario
7. Guarda: [💾 Guardar Definitivo]
```

**Tiempo Total:** ~10 minutos

### Caso 2: Regeneración por Cambios

**Escenario:**
```
Un docente se enfermó. Necesitamos:
- Reasignar sus 5 cursos a otros docentes
- Regenerar horarios para esos cursos
```

**Solución:**
```
1. Actualiza asignaciones de docentes
2. Vuelve a ejecutar el algoritmo
3. Se considerarán automáticamente los cambios
```

### Caso 3: Optimización de Conflictos

**Escenario:**
```
Generaste horarios pero tienes 20 conflictos
Necesitas mejorar la solución
```

**Solución:**
```
1. Aumenta parámetros:
   - Población: 50 → 100
   - Generaciones: 100 → 200
2. Ejecuta nuevamente: [🔄 Generar Nuevo]
3. Los conflictos deberían reducirse

Si aún hay conflictos:
4. Revisa manualmente
5. Considera cambiar:
   - Ambientes no disponibles
   - Docentes sin disponibilidad
   - Restricciones imposibles
```

---

## Limitaciones y Mejoras Futuras

### Limitaciones Actuales

⚠️ **No Considera:**
- Preferencias personales de docentes
- Distancia entre ambientes (travel time)
- Número máximo de clases por día
- Descansos requeridos entre clases
- Programas de desarrollo docente

⚠️ **Supuestos:**
- Todas las clases duran 2 horas (configurable en futuro)
- Docentes disponibles en cualquier horario (sin preferencias)
- Ambientes intercambiables por tipo

### Mejoras Futuras Planeadas

✅ **Fase 2:** Considerar preferencias de docentes
✅ **Fase 3:** Optimizar travel time entre ambientes
✅ **Fase 4:** Distribución de carga diaria
✅ **Fase 5:** Integración con sistema de notificaciones
✅ **Fase 6:** Export a PDF y calendario

### Contribuciones y Soporte

Si encuentras problemas o tienes mejoras:
```
📧 Email: soporte@unt.edu.pe
🐛 Reporte de bugs: /issues
💡 Sugerencias: Contacta al equipo de desarrollo
```

---

## Preguntas Frecuentes

### P: ¿Por qué no todos los grupos tienen horarios asignados?
**R:** Probablemente falten docentes para esos cursos. Verifica que todos los cursos tengan docentes asignados.

### P: ¿Cómo reduzco conflictos?
**R:** 
1. Aumenta población y generaciones
2. Configura disponibilidades de docentes
3. Revisa que ambientes tengan capacidad suficiente

### P: ¿Puedo editar los horarios después de guardar?
**R:** Sí, se guardan como estado "borrador". Puedes editarlos en la vista de horarios.

### P: ¿Cuál es el máximo de datos que puede procesar?
**R:** Testeado hasta 1000 grupos. Más allá necesita optimización.

### P: ¿Qué pasa si falta información?
**R:** El algoritmo genera lo que puede. Completa los datos y regenera.

---

## Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Algoritmos Genéticos - Wikipedia](https://es.wikipedia.org/wiki/Algoritmo_gen%C3%A9tico)
- [Optimización Combinatoria](https://es.wikipedia.org/wiki/Optimizaci%C3%B3n_combinatoria)

---

**Última actualización:** 18 de mayo, 2026
**Versión:** 1.0
**Estado:** Producción
