# CÓMO VER LOS BLOQUES DIVIDIDOS

## ❓ **POR QUÉ NO SE VEN EN TU CAPTURA:**

En tu imagen, todos los horarios son del **MISMO curso**:
- sist-303 (repetido varias veces)
- sist-301 (repetido varias veces)

Los bloques divididos SOLO aparecen cuando hay **2 CURSOS DIFERENTES** en el **MISMO horario**.

---

## ✅ **CÓMO CREAR PARA VER LA DIVISIÓN:**

### **Paso 1: Crear 2 Grupos Diferentes**

```
Grupo A:
- Curso: sist-301 (Desarrollo de Software I)
- Grupo: A
- Tipo: LABORATORIO

Grupo B:
- Curso: sist-303 (Base de Datos) ← DIFERENTE
- Grupo: B
- Tipo: LABORATORIO
```

### **Paso 2: Asignar al MISMO Horario**

```
Grupo A:
- Lunes 08:00-10:00
- Lab Cómputo 1
- Dr. Pérez García

Grupo B:
- Lunes 08:00-10:00 ← MISMO HORARIO
- Lab Cómputo 2 ← DIFERENTE AMBIENTE
- Dr. Arteaga ← DIFERENTE DOCENTE
```

### **Resultado Esperado:**

```
┌──────────────┬──────────────┐
│  sist-301    │  sist-303    │ ← DOS CURSOS DIFERENTES
│  Pérez García│  Arteaga     │
│  Lab Cómp 1  │  Lab Cómp 2  │
│  laboratorio │  laboratorio │
└──────────────┴──────────────┘
```

---

## 🔧 **PASO A PASO COMPLETO:**

### **1. Crear Grupo A:**

```
Dashboard → Horarios

Datos:
- Período: 2024-I
- Ciclo: 5
- Docente: Pérez García, Juan Carlos
- Curso: sist-301 - Desarrollo de Software I
- Grupo: Grupo A (si no existe, crear en Grupos)
- Ambiente: Aula 302 (aula)
- Tipo: Laboratorio

Click en matriz:
- Lunes, 08:00-10:00

Asignar (1)
```

### **2. Crear Grupo B (DIFERENTE CURSO):**

```
Dashboard → Horarios

Datos:
- Período: 2024-I
- Ciclo: 5 ← MISMO CICLO
- Docente: Arteaga ← DIFERENTE
- Curso: sist-303 ← CURSO DIFERENTE
- Grupo: Grupo B
- Ambiente: Aula 301 (aula) ← DIFERENTE
- Tipo: Laboratorio

Click en matriz:
- Lunes, 08:00-10:00 ← MISMO HORARIO

Asignar (1)
```

### **3. Verificar:**

```
La celda de Lunes 08:00 debería mostrar:

┌──────────────┬──────────────┐
│  sist-301    │  sist-303    │
│  Pérez García│  Arteaga     │
│  Aula 302    │  Aula 301    │
│  laboratorio │  laboratorio │
└──────────────┴──────────────┘
```

---

## ⚠️ **IMPORTANTE:**

### **NO funcionará si:**

```
❌ Mismo curso (sist-301 + sist-301)
❌ Mismo docente
❌ Mismo ambiente
❌ Tipo = teoría (teoría solo permite 1 grupo)
```

### **SÍ funcionará si:**

```
✅ Diferentes cursos (sist-301 + sist-303)
✅ Diferentes docentes
✅ Diferentes ambientes
✅ Mismo ciclo
✅ Mismo horario
✅ Tipo = laboratorio o práctica
```

---

## 📊 **EJEMPLO REAL:**

```
SITUACIÓN:
Ciclo 5 tiene 40 estudiantes
Horario: Lunes 08:00-10:00

DIVISIÓN:

Grupo A (20 estudiantes):
→ Laboratorio de Base de Datos (sist-303)
→ Lab Cómputo 1
→ Dr. Arteaga

Grupo B (20 estudiantes):
→ Laboratorio de Desarrollo Web (sist-301)
→ Lab Cómputo 2
→ Dr. Pérez García

Resultado en matriz:
┌─────────────┬─────────────┐
│  sist-303   │  sist-301   │
│  Arteaga    │ Pérez García│
│  Lab Cómp 1 │ Lab Cómp 2  │
│  lab        │  lab        │
└─────────────┴─────────────┘
```

---

## 🎯 **VALIDACIÓN:**

Para verificar que funcionó:

1. **Crear los 2 grupos** como se indica arriba
2. **Actualizar la página** (F5)
3. **Ver la matriz** del Ciclo 5
4. **Buscar Lunes 08:00**
5. **Debe verse dividido** en 2 mitades

Si no se ve dividido:
- Verificar que sean CURSOS DIFERENTES
- Verificar que sea el MISMO horario
- Verificar que el tipo sea LABORATORIO o PRÁCTICA

---

**✅ SIGUE ESTOS PASOS Y VERÁS LOS BLOQUES DIVIDIDOS**
