
# Scripts de Exportación e Importación de Datos

Este directorio contiene scripts para exportar e importar los datos de la base de datos de horarios, facilitando la transferencia de datos entre diferentes ordenadores.

## Archivos

- `exportar-datos.ts`: Script para exportar datos de la base de datos a archivos JSON
- `importar-datos.ts`: Script para importar datos desde archivos JSON a la base de datos
- `tsconfig-scripts.json`: Configuración de TypeScript para los scripts
- `datos-exportados/`: Carpeta donde se guardan los archivos JSON exportados

## Cómo usar

### 1. Exportar datos

Para exportar los datos de la base de datos actual:

```bash
npm run db:export
```

Esto creará una carpeta `datos-exportados` con todos los datos en formato JSON.

### 2. Importar datos

Para importar datos a una nueva base de datos:

1. Asegúrate de tener la carpeta `datos-exportados` con los archivos JSON
2. Ejecuta:

```bash
npm run db:import
```

**Nota:** Este script eliminará todos los datos existentes en la base de datos antes de importar los nuevos datos.

## Transferir datos a otro ordenador

1. En el ordenador origen:
   - Ejecuta `npm run db:export`
   - Copia la carpeta `scripts/datos-exportados`

2. En el ordenador destino:
   - Asegúrate de tener la aplicación configurada y la base de datos creada
   - Pega la carpeta `datos-exportados` en el directorio `scripts/`
   - Ejecuta `npm run db:import`

## Tablas incluidas

Los scripts exportan/importan las siguientes tablas:
- periodos-academicos
- usuarios
- docentes
- cursos
- grupos
- ambientes
- docente-cursos
- docente-grupos
- curso-ambientes
- ventanas-atencion
- horarios-asignados
- dias-no-laborables
- restricciones-institucionales
- disponibilidad-docente
