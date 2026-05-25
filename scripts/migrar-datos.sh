#!/bin/bash

# Script para migrar datos entre ambientes

echo "=== Script de Migración de Datos ==="
echo "Universidad Nacional de Trujillo"
echo ""

# Configuración
ORIGEN_DB="horarios_unt_prod"
DESTINO_DB="horarios_unt_dev"
BACKUP_DIR="./backups"
FECHA=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups
mkdir -p $BACKUP_DIR

echo "1. Creando backup de base de datos origen..."
pg_dump -U postgres -d $ORIGEN_DB > "$BACKUP_DIR/backup_$FECHA.sql"

if [ $? -eq 0 ]; then
    echo "   ✅ Backup creado exitosamente"
else
    echo "   ❌ Error al crear backup"
    exit 1
fi

echo ""
echo "2. Limpiando base de datos destino..."
psql -U postgres -d $DESTINO_DB -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

if [ $? -eq 0 ]; then
    echo "   ✅ Base de datos destino limpiada"
else
    echo "   ❌ Error al limpiar destino"
    exit 1
fi

echo ""
echo "3. Restaurando datos en destino..."
psql -U postgres -d $DESTINO_DB < "$BACKUP_DIR/backup_$FECHA.sql"

if [ $? -eq 0 ]; then
    echo "   ✅ Datos restaurados exitosamente"
else
    echo "   ❌ Error al restaurar datos"
    exit 1
fi

echo ""
echo "4. Aplicando migraciones Prisma..."
cd ..
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "   ✅ Migraciones aplicadas"
else
    echo "   ❌ Error en migraciones"
    exit 1
fi

echo ""
echo "=== Migración completada exitosamente ==="
echo "Backup guardado en: $BACKUP_DIR/backup_$FECHA.sql"
