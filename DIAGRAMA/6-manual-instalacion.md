# Manual de Instalación del Sistema de Gestión de Horarios

---

## Índice
1. [Requisitos Previos del Sistema](#1-requisitos-previos-del-sistema)
   1.1. [Hardware](#11-hardware)
   1.2. [Software y Versiones Compatibles](#12-software-y-versiones-compatibles)
2. [Descarga y Carga de Archivos](#2-descarga-y-carga-de-archivos)
3. [Configuración Inicial Paso a Paso](#3-configuración-inicial-paso-a-paso)
   3.1. [Configuración de Variables de Entorno](#31-configuración-de-variables-de-entorno)
   3.2. [Instalación de Dependencias](#32-instalación-de-dependencias)
   3.3. [Configuración de la Base de Datos](#33-configuración-de-la-base-de-datos)
   3.4. [Generación de la Base de Datos y Prisma Client](#34-generación-de-la-base-de-datos-y-prisma-client)
   3.5. [Carga de Datos Iniciales](#35-carga-de-datos-iniciales)
4. [Verificación de la Instalación](#4-verificación-de-la-instalación)
5. [Guía para Solucionar Errores Comunes](#5-guía-para-solucionar-errores-comunes)

---

## 1. Requisitos Previos del Sistema

### 1.1. Hardware
| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| Procesador | Intel Core i3 o equivalente | Intel Core i5 o superior |
| Memoria RAM | 4 GB | 8 GB o más |
| Almacenamiento | 10 GB libres | 20 GB libres |
| Conexión a Internet | Necesaria para dependencias y servicios externos | Conexión estable |

### 1.2. Software y Versiones Compatibles
- **Sistema Operativo**: Windows 10+, macOS 12+, Linux (Ubuntu 20.04+, Debian 11+)
- **Node.js**: Versión 18.17.0 o superior, pero inferior a 21.0.0
- **npm**: Versión 9+ (incluido con Node.js)
- **PostgreSQL**: Versión 14 o superior
- **Redis**: Versión 6+ (opcional, para caché)
- **Navegador Web**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

---

## 2. Descarga y Carga de Archivos

1. **Obtener el código fuente**:
   - Si el proyecto está en un repositorio Git:
     ```bash
     git clone [URL_DEL_REPOSITORIO]
     cd horarios-unt
     ```
   - Si se recibió un archivo comprimido (.zip, .tar.gz):
     - Descomprimir el archivo en la ubicación deseada
     - Navegar a la carpeta del proyecto

2. **Verificar la estructura del proyecto**:
   - Asegúrate de que existan los archivos clave:
     - `package.json`
     - `prisma/schema.prisma`
     - `.env.ejemplo`
     - `README.md`

---

## 3. Configuración Inicial Paso a Paso

### 3.1. Configuración de Variables de Entorno
1. Copiar el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.ejemplo .env.local
   ```
   (En Windows PowerShell: `Copy-Item .env.ejemplo .env.local`)

2. Editar el archivo `.env.local` con tus credenciales y configuraciones:

   ```env
   # Base de Datos PostgreSQL
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/horarios_unt"
   
   # JWT Secret (cámbialo por una clave segura)
   JWT_SECRET="tu-clave-secreta-segura-aqui"
   
   # API URL
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   
   # Redis (OPCIONAL - comentar si no lo tienes instalado)
   # REDIS_URL="redis://localhost:6379"
   
   # Email (OPCIONAL - para notificaciones)
   # SMTP_HOST="smtp.gmail.com"
   # SMTP_PORT="587"
   # SMTP_USER="tu-email@gmail.com"
   # SMTP_PASS="tu-contraseña"
   # SMTP_FROM="horarios@unt.edu.pe"
   ```

### 3.2. Instalación de Dependencias
1. Abrir una terminal en la carpeta del proyecto
2. Ejecutar el comando para instalar todas las dependencias:
   ```bash
   npm install
   ```

### 3.3. Configuración de la Base de Datos
1. **Instalar y configurar PostgreSQL**:
   - Descargar PostgreSQL desde https://www.postgresql.org/download/
   - Instalar PostgreSQL y recordar la contraseña del usuario `postgres`
   - Crear una base de datos llamada `horarios_unt`:
     ```sql
     CREATE DATABASE horarios_unt;
     ```

### 3.4. Generación de la Base de Datos y Prisma Client
1. Generar el cliente de Prisma:
   ```bash
   npm run prisma:generate
   ```

2. Aplicar el esquema a la base de datos:
   ```bash
   npx prisma db push
   ```

3. (Opcional) Si hay migraciones disponibles, aplicarlas:
   ```bash
   npm run prisma:migrate
   ```

### 3.5. Carga de Datos Iniciales
1. Ejecutar el script para crear el usuario administrador:
   ```bash
   npm run db:insert-admin
   ```

2. (Opcional) Cargar datos de prueba:
   ```bash
   npm run prisma:seed
   ```

---

## 4. Verificación de la Instalación

1. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Acceder al sistema**:
   - Abrir un navegador y visitar http://localhost:3000
   - Deberías ver la página de inicio de sesión

3. **Iniciar sesión con credenciales de administrador**:
   - Usuario: `admin`
   - Contraseña: `admin123` (cámbiala después de iniciar sesión)

4. **Verificar funcionalidades clave**:
   - Navegar al dashboard
   - Verificar que se puedan acceder a los módulos principales (Docentes, Cursos, Horarios, etc.)
   - Probar la conexión a la base de datos desde Prisma Studio:
     ```bash
     npm run prisma:studio
     ```

---

## 5. Guía para Solucionar Errores Comunes

### Error: "Cannot find module" al ejecutar npm run dev
- **Solución**: Borrar la carpeta `node_modules` y el archivo `package-lock.json`, luego volver a ejecutar `npm install`:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
  (En Windows PowerShell: `Remove-Item -Recurse -Force node_modules, package-lock.json`)

### Error de conexión a PostgreSQL
- **Solución**:
  1. Verifica que PostgreSQL esté ejecutándose
  2. Asegúrate de que el puerto 5432 esté disponible
  3. Verifica que las credenciales en `DATABASE_URL` sean correctas
  4. Asegúrate de que la base de datos `horarios_unt` exista

### Error: Prisma Client not found
- **Solución**: Volver a generar el cliente de Prisma:
  ```bash
  npm run prisma:generate
  ```

### Error de Node.js versión incompatible
- **Solución**:
  - Verifica tu versión de Node.js: `node -v`
  - Instala una versión compatible usando nvm (Node Version Manager):
    ```bash
    nvm install 20
    nvm use 20
    ```

### Error al generar PDFs (Puppeteer)
- **Solución**:
  - En Linux: Instalar dependencias adicionales:
    ```bash
    sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
    ```
  - En Windows/macOS: Asegúrate de tener la última versión de Chrome/Chromium instalada

---
