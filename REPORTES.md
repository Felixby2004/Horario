# Sistema de Reportes - Horarios UNT

## Descripción General

Sistema completo de generación de reportes en PDF y Excel para el sistema de gestión de horarios de la Universidad Nacional de Trujillo.

## Tipos de Reportes

### 1. Reporte por Aula 📫
**Ruta**: `/dashboard/reportes/aula`
**Descripción**: Horario semanal completo de una aula específica

**Características:**
- Horario semanal organizado por día
- Información de cursos, grupos y docentes
- Disponible en PDF y Excel

**Parámetros requeridos:**
- `id_ambiente`: ID del aula
- `id_periodo`: ID del período académico
- `formato`: 'pdf' o 'excel' (por defecto 'pdf')

**Endpoint API:**
```
POST /api/reportes/aula
Body: { id_ambiente, id_periodo, formato }
```

---

### 2. Reporte por Laboratorio 🔬
**Ruta**: `/dashboard/reportes/laboratorio`
**Descripción**: Horario semanal de un laboratorio

**Características:**
- Horario semanal de prácticas
- Información de cursos prácticos y grupos
- Disponible en PDF y Excel

**Parámetros requeridos:**
- `id_ambiente`: ID del laboratorio
- `id_periodo`: ID del período académico
- `formato`: 'pdf' o 'excel'

**Endpoint API:**
```
POST /api/reportes/laboratorio
Body: { id_ambiente, id_periodo, formato }
```

---

### 3. Reporte por Docente 👨‍🏫
**Ruta**: `/dashboard/reportes/docente`
**Descripción**: Horario semanal o carga horaria de un docente

**Opciones:**
1. **Horario Semanal**: Horario de clases organizados por día y hora
2. **Carga Horaria**: Resumen total de horas y cursos asignados

**Características:**
- Información detallada del docente
- Listado de cursos y ambientes
- Cálculo de carga horaria total
- Disponible en PDF y Excel

**Parámetros requeridos:**
- `id_docente`: ID del docente
- `id_periodo`: ID del período académico
- `tipo`: 'horario' o 'carga'
- `formato`: 'pdf' o 'excel'

**Endpoint API:**
```
POST /api/reportes/docente
Body: { id_docente, id_periodo, tipo, formato }
```

---

### 4. Reporte de Gestión 📊
**Ruta**: `/dashboard/reportes/gestion`
**Descripción**: Estadísticas y análisis general del sistema

**Características:**
- Estadísticas globales (total de horarios, docentes, ambientes, grupos, cursos)
- Carga horaria por docente (tabla detallada)
- Promedios y ratios de distribución
- Gráficos de desempeño
- Disponible en PDF

**Parámetros requeridos:**
- `id_periodo`: ID del período académico
- `formato`: 'pdf' o 'excel'

**Endpoint API:**
```
POST /api/reportes/gestion
Body: { id_periodo, formato }
```

---

## Estructura del Código

### Directorios

```
src/
├── app/
│   ├── dashboard/
│   │   └── reportes/
│   │       ├── page.tsx                    # Página principal de reportes
│   │       ├── aula/page.tsx              # Página reporte aula
│   │       ├── laboratorio/page.tsx       # Página reporte laboratorio
│   │       ├── docente/page.tsx           # Página reporte docente
│   │       └── gestion/page.tsx           # Página reporte gestión
│   └── api/
│       └── reportes/
│           ├── aula/route.ts              # API aula
│           ├── laboratorio/route.ts       # API laboratorio
│           ├── docente/route.ts           # API docente
│           └── gestion/route.ts           # API gestión
├── services/
│   └── reportes/
│       ├── GeneradorPDF.ts                # Generador de PDFs
│       └── utils.ts                       # Utilidades
└── components/
    └── reportes/
        └── (componentes reutilizables)
```

### Archivos Principales

#### `GeneradorPDF.ts`
Clase responsable de generar todos los tipos de reportes:

**Métodos públicos:**
- `generarReporteAula(idAmbiente, idPeriodo)` - Genera PDF de horario de aula
- `generarReporteLaboratorio(idAmbiente, idPeriodo)` - Genera PDF de laboratorio
- `generarReporteDocenteHorario(idDocente, idPeriodo)` - Genera PDF de horario docente
- `generarReporteCargaHoraria(idDocente, idPeriodo)` - Genera PDF de carga horaria
- `generarReporteGestion(idPeriodo)` - Genera PDF de gestión
- `generarExcelAula(idAmbiente, idPeriodo)` - Genera Excel de aula
- `generarExcelDocente(idDocente, idPeriodo)` - Genera Excel de docente

**Métodos privados:**
- `generarHTMLReporteAula()` - HTML para aula
- `generarHTMLReporteDocenteHorario()` - HTML para horario docente
- `generarHTMLCargaHoraria()` - HTML para carga horaria
- `generarHTMLReporteGestion()` - HTML para gestión
- `obtenerNombreDia()` - Convierte número a nombre del día
- `convertirAPDF()` - Convierte HTML a PDF usando Puppeteer

---

## Instalación y Configuración

### Dependencias Requeridas
```json
{
  "puppeteer": "^21.9.0",
  "xlsx": "^0.18.5"
}
```

Estas dependencias ya están incluidas en el proyecto.

### Variables de Entorno
No se requieren variables de entorno especiales. El sistema utiliza la conexión a base de datos existente.

### Configuración de Puppeteer
El generador de PDF utiliza Puppeteer sin sandbox en producción:
```javascript
args: ['--no-sandbox', '--disable-setuid-sandbox']
```

---

## Uso

### Desde el Dashboard
1. Navega a `/dashboard/reportes`
2. Selecciona el tipo de reporte deseado
3. Completa los campos requeridos
4. Elige el formato (PDF o Excel)
5. Haz clic en "Descargar"

### Desde la API
Realiza una solicitud POST al endpoint correspondiente:

```javascript
// Ejemplo: Generar PDF de aula
const response = await fetch('/api/reportes/aula', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_ambiente: 1,
    id_periodo: 5,
    formato: 'pdf'
  })
});

const blob = await response.blob();
// Descargar o procesar blob...
```

---

## Características de Diseño

### Elementos Visuales
- **Logo institucional**: Universidad Nacional de Trujillo
- **Encabezados profesionales**: Azul institucional (#1e40af)
- **Tablas con formato**: Bordes, colores alternados, legibilidad
- **Información contextual**: Datos institucionales, período, fecha de generación

### Estilos de Tabla
- Encabezados azul con texto blanco
- Filas alternadas (gris y blanco) para mejor legibilidad
- Márgenes y espaciados profesionales
- Fuentes legibles en tamaño adecuado

### Información Incluida

**Aula/Laboratorio:**
- Nombre y tipo del ambiente
- Capacidad
- Horario por día
- Curso, grupo y docente

**Docente:**
- Datos del docente (código, categoría)
- Horario semanal O resumen de carga
- Horas totales
- Cursos y ambientes

**Gestión:**
- Estadísticas en tarjetas visuales
- Carga horaria por docente
- Promedios y ratios
- Fecha y hora de generación

---

## Mantenimiento

### Agregar Nuevo Tipo de Reporte
1. Crear página en `src/app/dashboard/reportes/[nuevo]/page.tsx`
2. Crear endpoint en `src/app/api/reportes/[nuevo]/route.ts`
3. Agregar método en `GeneradorPDF.ts`
4. Actualizar página principal de reportes

### Personalizar Estilos
Editar los métodos `generarHTML*` en `GeneradorPDF.ts`:
- Modificar etiquetas `<style>`
- Ajustar colores, fuentes, tamaños
- Cambiar layout y estructura

### Agregar Campos
1. Actualizar consultas de base de datos
2. Incluir en templates HTML
3. Formatear datos según sea necesario

---

## Troubleshooting

### "Error generando reporte"
- Verificar que el ID de período existe
- Verificar que el ID de aula/docente existe
- Revisar logs del servidor

### Reporte generado pero vacío
- Verificar que hay datos en la base de datos para el período seleccionado
- Revisar el estado de los horarios (deben ser 'confirmado' o 'publicado')

### Problemas con Puppeteer
- En Docker: se necesita instalar dependencias de navegador
- En localhost: debería funcionar automáticamente
- Verificar permisos de archivo temporal

### Excel no se descarga
- Verificar formato MIME correcto
- Revisar consola para errores
- Intentar con PDF primero para verificar la API

---

## Ejemplos de Solicitudes

### Descargar PDF de Aula
```bash
curl -X POST http://localhost:3000/api/reportes/aula \
  -H "Content-Type: application/json" \
  -d '{
    "id_ambiente": 1,
    "id_periodo": 1,
    "formato": "pdf"
  }' \
  -o reporte-aula.pdf
```

### Descargar Excel de Docente
```bash
curl -X POST http://localhost:3000/api/reportes/docente \
  -H "Content-Type: application/json" \
  -d '{
    "id_docente": 1,
    "id_periodo": 1,
    "tipo": "carga",
    "formato": "excel"
  }' \
  -o reporte-carga.xlsx
```

---

## Futuras Mejoras
- [ ] Historial de reportes generados
- [ ] Programación automática de reportes
- [ ] Exportación a más formatos (Word, PowerPoint)
- [ ] Gráficos embebidos en PDF
- [ ] Comparación entre períodos
- [ ] Reportes por escuela/carrera
- [ ] Envío automático por email
