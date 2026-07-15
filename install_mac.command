#!/bin/bash
# install_mac.command
# Script de instalación automatizada y configuración de entorno para macOS

# Cambiar al directorio donde se encuentra este script para evitar problemas de rutas relativas
cd "$(dirname "$0")"

# Definir colores para salida de terminal premium
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;37m' # No Color

clear
echo -e "${PURPLE}====================================================${NC}"
echo -e "${PURPLE}        CRM Sumelga - Instalador para macOS         ${NC}"
echo -e "${PURPLE}====================================================${NC}"
echo -e "${BLUE}Este script configurará el entorno de ejecución de CRM Sumelga.${NC}\n"

# 1. Verificar si Python 3 está instalado
echo -e "${BLUE}[1/5] Verificando requisitos del sistema...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 no está instalado en este sistema.${NC}"
    echo -e "${YELLOW}Por favor, descarga e instala Python 3 desde: https://www.python.org/downloads/${NC}"
    exit 1
else
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python 3 detectado: ${PYTHON_VERSION}${NC}"
fi

# 2. Crear entorno virtual 'venv'
echo -e "${BLUE}[2/5] Creando entorno virtual de Python ('venv')...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}El directorio 'venv' ya existe. Reinstalando sobre el entorno actual...${NC}"
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al crear el entorno virtual con 'python3 -m venv venv'.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Entorno virtual creado exitosamente.${NC}"
fi

# 3. Activar el entorno e instalar dependencias
echo -e "${BLUE}[3/5] Activando venv e instalando dependencias (requirements.txt)...${NC}"
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al activar el entorno virtual.${NC}"
    exit 1
fi

echo -e "${BLUE}Actualizando gestor de paquetes pip...${NC}"
pip install --upgrade pip

echo -e "${BLUE}Instalando paquetes (FastAPI, Uvicorn, SQLAlchemy, Pydantic)...${NC}"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias de requirements.txt.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencias instaladas con éxito.${NC}"

# 4. Inicializar y sembrar la base de datos
echo -e "${BLUE}[4/5] Inicializando base de datos y cargando datos demo...${NC}"
python3 seed_users.py
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al sembrar la base de datos.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Base de datos crm.db creada y poblada correctamente.${NC}"

# 5. Otorgar permisos de ejecución a los comandos
echo -e "${BLUE}[5/5] Configurando permisos de ejecutables locales...${NC}"
chmod +x start_mac.command
chmod +x reset.sh
echo -e "${GREEN}✓ Permisos de ejecución configurados.${NC}"

# Resumen final de instalación exitosa
echo -e "\n${PURPLE}====================================================${NC}"
echo -e "${GREEN}      🎉 ¡Instalación completada con éxito! 🎉      ${NC}"
echo -e "${PURPLE}====================================================${NC}"
echo -e "${BLUE}Para iniciar la aplicación en el futuro, puedes:${NC}"
echo -e "  1. Hacer doble clic sobre el archivo ${YELLOW}start_mac.command${NC} en Finder."
echo -e "  2. O ejecutar ${YELLOW}./start_mac.command${NC} desde tu terminal."
echo -e "  3. O ejecutar el comando Python directo: ${YELLOW}python3 run.py${NC}"
echo -e "\n${BLUE}El servidor se iniciará en: ${YELLOW}http://localhost:8000${NC}"
echo -e "\n${BLUE}Credenciales de prueba seeded:${NC}"
echo -e "  • ${YELLOW}Agustín (Admin)${NC}: usuario ${GREEN}admin${NC} / clave ${GREEN}admin123${NC}"
echo -e "  • ${YELLOW}Carlos (Comercial)${NC}: usuario ${GREEN}carlos${NC} / clave ${GREEN}carlos123${NC}"
echo -e "  • ${YELLOW}Sofía (Comercial)${NC}: usuario ${GREEN}sofia${NC} / clave ${GREEN}sofia123${NC}"
echo -e "${PURPLE}====================================================${NC}"

# Pausa final por si se ejecuta haciendo doble clic para evitar que la ventana se cierre inmediatamente
echo -e "\nPresiona cualquier tecla para finalizar..."
read -n 1
