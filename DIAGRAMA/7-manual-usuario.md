# Manual de Usuario del Sistema de Gestión de Horarios

---

## Índice
1. [Introducción](#1-introducción)
   1.1. [Propósito del Proyecto](#11-propósito-del-proyecto)
   1.2. [Alcance del Sistema](#12-alcance-del-sistema)
2. [Descripción de Funcionalidades y Módulos](#2-descripción-de-funcionalidades-y-módulos)
3. [Instrucciones Paso a Paso](#3-instrucciones-paso-a-paso)
   3.1. [Inicio de Sesión](#31-inicio-de-sesión)
   3.2. [Gestión de Períodos Académicos](#32-gestión-de-períodos-académicos)
   3.3. [Gestión de Docentes](#33-gestión-de-docentes)
   3.4. [Gestión de Cursos](#34-gestión-de-cursos)
   3.5. [Gestión de Grupos](#35-gestión-de-grupos)
   3.6. [Gestión de Ambientes](#36-gestión-de-ambientes)
   3.7. [Gestión de Horarios](#37-gestión-de-horarios)
   3.8. [Carga Académica](#38-carga-académica)
   3.9. [Reportes](#39-reportes)
4. [Gestión de Datos](#4-gestión-de-datos)
   4.1. [Almacenamiento](#41-almacenamiento)
   4.2. [Copias de Seguridad](#42-copias-de-seguridad)
   4.3. [Recuperación](#43-recuperación)
5. [Mantenimiento Preventivo](#5-mantenimiento-preventivo)
6. [Glosario de Términos Técnicos](#6-glosario-de-términos-técnicos)
7. [Preguntas Frecuentes (FAQ)](#7-preguntas-frecuentes-faq)

---

## 1. Introducción

### 1.1. Propósito del Proyecto
El Sistema de Gestión de Horarios es una herramienta web diseñada para automatizar y optimizar la gestión de horarios académicos, carga docente y generación de reportes oficiales de la Escuela de Ingeniería de Sistemas de la Universidad Nacional de Trujillo.

### 1.2. Alcance del Sistema
El sistema incluye los siguientes módulos principales:
- Gestión de períodos académicos
- Gestión de docentes
- Gestión de cursos y prerrequisitos
- Gestión de grupos
- Gestión de ambientes (aulas, laboratorios, etc.)
- Asignación y gestión de horarios
- Carga académica de docentes
- Generación de reportes PDF
- Notificaciones multicanal (correo, WhatsApp, Telegram)

---

## 2. Descripción de Funcionalidades y Módulos

### 2.1. Módulo de Autenticación y Autorización
- Inicio de sesión seguro con credenciales
- Roles de usuario: Administrador del Sistema, Director de Escuela, Coordinador Académico, Operador de Horarios, Docente
- Cierre de sesión seguro
- Gestión de perfil de usuario

### 2.2. Dashboard
- Vista principal con KPIs clave en tiempo real
- Mapa de calor de ocupación de ambientes
- Gráficos de distribución de horarios y carga docente
- Acceso rápido a funciones frecuentes

### 2.3. Gestión de Períodos Académicos
- Crear, editar y eliminar períodos académicos
- Configurar fechas de inicio y fin de clases
- Gestionar el estado de los períodos (planificación, asignación, en curso, finalizado)

### 2.4. Gestión de Docentes
- Registrar nuevos docentes con información completa
- Editar datos de docentes existentes
- Importar docentes desde archivos Excel/CSV
- Asignar cursos y grupos a docentes
- Gestionar disponibilidad de docentes

### 2.5. Gestión de Cursos
- Crear, editar y eliminar cursos
- Configurar horas de teoría, práctica y laboratorio
- Gestionar prerrequisitos múltiples por curso
- Asignar cursos a departamentos académicos

### 2.6. Gestión de Grupos
- Crear grupos para cada curso y período
- Configurar capacidad máxima de estudiantes
- Asignar docentes a grupos

### 2.7. Gestión de Ambientes
- Registrar aulas, laboratorios, auditorios y salones de reunión
- Configurar capacidad y características de cada ambiente
- Gestionar mantenimiento de ambientes

### 2.8. Gestión de Horarios
- Matriz interactiva para asignación de horarios
- Validación en tiempo real de conflictos
- Detección automática de cruces (docente, grupo, ambiente)
- Ventanas de atención priorizadas por jerarquía
- Publicación y confirmación masiva de horarios

### 2.9. Carga Académica
- Registro de horas lectivas y no lectivas
- Cálculo automático de horas de preparación y evaluación
- Flujo de aprobación (borrador → enviado → en revisión → observado → validado → aprobado → publicado)
- Generación de Formato N°1 y Declaración Jurada

### 2.10. Reportes
- Horario por aula/laboratorio
- Horario por docente
- Horario por curso/grupo
- Reporte de gestión ejecutivo
- Reporte de conflictos
- Exportación a PDF y Excel

### 2.11. Notificaciones
- Envío de notificaciones por correo electrónico, WhatsApp y Telegram
- Recordatorios automáticos
- Historial de notificaciones enviadas

---

## 3. Instrucciones Paso a Paso

### 3.1. Inicio de Sesión
1. Abrir el navegador y acceder a la URL del sistema
2. Ingresar tu nombre de usuario y contraseña
3. Hacer clic en "Iniciar Sesión"
4. Si las credenciales son correctas, serás redirigido al dashboard principal

> **Nota**: Si olvidas tu contraseña, contacta al administrador del sistema para restablecerla.

### 3.2. Gestión de Períodos Académicos
#### Crear un nuevo período académico:
1. En el menú lateral, ir a **Períodos**
2. Hacer clic en **Nuevo Período**
3. Completar el formulario:
   - Código del período
   - Nombre del período
   - Año
   - Semestre
   - Fecha de inicio
   - Fecha de fin
   - Fecha de inicio de clases (opcional)
   - Fecha de fin de clases (opcional)
4. Hacer clic en **Guardar**

#### Editar un período existente:
1. En la lista de períodos, hacer clic en el ícono de editar (✏️) del período que deseas modificar
2. Actualizar los datos necesarios
3. Hacer clic en **Guardar**

### 3.3. Gestión de Docentes
#### Registrar un nuevo docente:
1. En el menú lateral, ir a **Docentes**
2. Hacer clic en **Nuevo Docente**
3. Completar el formulario con los datos del docente:
   - Código de docente
   - DNI
   - Nombres y apellidos
   - Modalidad
   - Categoría
   - Tipo de contrato
   - Dedicación laboral
   - Horas máximas semanales
   - Correo electrónico
   - Teléfono
   - Grado académico
   - Especialidad
4. Hacer clic en **Guardar**

#### Importar docentes desde Excel/CSV:
1. En la página de Docentes, hacer clic en **Importar**
2. Seleccionar el archivo Excel o CSV con los datos de los docentes
3. Verificar la previsualización de los datos
4. Hacer clic en **Importar**

#### Asignar cursos a un docente:
1. En la lista de docentes, hacer clic en el docente
2. Ir a la pestaña **Cursos Asignados**
3. Hacer clic en **Asignar Curso**
4. Seleccionar el curso y el tipo de clase (teoría, práctica, laboratorio)
5. Hacer clic en **Guardar**

### 3.4. Gestión de Cursos
#### Crear un nuevo curso:
1. En el menú lateral, ir a **Cursos**
2. Hacer clic en **Nuevo Curso**
3. Completar el formulario:
   - Código del curso
   - Nombre del curso
   - Tipo de curso
   - Departamento académico
   - Horas de teoría
   - Horas de práctica
   - Horas de laboratorio
   - Créditos
   - Ciclo
   - Plan de estudios
4. (Opcional) Agregar prerrequisitos:
   - En la sección "Prerrequisitos", hacer clic en **Agregar Prerrequisito**
   - Seleccionar el curso prerrequisito
5. Hacer clic en **Guardar**

### 3.5. Gestión de Grupos
#### Crear un nuevo grupo:
1. En el menú lateral, ir a **Grupos**
2. Hacer clic en **Nuevo Grupo**
3. Completar el formulario:
   - Seleccionar el período académico
   - Seleccionar el curso
   - Código del grupo
   - Capacidad máxima
4. Hacer clic en **Guardar**

### 3.6. Gestión de Ambientes
#### Registrar un nuevo ambiente:
1. En el menú lateral, ir a **Ambientes**
2. Hacer clic en **Nuevo Ambiente**
3. Completar el formulario:
   - Código del ambiente
   - Nombre
   - Tipo (aula, laboratorio, auditorio, sala de reuniones)
   - Capacidad
   - Piso
   - Pabellón
   - Equipamiento
   - Características adicionales
4. Hacer clic en **Guardar**

### 3.7. Gestión de Horarios
#### Asignar un horario:
1. En el menú lateral, ir a **Horarios** → **Selección**
2. Seleccionar el período académico
3. Usar la matriz interactiva para seleccionar:
   - Docente
   - Curso
   - Grupo
   - Tipo de clase
   - Ambiente
   - Día de la semana
   - Hora de inicio y fin
4. Hacer clic en **Asignar**
5. El sistema validará automáticamente si hay conflictos

#### Publicar horarios:
1. En la página de Horarios, ir a la lista de horarios asignados
2. Seleccionar los horarios que deseas publicar
3. Hacer clic en **Publicar Seleccionados**

### 3.8. Carga Académica
#### Completar la carga académica (para docentes):
1. En el menú lateral (para docentes), ir a **Carga Académica**
2. Verificar las horas lectivas asignadas automáticamente
3. Agregar actividades no lectivas:
   - Hacer clic en **Agregar Actividad No Lectiva**
   - Seleccionar el tipo de actividad
   - Ingresar el nombre y descripción
   - Especificar las horas semanales
4. Verificar que el total de horas cumpla con la meta de jornada
5. Cuando esté listo, hacer clic en **Enviar para Revisión**

#### Aprobar carga académica (para administradores):
1. En el menú lateral, ir a **Carga Académica**
2. Ver la lista de cargas enviadas para revisión
3. Hacer clic en una carga para ver los detalles
4. Si todo está correcto, hacer clic en **Validar** y luego en **Aprobar**
5. Si hay observaciones, hacer clic en **Observar**, escribir el motivo y enviar

### 3.9. Reportes
#### Generar un reporte:
1. En el menú lateral, ir a **Reportes**
2. Seleccionar el tipo de reporte que deseas generar:
   - Horario por Aula/Laboratorio
   - Horario por Docente
   - Horario por Ciclo
   - Reporte de Gestión
   - Reporte de Conflictos
3. Configurar los filtros necesarios (período, docente, ambiente, etc.)
4. Hacer clic en **Generar Reporte**
5. Para descargar el reporte en PDF, hacer clic en **Descargar PDF**

---

## 4. Gestión de Datos

### 4.1. Almacenamiento
Todos los datos del sistema se almacenan en una base de datos PostgreSQL. Los tipos de datos almacenados incluyen:
- Datos de usuarios y docentes
- Información de cursos, grupos y ambientes
- Horarios asignados
- Carga académica
- Historial de auditoría

### 4.2. Copias de Seguridad
Es recomendable realizar copias de seguridad periódicas de la base de datos. Para ello:
1. **Copia de seguridad manual**:
   ```bash
   pg_dump -U postgres horarios_unt > backup_horarios_unt_$(date +%Y%m%d).sql
   ```

2. **Copia de seguridad automática**:
   - Configurar un cron job (Linux) o Tarea Programada (Windows) para ejecutar el comando de copia de seguridad periódicamente (diariamente, semanalmente, etc.)
   - Almacenar las copias de seguridad en un lugar seguro (disco externo, servicio de nube, etc.)

### 4.3. Recuperación
Para restaurar una copia de seguridad:
```bash
psql -U postgres horarios_unt < backup_horarios_unt_YYYYMMDD.sql
```

---

## 5. Mantenimiento Preventivo
Para garantizar el correcto funcionamiento del sistema, se recomienda:
1. **Actualizaciones**: Mantener actualizadas las dependencias del proyecto y el software del servidor
2. **Monitoreo**: Verificar periódicamente el uso de recursos del servidor (CPU, memoria, disco)
3. **Limpieza**: Eliminar registros temporales y datos obsoletos
4. **Pruebas**: Realizar pruebas periódicas de las funcionalidades principales
5. **Documentación**: Mantener actualizada la documentación del sistema

---

## 6. Glosario de Términos Técnicos
- **API**: Interfaz de Programación de Aplicaciones, conjunto de reglas para que diferentes sistemas se comuniquen entre sí
- **Base de Datos**: Conjunto estructurado de datos almacenados electrónicamente
- **Dashboard**: Panel de control principal del sistema que muestra información resumida
- **JWT**: JSON Web Token, estándar para la creación de tokens de acceso seguros
- **KPI**: Indicador Clave de Desempeño, métrica para medir el progreso hacia un objetivo
- **Middleware**: Software que actúa como puente entre un sistema operativo y las aplicaciones que se ejecutan en él
- **ORM**: Mapeo Objeto-Relacional, técnica para convertir datos entre sistemas de tipos incompatibles usando programación orientada a objetos
- **PostgreSQL**: Sistema de gestión de bases de datos relacionales de código abierto
- **Prisma**: ORM moderno para Node.js y TypeScript
- **Redis**: Almacén de datos en memoria de código abierto, usado como caché
- **WebSocket**: Protocolo de comunicación que permite la transmisión bidireccional de datos en tiempo real

---

## 7. Preguntas Frecuentes (FAQ)

### ¿Cómo cambio mi contraseña?
1. Inicia sesión en el sistema
2. Ve a **Perfil** en el menú lateral
3. Haz clic en **Cambiar Contraseña**
4. Ingresa tu contraseña actual y la nueva contraseña
5. Haz clic en **Guardar**

### ¿Qué hago si hay un conflicto de horarios?
El sistema detecta automáticamente los conflictos y te mostrará una alerta. Debes modificar el horario para resolver el conflicto (cambiar de día, hora, ambiente o docente).

### ¿Cómo puedo ver el historial de cambios en un horario?
1. Ve a la lista de horarios
2. Haz clic en el horario que deseas revisar
3. Ve a la pestaña **Historial de Auditoría**

### ¿Puedo exportar los datos a Excel?
Sí, muchos módulos del sistema permiten exportar datos a Excel. Busca el botón **Exportar a Excel** en las páginas de listado.

### ¿Cómo configuro las notificaciones?
1. Ve a **Configuración** → **Notificaciones**
2. Configura los canales de notificación que deseas usar (correo, WhatsApp, Telegram)
3. Ingresa tus datos de contacto para cada canal
4. Guarda los cambios

### ¿El sistema funciona sin conexión a Internet?
La mayoría de las funcionalidades requieren conexión a Internet. Sin embargo, algunas funcionalidades básicas pueden estar disponibles sin conexión si el servidor está en una red local.

---
