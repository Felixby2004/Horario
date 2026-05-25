# CÓMO VER LOS BLOQUES DIVIDIDOS - GUÍA CORRECTA

## ⚠️ IMPORTANTE

Los bloques divididos **SÍ están implementados** en el código.
Para verlos, debes crear correctamente:

---

## ✅ REGLAS PARA BLOQUES DIVIDIDOS

```
1. MISMO horario (día + hora)
2. MISMO ciclo (ej: ambos del ciclo 5)
3. MISMO tipo de clase (laboratorio o práctica)
4. DIFERENTES:
   - Docentes
   - Ambientes
   - Grupos
   - Cursos (opcional, pueden ser el mismo)
```

---

## 📋 PASO A PASO

### **Ejemplo: Ciclo 5, Lunes 08:00-10:00**

#### **Horario 1:**
```
Período: 2024-I
Ciclo: 5
Docente: Pérez García
Curso: SIST-301 (Base de Datos)
Grupo: Grupo A
Ambiente: Lab Cómputo 1
Tipo: LABORATORIO ← Importante

Horario: Lunes 08:00-10:00

Click "Asignar"
```

#### **Horario 2:**
```
Período: 2024-I
Ciclo: 5 ← MISMO
Docente: Arteaga ← DIFERENTE
Curso: SIST-303 (Programación Web) ← DIFERENTE
Grupo: Grupo B ← DIFERENTE
Ambiente: Lab Cómputo 2 ← DIFERENTE
Tipo: LABORATORIO ← MISMO tipo

Horario: Lunes 08:00-10:00 ← MISMO horario

Click "Asignar"
```

---

## 🎯 RESULTADO ESPERADO

```
        Lunes 08:00-10:00
┌─────────────┬─────────────┐
│  SIST-301   │  SIST-303   │ ← 2 cursos diferentes
│ Pérez García│  Arteaga    │ ← 2 docentes diferentes
│  Lab Cómp 1 │  Lab Cómp 2 │ ← 2 ambientes diferentes
│  laboratorio│  laboratorio│ ← MISMO tipo
└─────────────┴─────────────┘
```

---

## ❌ ERRORES COMUNES

### **Error 1: Mismo docente**
```
Horario 1: Pérez García
Horario 2: Pérez García ← ❌ RECHAZADO
```
**Mensaje:** "El docente ya tiene clase en este horario"

### **Error 2: Mismo ambiente**
```
Horario 1: Lab Cómputo 1
Horario 2: Lab Cómputo 1 ← ❌ RECHAZADO
```
**Mensaje:** "El ambiente ya está ocupado"

### **Error 3: Mismo grupo**
```
Horario 1: Grupo A
Horario 2: Grupo A ← ❌ RECHAZADO
```
**Mensaje:** "El grupo ya tiene clase"

### **Error 4: Tipo TEORÍA**
```
Horario 1: TEORÍA
Horario 2: TEORÍA ← ❌ RECHAZADO
```
**Mensaje:** "Ya existe una clase de TEORÍA. No se dividen"

### **Error 5: 3 horarios**
```
Horario 1: ✅ OK
Horario 2: ✅ OK
Horario 3: ❌ RECHAZADO
```
**Mensaje:** "Ya existen 2 grupos. Máximo: 2"

---

## ✅ VALIDACIONES QUE PERMITEN DIVISIÓN

```javascript
// El código permite esto:

if (tipo === 'laboratorio' || tipo === 'practica') {
  const gruposExistentes = contarGruposEnHorario();
  
  if (gruposExistentes < 2) {
    ✅ PERMITIR (puede crear hasta 2)
  } else {
    ❌ RECHAZAR (ya hay 2)
  }
}
```

---

## 🎯 CHECKLIST ANTES DE CREAR

Antes de crear el SEGUNDO horario, verifica:

```
☑ Mismo período
☑ Mismo ciclo
☑ Mismo día
☑ Misma hora
☑ Tipo: laboratorio o práctica
☐ Docente DIFERENTE
☐ Ambiente DIFERENTE
☐ Grupo DIFERENTE
```

---

## 📊 EJEMPLOS VÁLIDOS

### **Ejemplo 1: Mismos cursos, diferentes grupos**
```
Horario 1:
- Curso: SIST-301
- Grupo: A
- Docente: Pérez
- Ambiente: Lab 1
- Tipo: Laboratorio

Horario 2:
- Curso: SIST-301 ← MISMO curso
- Grupo: B ← DIFERENTE grupo
- Docente: García ← DIFERENTE
- Ambiente: Lab 2 ← DIFERENTE
- Tipo: Laboratorio ← MISMO tipo

✅ VÁLIDO
```

### **Ejemplo 2: Diferentes cursos**
```
Horario 1:
- Curso: SIST-301 (Base de Datos)
- Grupo: A
- Docente: Pérez
- Ambiente: Lab 1
- Tipo: Laboratorio

Horario 2:
- Curso: SIST-303 (Prog Web) ← DIFERENTE curso
- Grupo: B
- Docente: García
- Ambiente: Lab 2
- Tipo: Laboratorio

✅ VÁLIDO
```

---

## 🔍 VERIFICAR RESULTADO

Después de crear ambos horarios:

```
1. Ir a Dashboard → Horarios
2. Seleccionar Período: 2024-I
3. Seleccionar Ciclo: 5
4. Buscar Lunes 08:00

✅ Debe verse:
┌──────┬──────┐
│ Hora1│ Hora2│
└──────┴──────┘
```

---

## 💡 RESUMEN

```
SÍ se pueden dividir bloques si:
✅ Laboratorio o Práctica
✅ Mismo ciclo
✅ Mismo horario
✅ Diferentes: docentes, ambientes, grupos

NO se pueden dividir si:
❌ Tipo es TEORÍA
❌ Ya hay 2 horarios
❌ Mismo docente/ambiente/grupo
```
