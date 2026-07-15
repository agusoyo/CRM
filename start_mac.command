#!/bin/bash
# start_mac.command
# Script de arranque rápido de CRM Sumelga para macOS

# Cambiar al directorio donde se encuentra este script
cd "$(dirname "$0")"

# Definir colores para una salida de terminal premium
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;37m' # No Color

clear
echo -e "${PURPLE}====================================================${NC}"
echo -e "${PURPLE}        CRM Sumelga - Lanzador para macOS           ${NC}"
echo -e "${PURPLE}====================================================${NC}"

# 1. Comprobar y activar el entorno virtual (si existe)
if [ -d "venv" ]; then
    echo -e "${BLUE}[1/3] Activando entorno virtual 'venv'...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}[1/3] No se encontró la carpeta 'venv'. Usando Python global.${NC}"
fi

# 2. Ofrecer reconstrucción de la base de datos (con timeout de 5 segundos)
echo -e "${BLUE}[2/4] Opciones de base de datos...${NC}"
echo -ne "${YELLOW}¿Deseas reconstruir y sembrar la base de datos (--seed)? (s/N) [No por defecto en 5s]: ${NC}"
read -t 5 -n 1 respuesta_seed
echo ""

# 3. Ofrecer permitir conexiones externas (con timeout de 5 segundos)
echo -e "${BLUE}[3/4] Opciones de red...${NC}"
echo -ne "${YELLOW}¿Deseas permitir conexiones externas (desde otros dispositivos en tu red)? (s/N) [No por defecto en 5s]: ${NC}"
read -t 5 -n 1 respuesta_network
echo ""

# 4. Lanzar la aplicación
echo -e "${BLUE}[4/4] Iniciando CRM Sumelga...${NC}"
ARGS=""
if [[ "$respuesta_seed" =~ ^[Ss]$ ]]; then
    ARGS="$ARGS --seed"
fi
if [[ "$respuesta_network" =~ ^[Ss]$ ]]; then
    ARGS="$ARGS --external"
fi

python3 run.py $ARGS
