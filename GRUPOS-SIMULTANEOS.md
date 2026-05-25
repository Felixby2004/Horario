# GRUPOS SIMULTÁNEOS DEL MISMO CICLO

## ✅ VALIDACIÓN CORREGIDA

Ahora el sistema **SÍ permite** que grupos diferentes del mismo ciclo tengan clases al mismo tiempo.

---

## 🎯 REGLAS DE VALIDACIÓN:

### **✅ LO QUE SE PERMITE:**

```
1. Mismo ciclo + diferentes grupos + mismo horario = OK ✅
2. Mismo ciclo + diferentes cursos + mismo horario = OK ✅
3. Diferentes ambientes + mismo horario = OK ✅
```

### **❌ LO QUE SE RECHAZA:**

```
1. Mismo docente + mismo horario = CONFLICTO ❌
2. Mismo ambiente + mismo horario = CONFLICTO ❌
3. Mismo grupo + mismo horario = CONFLICTO ❌
```

---

## 📚 **EJEMPLOS PRÁCTICOS:**

### **Ejemplo 1: División de Ciclo 5**

```
Ciclo 5 tiene 40 estudiantes divididos en 2 grupos:

Lunes 08:00-10:00:

Grupo A (20 estudiantes):
- Curso: Laboratorio Base de Datos
- Ambiente: Lab Cómputo 1
- Docente: Dr. Pérez

Grupo B (20 estudiantes):
- Curso: Programación Web
- Ambiente: Lab Cómputo 2
- Docente: Dra. García

✅ PERMITIDO porque:
- Diferente grupo (A vs B)
- Diferente ambiente (Lab 1 vs Lab 2)
- Diferente docente (Pérez vs García)
- Diferente curso
```

### **Ejemplo 2: Teoría y Laboratorio Simultáneos**

```
Ciclo 6 con 35 estudiantes en 2 grupos:

Miércoles 10:00-12:00:

Grupo A (18 estudiantes):
- Curso: Teoría de Sistemas Operativos
- Ambiente: Aula 201
- Docente: Dr. López

Grupo B (17 estudiantes):
- Curso: Lab de Redes
- Ambiente: Lab Redes
- Docente: Dr. Ramírez

✅ PERMITIDO porque:
- Diferente grupo (A vs B)
- Diferente ambiente (Aula vs Lab)
- Diferente docente
- Diferente curso
```

### **Ejemplo 3: Mismo Curso, Diferentes Grupos**

```
Ciclo 7 con 50 estudiantes divididos en 2 grupos:

Viernes 14:00-16:00:

Grupo A (25 estudiantes):
- Curso: Base de Datos II
- Ambiente: Aula 301
- Docente: Dr. Pérez

Grupo B (25 estudiantes):
- Curso: Base de Datos II
- Ambiente: Aula 302
- Docente: Dr. Pérez

❌ RECHAZADO porque:
- Mismo docente no puede estar en 2 aulas

✅ SOLUCIÓN:
- Grupo B con diferente docente (Dra. Silva)
→ Ahora SÍ está permitido
```

---

## 📋 **CÓMO CREAR ESTE ESCENARIO:**

### **Paso 1: Crear los Grupos**

```
Dashboard → Grupos → Nuevo Grupo

Grupo A:
- Período: 2024-I
- Curso: Base de Datos II (Ciclo 5)
- Código: A
- Capacidad: 20
- Docente: (asignar después)

Grupo B:
- Período: 2024-I
- Curso: Programación Web (Ciclo 5)
- Código: B
- Capacidad: 20
- Docente: (asignar después)
```

### **Paso 2: Asignar Horario al Grupo A**

```
Dashboard → Horarios

Seleccionar:
- Período: 2024-I
- Ciclo: 5
- Docente: Dr. Pérez
- Curso: Base de Datos II
- Grupo: A
- Ambiente: Lab Cómputo 1

Matriz:
- Click en: Lunes 08:00-10:00
- Click "Asignar (1)"

✅ Horario creado
```

### **Paso 3: Asignar Horario al Grupo B (Mismo Horario)**

```
Dashboard → Horarios

Seleccionar:
- Período: 2024-I
- Ciclo: 5 ← MISMO CICLO
- Docente: Dra. García ← DIFERENTE DOCENTE
- Curso: Programación Web
- Grupo: B ← DIFERENTE GRUPO
- Ambiente: Lab Cómputo 2 ← DIFERENTE AMBIENTE

Matriz:
- Click en: Lunes 08:00-10:00 ← MISMO HORARIO
- Click "Asignar (1)"

✅ SISTEMA LO PERMITE porque:
- Diferente grupo (B vs A)
- Diferente docente (García vs Pérez)
- Diferente ambiente (Lab 2 vs Lab 1)
```

---

## 🔍 **VERIFICACIÓN EN BD:**

```sql
-- Ver horarios simultáneos del mismo ciclo:
SELECT 
  c.ciclo,
  g.codigo_grupo,
  c.codigo AS curso,
  c.nombre AS curso_nombre,
  d.apellidos AS docente,
  a.nombre AS ambiente,
  h.dia_semana,
  h.hora_inicio,
  h.hora_fin
FROM horario_asignado h
JOIN curso c ON h.id_curso = c.id_curso
JOIN grupo g ON h.id_grupo = g.id_grupo
JOIN docente d ON h.id_docente = d.id_docente
JOIN ambiente a ON h.id_ambiente = a.id_ambiente
WHERE c.ciclo = 5  -- Buscar en ciclo 5
  AND h.dia_semana = 0  -- Lunes
  AND h.hora_inicio = '08:00'
ORDER BY g.codigo_grupo;

-- Debe mostrar ambos grupos con el mismo horario
```

---

## ⚠️ **CASOS QUE SEGUIRÁN RECHAZÁNDOSE:**

### **Caso 1: Mismo Docente**

```
Grupo A: Dr. Pérez - Lunes 08:00 - Lab 1
Grupo B: Dr. Pérez - Lunes 08:00 - Lab 2

❌ RECHAZADO: El docente no puede estar en 2 lugares
```

### **Caso 2: Mismo Ambiente**

```
Grupo A: Dr. Pérez - Lunes 08:00 - Lab 1
Grupo B: Dr. García - Lunes 08:00 - Lab 1

❌ RECHAZADO: El ambiente no puede tener 2 clases
```

### **Caso 3: Mismo Grupo**

```
Grupo A: Dr. Pérez - Lunes 08:00 - Lab 1 - Base de Datos
Grupo A: Dr. García - Lunes 08:00 - Lab 2 - Programación

❌ RECHAZADO: El grupo no puede estar en 2 lugares
```

---

## 💡 **USO COMÚN:**

```
Escenario típico:
Ciclo 5 con 40 estudiantes

Lunes 08:00-10:00:
├─ Grupo A (20): Lab BD en Lab 1
└─ Grupo B (20): Teoría Prog en Aula 201

Lunes 10:00-12:00:
├─ Grupo A (20): Teoría Prog en Aula 201
└─ Grupo B (20): Lab BD en Lab 1

→ Los grupos se alternan entre teoría y laboratorio
→ Mismo ciclo, diferentes actividades simultáneas
→ Sistema lo permite ✅
```

---

## ✅ **RESUMEN:**

| Escenario | Permitido | Razón |
|-----------|-----------|-------|
| Mismo ciclo + diferentes grupos + mismo horario | ✅ SÍ | Grupos independientes |
| Mismo docente + mismo horario | ❌ NO | Docente no puede estar en 2 lugares |
| Mismo ambiente + mismo horario | ❌ NO | Ambiente ocupado |
| Mismo grupo + mismo horario | ❌ NO | Grupo no puede estar en 2 lugares |

---

**✅ SISTEMA LISTO PARA GRUPOS SIMULTÁNEOS DEL MISMO CICLO**
