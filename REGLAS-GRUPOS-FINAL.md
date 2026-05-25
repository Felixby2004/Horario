# REGLAS DE GRUPOS POR TIPO DE CLASE

## 🎯 REGLA PRINCIPAL

```
TEORÍA:
- Solo 1 grupo por horario
- Toda la clase junta
- NO se divide

LABORATORIO/PRÁCTICA:
- Máximo 2 grupos por horario
- División de la clase
- Diferentes ambientes
```

---

## ✅ **CASOS PERMITIDOS:**

### **1. Teoría - Un Solo Grupo**

```
Ciclo 5 - Lunes 08:00-10:00

Grupo ÚNICO:
- Tipo: TEORÍA
- Curso: Base de Datos
- Ambiente: Aula 301
- Estudiantes: 40 (toda la clase)
- Docente: Dr. Pérez

✅ PERMITIDO
❌ NO se puede agregar otro grupo de teoría en este horario
```

### **2. Laboratorio - Hasta 2 Grupos**

```
Ciclo 5 - Miércoles 10:00-12:00

Grupo A:
- Tipo: LABORATORIO
- Curso: Lab Base de Datos
- Ambiente: Lab Cómputo 1
- Estudiantes: 20
- Docente: Dr. Pérez

Grupo B:
- Tipo: LABORATORIO
- Curso: Lab Base de Datos (o diferente)
- Ambiente: Lab Cómputo 2
- Estudiantes: 20
- Docente: Dra. García

✅ PERMITIDO (2 grupos máximo)
❌ NO se puede agregar un tercer grupo
```

### **3. Práctica - Hasta 2 Grupos**

```
Ciclo 6 - Viernes 14:00-16:00

Grupo A:
- Tipo: PRÁCTICA
- Curso: Práctica de Circuitos
- Ambiente: Lab Electrónica 1
- Estudiantes: 15
- Docente: Dr. López

Grupo B:
- Tipo: PRÁCTICA
- Curso: Práctica de Circuitos
- Ambiente: Lab Electrónica 2
- Estudiantes: 15
- Docente: Dr. Ramírez

✅ PERMITIDO (2 grupos máximo)
```

---

## ❌ **CASOS RECHAZADOS:**

### **1. Teoría + Teoría (Mismo Ciclo)**

```
Ciclo 5 - Lunes 08:00

Grupo A:
- Tipo: TEORÍA
- Ya existe ✅

Grupo B:
- Tipo: TEORÍA
- Intentando crear...

❌ RECHAZADO
Mensaje: "Ya existe una clase de TEORÍA del Ciclo 5 
         en este horario. Las clases teóricas no se dividen."
```

### **2. Más de 2 Grupos Lab/Práctica**

```
Ciclo 5 - Miércoles 10:00

Grupo A:
- Tipo: LABORATORIO
- Ya existe ✅

Grupo B:
- Tipo: LABORATORIO
- Ya existe ✅

Grupo C:
- Tipo: LABORATORIO
- Intentando crear...

❌ RECHAZADO
Mensaje: "Ya existen 2 grupos de laboratorio/práctica 
         del Ciclo 5 en este horario. Máximo permitido: 2 grupos."
```

### **3. Mismo Docente (Siempre Rechazado)**

```
Lunes 08:00

Grupo A:
- Docente: Dr. Pérez
- Lab 1

Grupo B:
- Docente: Dr. Pérez ← MISMO
- Lab 2

❌ RECHAZADO
Mensaje: "El docente ya tiene clase en este horario"
```

### **4. Mismo Ambiente (Siempre Rechazado)**

```
Lunes 08:00

Grupo A:
- Ambiente: Lab 1
- Dr. Pérez

Grupo B:
- Ambiente: Lab 1 ← MISMO
- Dra. García

❌ RECHAZADO
Mensaje: "El ambiente ya está ocupado"
```

---

## 📋 **EJEMPLOS PRÁCTICOS:**

### **Ejemplo 1: Horario Típico Ciclo 5**

```
LUNES:
08:00-10:00 → TEORÍA Base de Datos (1 grupo, 40 estudiantes, Aula 301)
10:00-12:00 → TEORÍA Programación Web (1 grupo, 40 estudiantes, Aula 302)

MIÉRCOLES:
08:00-10:00 → LAB Base de Datos Grupo A (20 estudiantes, Lab 1, Dr. Pérez)
08:00-10:00 → LAB Base de Datos Grupo B (20 estudiantes, Lab 2, Dra. García)

10:00-12:00 → PRÁCTICA Programación Grupo A (20 estudiantes, Lab 3, Dr. López)
10:00-12:00 → PRÁCTICA Programación Grupo B (20 estudiantes, Lab 4, Dr. Ruiz)

✅ TODO PERMITIDO
```

### **Ejemplo 2: Combinación Teoría-Lab**

```
VIERNES 08:00-10:00:

Grupo ÚNICO:
- TEORÍA Sistemas Operativos
- 40 estudiantes
- Aula 201
- Dr. Sánchez

✅ PERMITIDO

Intentar agregar:
- LABORATORIO Sistemas Operativos Grupo A
- Mismo horario

❌ RECHAZADO si ya hay teoría del mismo ciclo
```

### **Ejemplo 3: División Correcta**

```
Ciclo 7 - 50 estudiantes

OPCIÓN A (Teoría):
Martes 08:00 → TEORÍA (1 grupo, 50 estudiantes, Auditorio)

OPCIÓN B (Laboratorio):
Martes 08:00 → LAB Grupo A (25 estudiantes, Lab 1, Dr. A)
Martes 08:00 → LAB Grupo B (25 estudiantes, Lab 2, Dr. B)

✅ Elegir OPCIÓN A o OPCIÓN B
❌ NO mezclar teoría con laboratorio en mismo horario mismo ciclo
```

---

## 🔍 **VALIDACIONES DEL SISTEMA:**

```javascript
// 1. Validaciones SIEMPRE (independiente del tipo):
✅ Mismo docente → RECHAZADO
✅ Mismo ambiente → RECHAZADO  
✅ Mismo grupo → RECHAZADO

// 2. Validaciones POR TIPO (mismo ciclo):

if (tipo === 'teoria') {
  ✅ ¿Ya hay teoría del mismo ciclo? → RECHAZADO
  ✅ ¿No hay teoría? → PERMITIDO (solo este grupo)
}

if (tipo === 'laboratorio' || tipo === 'practica') {
  ✅ ¿Ya hay 2 o más grupos lab/práctica? → RECHAZADO
  ✅ ¿Hay 0 o 1 grupo? → PERMITIDO (hasta 2 total)
}
```

---

## 📊 **TABLA DE DECISIONES:**

| Situación | Tipo Nuevo | Resultado |
|-----------|------------|-----------|
| 0 grupos en horario | Teoría | ✅ Permitido (1/1) |
| 1 teoría existente | Teoría | ❌ Rechazado |
| 0 grupos en horario | Laboratorio | ✅ Permitido (1/2) |
| 1 lab existente | Laboratorio | ✅ Permitido (2/2) |
| 2 lab existentes | Laboratorio | ❌ Rechazado |
| 1 teoría existente | Laboratorio | ❌ Rechazado |
| 1 lab existente | Teoría | ❌ Rechazado |
| 0 grupos en horario | Práctica | ✅ Permitido (1/2) |
| 1 práctica existente | Práctica | ✅ Permitido (2/2) |
| 2 prácticas existentes | Práctica | ❌ Rechazado |

---

## 💡 **RECOMENDACIONES:**

```
1. TEORÍA:
   - Programar en aulas grandes
   - Toda la clase junta
   - Docente principal

2. LABORATORIO/PRÁCTICA:
   - Dividir en máximo 2 grupos
   - Grupos de 15-25 estudiantes
   - Diferentes docentes si es posible
   - Diferentes laboratorios

3. PLANIFICACIÓN:
   - Teorías: Lunes, Miércoles, Viernes (mañana)
   - Laboratorios: Martes, Jueves (división)
   - Prácticas: Sábados (si necesario)
```

---

## ✅ **RESUMEN:**

```
TEORÍA:
- 1 grupo único por horario
- Toda la clase junta (40 estudiantes)
- 1 docente
- 1 aula grande

LABORATORIO/PRÁCTICA:
- Máximo 2 grupos por horario
- División de clase (20+20 estudiantes)
- 2 docentes diferentes
- 2 laboratorios diferentes
```

---

**✅ SISTEMA CONFIGURADO CORRECTAMENTE**
