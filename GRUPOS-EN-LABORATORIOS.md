# MÚLTIPLES GRUPOS EN LABORATORIOS

## ✅ EL SISTEMA YA SOPORTA ESTO

El sistema **actual** ya permite que un mismo laboratorio tenga múltiples grupos diferentes al mismo tiempo, cada uno con su propio curso.

---

## 🎯 CÓMO FUNCIONA:

### Ejemplo Real:

```
Laboratorio: "Lab Cómputo 1"
Horario: Lunes 08:00-10:00

Grupo A:
- Curso: Base de Datos I (Ciclo 5)
- Docente: Dr. Pérez
- Estudiantes: 20

Grupo B:
- Curso: Programación Web (Ciclo 6)
- Docente: Dr. García
- Estudiantes: 15

Total en el laboratorio: 35 estudiantes
```

---

## 📋 PASOS PARA CREAR:

### 1. Crear Grupo A:

```
Dashboard → Grupos → Nuevo Grupo

Período: 2024-I
Curso: Base de Datos I (Ciclo 5)
Código de Grupo: A
Capacidad: 20
```

### 2. Crear Grupo B:

```
Dashboard → Grupos → Nuevo Grupo

Período: 2024-I
Curso: Programación Web (Ciclo 6)
Código de Grupo: B
Capacidad: 15
```

### 3. Asignar Horarios:

**Grupo A:**
```
Dashboard → Horarios → Seleccionar:
- Período: 2024-I
- Ciclo: 5 (Base de Datos I)
- Curso: Base de Datos I
- Grupo: A
- Ambiente: Lab Cómputo 1
- Horario: Lunes 08:00-10:00
```

**Grupo B:**
```
Dashboard → Horarios → Seleccionar:
- Período: 2024-I
- Ciclo: 6 (Programación Web)
- Curso: Programación Web
- Grupo: B
- Ambiente: Lab Cómputo 1
- Horario: Lunes 08:00-10:00 ← MISMO HORARIO
```

---

## ✅ VALIDACIONES DEL SISTEMA:

El sistema **permite** esto porque:

1. ✅ **Diferente ciclo** (5 vs 6)
2. ✅ **Diferente curso**
3. ✅ **Diferente grupo** (A vs B)
4. ✅ Capacidad total <= Capacidad del laboratorio

El sistema **rechazaría** si:

❌ Mismo docente, mismo horario
❌ Mismo grupo, mismo horario
❌ Capacidad total > Capacidad del ambiente

---

## 📊 EJEMPLO VISUAL:

```
┌─────────────────────────────────────────────────────┐
│  Lab Cómputo 1 - Lunes 08:00-10:00                 │
├─────────────────────────────────────────────────────┤
│  Grupo A (20 estudiantes)                           │
│  Curso: Base de Datos I (Ciclo 5)                   │
│  Docente: Dr. Pérez                                 │
│                                                     │
│  Grupo B (15 estudiantes)                           │
│  Curso: Programación Web (Ciclo 6)                  │
│  Docente: Dr. García                                │
│                                                     │
│  Total: 35/50 estudiantes                           │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 VERIFICAR EN LA BASE DE DATOS:

```sql
-- Ver todos los horarios del mismo ambiente y horario:
SELECT 
  h.dia_semana,
  h.hora_inicio,
  h.hora_fin,
  a.nombre AS ambiente,
  c.codigo AS curso,
  c.ciclo,
  g.codigo_grupo,
  d.apellidos AS docente
FROM horario_asignado h
JOIN ambiente a ON h.id_ambiente = a.id_ambiente
JOIN curso c ON h.id_curso = c.id_curso
JOIN grupo g ON h.id_grupo = g.id_grupo
JOIN docente d ON h.id_docente = d.id_docente
WHERE a.nombre = 'Lab Cómputo 1'
  AND h.dia_semana = 0  -- Lunes
  AND h.hora_inicio = '08:00'
ORDER BY c.ciclo, g.codigo_grupo;
```

---

## ⚠️ IMPORTANTE:

1. **Cada grupo es independiente**: Tiene su propio curso, docente, estudiantes
2. **La capacidad se suma**: Si Lab tiene 50 lugares, puedes tener Grupo A (20) + Grupo B (15) + Grupo C (15) = 50
3. **Los ciclos pueden ser diferentes**: Un laboratorio puede tener ciclo 5, 6, 7 al mismo tiempo
4. **El sistema valida automáticamente**: No permite conflictos de docente, grupo o capacidad

---

## 💡 CASOS DE USO:

### Caso 1: División de Laboratorio
```
Lab Cómputo (50 computadoras)
→ Grupo A: 25 estudiantes (Ciclo 5)
→ Grupo B: 25 estudiantes (Ciclo 5)
Mismo curso, diferentes grupos
```

### Caso 2: Compartir Laboratorio
```
Lab Cómputo (50 computadoras)
→ Grupo A: 20 estudiantes (Base de Datos - Ciclo 5)
→ Grupo B: 20 estudiantes (Prog Web - Ciclo 6)
→ Grupo C: 10 estudiantes (IA - Ciclo 7)
Diferentes cursos, mismo horario
```

### Caso 3: Laboratorios Especializados
```
Lab Electrónica (30 puestos)
→ Grupo A: 15 estudiantes (Circuitos I - Ciclo 5)
→ Grupo B: 15 estudiantes (Circuitos II - Ciclo 6)
Laboratorio compartido, diferentes niveles
```

---

**✅ NO NECESITAS MODIFICAR NADA - EL SISTEMA YA LO SOPORTA**
