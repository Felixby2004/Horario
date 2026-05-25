#!/bin/bash

# Script para limpiar caché Redis

echo "=== Limpieza de Caché Redis ==="
echo ""

echo "1. Conectando a Redis..."
redis-cli ping

if [ $? -eq 0 ]; then
    echo "   ✅ Conectado a Redis"
else
    echo "   ❌ No se pudo conectar a Redis"
    exit 1
fi

echo ""
echo "2. Limpiando cachés de estadísticas..."
redis-cli --scan --pattern "stats:*" | xargs -L 1 redis-cli del

echo ""
echo "3. Limpiando cachés de disponibilidad..."
redis-cli --scan --pattern "disp:*" | xargs -L 1 redis-cli del

echo ""
echo "4. Limpiando cachés generales..."
redis-cli --scan --pattern "cache:*" | xargs -L 1 redis-cli del

echo ""
echo "5. Estado final de Redis..."
redis-cli INFO keyspace

echo ""
echo "=== Limpieza completada ==="
