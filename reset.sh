#!/bin/bash

# Script de Reinicio Limpio de Servicios para CRM Sumelga
# Diseñado para liberar el puerto 8000 de procesos huérfanos y arrancar el servidor limpiamente.

GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;37m' # No Color

echo -e "${PURPLE}====================================================${NC}"
echo -e "${PURPLE}   CRM Sumelga - Reiniciador de Servicios Estables  ${NC}"
echo -e "${PURPLE}====================================================${NC}"

# 1. Detectar y matar procesos escuchando en el puerto 8000
echo -e "${BLUE}[1/4] Analizando el puerto 8000...${NC}"
PIDS=$(lsof -t -i :8000)

if [ -n "$PIDS" ]; then
    echo -e "${YELLOW}Se detectaron procesos activos en el puerto 8000 (PIDs: $PIDS).${NC}"
    echo -e "${BLUE}Terminando procesos asociados...${NC}"
    
    # Intentar kill suave primero
    kill $PIDS 2>/dev/null
    sleep 1
    
    # Verificar si siguen vivos y usar kill -9
    REMAINING_PIDS=$(lsof -t -i :8000)
    if [ -n "$REMAINING_PIDS" ]; then
        echo -e "${RED}Algunos procesos se resisten a cerrar. Forzando terminación con kill -9...${NC}"
        kill -9 $REMAINING_PIDS 2>/dev/null
        sleep 1
    fi
    echo -e "${GREEN}✓ Puerto 8000 liberado correctamente.${NC}"
else
    echo -e "${GREEN}✓ El puerto 8000 ya estaba libre. Sin procesos conflictivos.${NC}"
fi

# 2. Opcional: Re-sembrar la base de datos si se incluye el argumento --seed
if [ "$1" == "--seed" ]; then
    echo -e "${BLUE}[2/4] Regenerando base de datos y sembrando registros...${NC}"
    python3 seed_users.py
    echo -e "${GREEN}✓ Base de datos reconstruida y seedeada con éxito.${NC}"
else
    echo -e "${BLUE}[2/4] Saltando sembrado de BD (usa './reset.sh --seed' si deseas resetear datos).${NC}"
fi

# 3. Mostrar resumen del sistema
echo -e "${BLUE}[3/4] Preparando entorno CRM Sumelga...${NC}"
echo -e "${YELLOW}- Dirección del servidor: http://127.0.0.1:8000${NC}"
echo -e "${YELLOW}- Contraseñas de comerciales para pruebas:${NC}"
echo -e "  • Agustín (Admin): admin123"
echo -e "  • Carlos (Comercial): carlos123"
echo -e "  • Sofía (Comercial): sofia123"

# 4. Arrancar servidor
echo -e "${BLUE}[4/4] Iniciando servidor FastAPI con Uvicorn (modo desarrollo)...${NC}"
echo -e "${GREEN}¡Servidor arrancando! Presiona CTRL+C para detenerlo.${NC}"
echo -e "${PURPLE}----------------------------------------------------${NC}"

python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
