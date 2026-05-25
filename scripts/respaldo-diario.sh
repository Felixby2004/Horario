#!/bin/bash

# Script de respaldo diario
# Ubicación: scripts/respaldo-diario.sh

echo "=== Respaldo Diario del Sistema de Horarios ==="
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"

# Configuración
DB_NAME="horarios_unt"
DB_USER="postgres"
BACKUP_DIR="/var/backups/horarios"
FECHA=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/horarios_$FECHA.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Respaldo de base de datos
echo "Respaldando base de datos..."
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Comprimir
echo "Comprimiendo respaldo..."
gzip $BACKUP_FILE

# Eliminar respaldos antiguos (más de 30 días)
echo "Limpiando respaldos antiguos..."
find $BACKUP_DIR -name "horarios_*.sql.gz" -mtime +30 -delete

echo "Respaldo completado: ${BACKUP_FILE}.gz"
echo "Tamaño: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

# Enviar notificación
curl -X POST http://localhost:3000/api/notificaciones/enviar \
  -H "Content-Type: application/json" \
  -d "{\"asunto\":\"Respaldo diario completado\",\"mensaje\":\"Respaldo generado exitosamente\"}"

echo "=== Respaldo Finalizado ==="
