# 🎓 SISTEMA DE AUTO-ASIGNACIÓN PARA DOCENTES

## 📋 FLUJO COMPLETO DEL SISTEMA

### **FASE 1: ADMINISTRADOR (Ya implementado)**

```
1. Login como administrador
2. Dashboard → Ventanas → Nueva Ventana
3. Crear ventanas por jerarquía:

   Ventana 1:
   - Modalidad: Nombrado
   - Categoría: Principal
   - Orden: 1
   - Fecha: 10/01/2025
   - Horario: 08:00 - 18:00
   
   Ventana 2:
   - Modalidad: Nombrado
   - Categoría: Asociado
   - Orden: 2
   - Fecha: 15/01/2025
   - Horario: 08:00 - 18:00
   
   ... y así sucesivamente
```

### **FASE 2: DOCENTE (Panel creado, falta implementación completa)**

```
1. Login como docente
2. Panel muestra:
   ✅ Su categoría y modalidad
   ✅ Su ventana de atención
   ✅ Si puede seleccionar horarios AHORA
   ✅ Sus estadísticas

3. Si está en su ventana:
   Click "Seleccionar Mis Horarios"
   
4. Sistema muestra:
   - Sus cursos asignados
   - Matriz de horarios disponibles
   - Puede seleccionar bloques
   
5. Selecciona horarios:
   - Click en bloques de la matriz
   - Confirma selección
   - Estado: "SOLICITADO"
   
6. Ve sus horarios:
   - Confirmados (verde)
   - Pendientes (amarillo)
   - Rechazados (rojo)
```

### **FASE 3: ADMINISTRADOR (Falta implementar)**

```
1. Dashboard → Solicitudes de Horarios
2. Ve lista de solicitudes:
   - Docente
   - Curso
   - Horario solicitado
   - Estado
   
3. Puede:
   - Aprobar solicitud → Estado: "CONFIRMADO"
   - Rechazar solicitud → Estado: "RECHAZADO"
   - Ver conflictos automáticos
```

---

## 🗂️ ESTRUCTURA DE ESTADOS

```typescript
enum EstadoHorario {
  borrador        // Admin creó manualmente
  solicitado      // Docente pidió este horario
  aprobado        // Admin aprobó la solicitud
  rechazado       // Admin rechazó la solicitud
  confirmado      // Horario final confirmado
}
```

---

## 📊 LO QUE YA ESTÁ IMPLEMENTADO

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| ✅ Panel de Admin | Completo | `/dashboard` |
| ✅ Ventanas de Atención | Completo | `/dashboard/horarios/ventanas` |
| ✅ Asignación Manual | Completo | `/dashboard/horarios` |
| ✅ Sistema por Ciclos | Completo | `/dashboard/horarios` |
| ✅ Panel Docente | Base creada | `/docente` |
| ✅ API Ventana Actual | Creada | `/api/docente/ventana-actual` |

---

## 🚧 LO QUE FALTA IMPLEMENTAR

### **1. Página de Selección de Horarios (Docente)**

**Archivo:** `/src/app/docente/seleccionar-horarios/page.tsx`

**Funcionalidad:**
- Mostrar cursos asignados al docente
- Matriz de horarios por ciclo
- Permitir seleccionar bloques
- Guardar como "solicitado"
- Validar disponibilidad en tiempo real

### **2. API de Solicitudes**

**Archivo:** `/src/app/api/docente/solicitudes/route.ts`

**Endpoints:**
- POST: Crear solicitud de horario
- GET: Listar solicitudes del docente
- DELETE: Cancelar solicitud

### **3. Panel de Aprobación (Admin)**

**Archivo:** `/src/app/dashboard/solicitudes/page.tsx`

**Funcionalidad:**
- Lista de todas las solicitudes
- Filtros por estado, docente, fecha
- Botones: Aprobar / Rechazar
- Ver conflictos automáticamente

### **4. API de Aprobación**

**Archivo:** `/src/app/api/solicitudes/[id]/aprobar/route.ts`

**Funcionalidad:**
- Cambiar estado a "aprobado"
- Validar conflictos finales
- Notificar al docente

### **5. Página "Mis Horarios" (Docente)**

**Archivo:** `/src/app/docente/mis-horarios/page.tsx`

**Funcionalidad:**
- Mostrar horarios confirmados
- Mostrar horarios pendientes
- Mostrar horarios rechazados
- Descargar PDF de horario personal

### **6. Sistema de Notificaciones**

**Funcionalidad:**
- Email cuando ventana se abre
- Email cuando solicitud es aprobada/rechazada
- Notificaciones en la interfaz

---

## 💡 EJEMPLO DE USO COMPLETO

### **Escenario: Dr. Pérez (Principal Nombrado)**

```
DÍA 1 (05/01/2025):
Admin crea ventana:
- Principal Nombrado: 10/01/2025, 08:00-18:00

DÍA 2 (10/01/2025 - 08:00):
Dr. Pérez hace login:
✅ "Tu ventana está ACTIVA"
✅ Puede seleccionar horarios

Dr. Pérez selecciona:
- Lunes 08:00-10:00: Base de Datos I
- Miércoles 10:00-12:00: Base de Datos I
Estado: SOLICITADO

DÍA 3 (11/01/2025):
Admin revisa solicitudes:
- Ve: Dr. Pérez, Base de Datos I, Lunes 08:00-10:00
- Verifica: No hay conflictos
- Click "Aprobar"
Estado: APROBADO

Dr. Pérez ve notificación:
✅ "Tu horario de Lunes 08:00-10:00 fue aprobado"
```

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

```
1. ALTA: Selección de horarios (docente)
2. ALTA: API de solicitudes
3. ALTA: Panel de aprobación (admin)
4. MEDIA: Mis horarios (docente)
5. MEDIA: Reportes PDF personal
6. BAJA: Notificaciones por email
```

---

## 🔧 PRÓXIMOS PASOS

Para completar el sistema:

1. **Crear página de selección de horarios**
   - Similar a la matriz del admin
   - Solo muestra cursos del docente
   - Guarda como "solicitado"

2. **Crear panel de aprobación**
   - Lista de solicitudes pendientes
   - Botones aprobar/rechazar
   - Validación automática

3. **Agregar estados al schema**
   - Ya existe `estado` en HorarioAsignado
   - Valores: borrador, solicitado, aprobado, rechazado, confirmado

4. **Crear reportes personales**
   - PDF con horario del docente
   - Filtrado por período
   - Incluir información de cursos

---

## 📝 NOTAS IMPORTANTES

- El sistema de ventanas CONTROLA CUÁNDO puede cada docente seleccionar
- Los horarios seleccionados NO son definitivos hasta que admin aprueba
- Se mantiene la jerarquía: Nombrado Principal primero, Contratado Jefe Práctica último
- Cada ciclo tiene su matriz independiente
- Los conflictos se validan tanto al solicitar como al aprobar

---

**Archivo creado:** SISTEMA-DOCENTES.md
