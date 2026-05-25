# Guía de Alertas Mejoradas del Sistema

## 🎯 Objetivo

Reemplazar los `alert()` del navegador (localhost) por un sistema moderno de notificaciones que:
- Se vea profesional
- No interrumpa la navegación
- Proporcione retroalimentación clara
- Desaparezca automáticamente
- Sea personalizable por tipo de mensaje

## 🎨 Tipos de Alertas

### ✅ Alerta de Éxito (Verde)
Cuando una operación se completa exitosamente.

**Estilos**:
- Fondo verde claro (#f0fdf4)
- Borde verde (#86efac)
- Icono: ✅
- Duración: 4 segundos (por defecto)

**Ejemplos de uso**:
```typescript
exito('Docente importado', 'Juan Pérez fue importado exitosamente');
exito('Curso asignado', 'Programación I fue asignado a Juan Pérez');
exito('Cambios guardados', 'Tu perfil fue actualizado correctamente');
```

### ❌ Alerta de Error (Rojo)
Cuando ocurre un error en una operación.

**Estilos**:
- Fondo rojo claro (#fef2f2)
- Borde rojo (#fca5a5)
- Icono: ❌
- Duración: 5 segundos (por defecto)

**Ejemplos de uso**:
```typescript
error('Error al guardar', 'El correo ya está registrado en el sistema');
error('Exceso de horas', 'Asignar este curso excedería el límite máximo');
error('Error inesperado', 'Ocurrió un problema. Intenta nuevamente.');
```

### ⚠️ Alerta de Advertencia (Amarillo)
Para confirmaciones o advertencias antes de acciones importantes.

**Estilos**:
- Fondo amarillo claro (#fffbeb)
- Borde amarillo (#fcd34d)
- Icono: ⚠️
- Duración: 6 segundos (configurable)

**Ejemplos de uso**:
```typescript
advertencia('Confirmación', '¿Estás seguro de eliminar este horario?', 0);
advertencia('Atención', 'Este cambio afectará a otros docentes', 5000);
```

### ℹ️ Alerta de Información (Azul)
Para información general o pasos realizados.

**Estilos**:
- Fondo azul claro (#eff6ff)
- Borde azul (#bfdbfe)
- Icono: ℹ️
- Duración: 4 segundos (por defecto)

**Ejemplos de uso**:
```typescript
info('Cargando', 'Obteniendo información de cursos...');
info('Sincronización', 'Los horarios fueron actualizados desde el servidor');
```

## 🚀 Cómo Implementar en Tus Páginas

### Paso 1: Importar el Hook y Componente
```typescript
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
```

### Paso 2: Inicializar en tu componente
```typescript
export default function MiPagina() {
  const { alertas, eliminarAlerta, exito, error, advertencia, info } = useAlertasTemporales();
  
  // ... resto del código
}
```

### Paso 3: Agregar el Contenedor de Alertas
```typescript
return (
  <div>
    <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />
    {/* Resto de tu página */}
  </div>
);
```

### Paso 4: Usar las Alertas en tus funciones
```typescript
const guardarCambios = async () => {
  try {
    const response = await fetch('/api/docentes', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    
    const data = await response.json();
    
    if (data.exito) {
      exito('Guardado', 'Los cambios fueron guardados exitosamente');
      // Redirigir o actualizar
    } else {
      error('Error', data.mensaje || 'No pudimos guardar los cambios');
    }
  } catch (err) {
    error('Error inesperado', 'Ocurrió un problema al guardar');
  }
};
```

## 📱 Comportamiento Visual

### Posición
Las alertas aparecen en la **esquina superior derecha** de la pantalla:
```
┌─────────────────────────────┐
│                    ✅ Éxito │
│          Documento guardado │
│                          ✕ │
│ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────┘
```

### Animación de Entrada
- Las alertas se deslizan desde la derecha
- Animación suave de 0.3 segundos
- Aparecen sobre otros elementos (z-index: 50)

### Barra de Progreso
Una barra en la parte inferior muestra el tiempo restante:
```
┌──────────────────────────┐
│ ✅ Guardado              │
│ Tu cambio fue guardado   │
│                        ✕ │
│ ████████░░░░░░░░░░░░░░ │
└──────────────────────────┘
```

## ⏱️ Duración

### Por defecto
- **Éxito**: 4 segundos
- **Error**: 5 segundos
- **Advertencia**: 6 segundos
- **Info**: 4 segundos

### Personalizar duración
```typescript
// Sin auto-cierre (permanente hasta cerrar manualmente)
exito('Importante', 'Recuerda esto', 0);

// Cierre rápido (2 segundos)
info('Cargando', 'Obteniendo datos...', 2000);

// Cierre lento (8 segundos)
advertencia('Atención', 'Este cambio es importante', 8000);
```

## 🎯 Mejores Prácticas

### ✅ Haz
- **Sé específico**: "Docente Juan Pérez importado" en lugar de "Importado"
- **Incluye contexto**: "Curso Programación I asignado a..." en lugar de "Asignado"
- **Mantén corto**: Máximo 2 líneas de texto
- **Usa iconos**: Las letras/emojis ayudan a reconocer el tipo
- **Agrupa información**: Combina título descriptivo + mensaje de detalle

### ❌ No hagas
- **Muy largos**: No metas toda la descripción en una alerta
- **Demasiadas alertas**: No mostres más de 3-4 simultáneamente
- **Sin contexto**: Evita "Error" o "Guardado" sin explicación
- **Información antigua**: Las alertas no deben referenciar acciones pasadas

## 📚 Ejemplos Prácticos

### Importación de Docente
```typescript
const importarDocente = async (datosDocente) => {
  try {
    const response = await fetch('/api/docentes/importar', {
      method: 'POST',
      body: JSON.stringify(datosDocente)
    });
    
    const { exito, datos } = await response.json();
    
    if (exito) {
      exito(
        '✅ Docente importado',
        `${datos.nombres} ${datos.apellidos} fue agregado al sistema`
      );
      setTimeout(() => router.push('/dashboard/docentes'), 1500);
    }
  } catch (err) {
    error('❌ Error al importar', 'Intenta nuevamente o contacta soporte');
  }
};
```

### Asignación de Cursos
```typescript
const asignarCurso = async (idDocente, idCurso) => {
  try {
    const response = await fetch('/api/docentes/asignar-cursos', {
      method: 'POST',
      body: JSON.stringify({ id_docente: idDocente, id_curso: idCurso })
    });
    
    const data = await response.json();
    
    if (data.exito) {
      exito(
        '✅ Curso asignado',
        `El curso fue asignado. Horas totales: ${data.horas_totales_asignadas}/${40}`
      );
    } else {
      error(
        '❌ No se pudo asignar',
        data.error || 'Revisa las horas disponibles'
      );
    }
  } catch (err) {
    error('❌ Error', 'Ocurrió un problema inesperado');
  }
};
```

### Validación de Formulario
```typescript
const guardarFormulario = (datos) => {
  // Validar
  if (!datos.nombre) {
    advertencia('Campo requerido', 'Debes ingresar el nombre');
    return;
  }
  
  if (datos.horas > 40) {
    error(
      '❌ Exceso de horas',
      `Las horas asignadas (${datos.horas}) no pueden exceder 40`
    );
    return;
  }
  
  info('Validación', 'Todo está correcto. Guardando...');
  // Guardar datos
};
```

## 🎨 Personalización Avanzada

### Cambiar colores (en `ContenedorAlertas.tsx`)
Modifica el objeto `estilos` para ajustar colores:
```typescript
exito: {
  contenedor: 'bg-green-50 border border-green-300', // ← Fondo y borde
  titulo: 'text-green-900 font-semibold',              // ← Color del título
  mensaje: 'text-green-800',                           // ← Color del mensaje
  icono: '✅',                                          // ← Icono personalizado
  boton: 'text-green-600 hover:text-green-800'        // ← Botón cerrar
}
```

### Agregar nuevos tipos de alerta
En `useAlertasTemporales.ts`, agrega:
```typescript
const exito = (titulo, mensaje, duracion) => {
  mostrarAlerta('exito', titulo, mensaje, duracion);
};

// Agregar nuevo tipo
const personalizado = (titulo, mensaje, duracion) => {
  mostrarAlerta('personalizado', titulo, mensaje, duracion);
};
```

Luego en `ContenedorAlertas.tsx`:
```typescript
personalizado: {
  contenedor: 'bg-purple-50 border border-purple-300',
  titulo: 'text-purple-900 font-semibold',
  // ... etc
}
```

---

**Nota**: Este sistema reemplaza completamente los `alert()` del navegador, mejorando significativamente la experiencia del usuario y la apariencia profesional de la aplicación.
