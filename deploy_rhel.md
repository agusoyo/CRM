# Guía de Despliegue en Red Hat Enterprise Linux (RHEL 8 / 9)

Esta guía detalla el procedimiento paso a paso para instalar, configurar y desplegar **CRM Sumelga** de forma profesional en un entorno de producción utilizando **Red Hat Enterprise Linux (RHEL 8 o 9)**.

---

## 📋 Arquitectura de Producción

En un entorno Linux empresarial como RHEL, el estándar absoluto de estabilidad y rendimiento consiste en separar el servidor de aplicaciones del servidor web expuesto al público. Utilizaremos la siguiente pila de producción:

* **Python 3.9+**: Intérprete nativo de RHEL para ejecutar el backend.
* **Gunicorn (Green Unicorn)**: Gestor de procesos WSGI/ASGI para Linux. Administra múltiples procesos de la aplicación para soportar alta concurrencia.
* **Uvicorn (Workers)**: Los trabajadores asíncronos ultrarrápidos que Gunicorn usará para procesar FastAPI.
* **Nginx**: Servidor web de alto rendimiento que actuará como **Proxy Inverso** (Reverse Proxy). Nginx recibirá las peticiones web en el puerto 80/443, servirá los archivos estáticos a velocidad nativa y derivará las consultas de API al backend.
* **Systemd**: El gestor de servicios del sistema RHEL para mantener CRM Sumelga corriendo en segundo plano y levantarlo automáticamente en caso de reinicio de la máquina.
* **Firewalld**: El cortafuegos por defecto de RHEL.
* **SELinux (Security-Enhanced Linux)**: El sistema de seguridad restrictivo de Red Hat (se configurará correctamente para evitar el temido bloqueo de red local *502 Bad Gateway*).

---

## 🛠️ Paso 1: Instalación de Dependencias del Sistema

Conéctate por SSH a tu servidor RHEL y ejecuta los siguientes comandos para actualizar el sistema e instalar las herramientas necesarias:

```bash
# 1. Actualizar el gestor de paquetes dnf
sudo dnf update -y

# 2. Instalar Python 3, Pip, Nginx y utilidades de compilación
sudo dnf install -y python3 python3-pip python3-devel nginx git gcc

# 3. Habilitar e iniciar el servicio de Nginx
sudo systemctl enable --now nginx
```

---

## 📦 Paso 2: Copiar el Proyecto y Configurar el Entorno Virtual

1. **Ubicación recomendada**: Colocaremos la aplicación en la ruta `/var/www/crmsumelga`.
2. **Copiar archivos**: Sube el proyecto a esa ruta (mediante SFTP, Git, o SCP).
3. **Configurar permisos**: Ajusta el propietario del directorio al usuario que ejecutará la app (por ejemplo, tu usuario de sistema `agus` o un usuario dedicado `deploy`):

```bash
# Crear directorio y asignar permisos (reemplaza 'agus' por tu usuario RHEL)
sudo mkdir -p /var/www/crmsumelga
sudo chown -R agus:nginx /var/www/crmsumelga
sudo chmod -R 775 /var/www/crmsumelga

# Navegar a la carpeta
cd /var/www/crmsumelga

# Crear el entorno virtual aislado de Python
python3 -m venv venv

# Activar el entorno virtual
source venv/bin/activate

# Actualizar pip e instalar dependencias del proyecto
pip install --upgrade pip
pip install -r requirements.txt

# INSTALACIÓN CRÍTICA EN LINUX: Instalar Gunicorn y el worker de Uvicorn
pip install gunicorn uvicorn
```

---

## 🗄️ Paso 3: Inicializar o Actualizar la Base de Datos

### Para una instalación nueva:
Con el entorno virtual activo, ejecuta el script para sembrar los comerciales y administradores por defecto (que enriquece las cuentas con los Excel de Meganor y Sumelga):
```bash
python seed_users.py
```

### Para actualizar una instalación existente con Excel:
Si ya tienes una base de datos en producción y deseas actualizar el esquema de base de datos e importar la información de los Excel de clientes sin perder los registros existentes (reuniones, tareas, etc.):
```bash
python update_db_schema.py
```

Esto generará o actualizará el archivo SQLite `crm.db` en la raíz del proyecto. Asegúrate de que el grupo `nginx` tenga permisos de lectura y escritura en la base de datos y en la carpeta del proyecto para que la API funcione correctamente:
```bash
sudo chown -R agus:nginx /var/www/crmsumelga
sudo chmod 664 crm.db
```

---

## 🔄 Paso 4: Crear el Servicio Systemd (Segundo Plano Permanente)

Para asegurar que CRM Sumelga se ejecute como un demonio del sistema que arranca con la máquina y se reinicia si falla, crearemos una unidad de servicio de **Systemd**.

1. Crea el archivo de servicio con privilegios de administrador:
   ```bash
   sudo nano /etc/systemd/system/crmsumelga.service
   ```

2. Pega el siguiente contenido (asegúrate de que las rutas coincidan con tu usuario, en este ejemplo `agus`):

   ```ini
   [Unit]
   Description=Gunicorn daemon para CRM Sumelga FastAPI
   After=network.target

   [Service]
   User=agus
   Group=nginx
   WorkingDirectory=/var/www/crmsumelga
   Environment="PATH=/var/www/crmsumelga/venv/bin"
   ExecStart=/var/www/crmsumelga/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000 --access-logfile /var/log/nginx/crmsumelga.gunicorn.access.log --error-logfile /var/log/nginx/crmsumelga.gunicorn.error.log

   [Install]
   WantedBy=multi-user.target
   ```
   *(Nota: `-w 4` levanta 4 trabajadores asíncronos independientes para maximizar el uso de los núcleos de CPU del servidor).*

3. Guarda y cierra el archivo (`Ctrl+O`, `Enter`, `Ctrl+X`).
4. Recarga systemd, habilita el servicio y arráncalo:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now crmsumelga
   ```

5. Verifica que esté funcionando perfectamente:
   ```bash
   sudo systemctl status crmsumelga
   ```

---

## 🛡️ Paso 5: Configurar Firewalld y SELinux (¡CRÍTICO EN RED HAT!)

RHEL es extremadamente seguro por defecto. Si no realizas estos pasos, el cortafuegos bloqueará las conexiones web externas, y SELinux bloqueará la comunicación interna entre Nginx y Gunicorn, resultando en un error **502 Bad Gateway**.

### 1. Permitir puertos HTTP y HTTPS en Firewalld:
```bash
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload
```

### 2. Configurar directivas de SELinux:
Debemos autorizar explícitamente a Nginx para que pueda actuar como proxy de red y conectarse al puerto local `8000` gestionado por Gunicorn:

```bash
# Permitir a Nginx conectarse a sockets de red locales
sudo setsebool -P httpd_can_network_connect 1

# Dar permisos a SELinux para leer y servir los archivos estáticos del CRM
sudo chcon -Rt httpd_sys_content_t /var/www/crmsumelga/static
```

---

## 🔌 Paso 6: Configurar Nginx como Proxy Inverso

Configuraremos Nginx para interceptar peticiones en el puerto 80, servir la carpeta `static/` directamente (lo que alivia de carga a Python) y redirigir el resto de peticiones de la API a Gunicorn en el puerto 8000.

1. Crea un archivo de configuración para el CRM:
   ```bash
   sudo nano /etc/nginx/conf.d/crmsumelga.conf
   ```

2. Pega la configuración estándar de alto rendimiento:

   ```nginx
   server {
       listen 80;
       server_name _; # Cambia esto por tu dominio (ej. crm.sumelga.es) o la IP del servidor

       # Configuración de logs
       access_log /var/log/nginx/crmsumelga.access.log;
       error_log /var/log/nginx/crmsumelga.error.log;

       # Optimización de carga: Servir los archivos estáticos directamente desde Nginx
       location /static/ {
           alias /var/www/crmsumelga/static/;
           expires 7d;
           add_header Cache-Control "public, no-transform";
       }

       # Redirigir el resto del tráfico a Gunicorn + FastAPI
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Soporte para WebSockets (si fuera necesario en el futuro)
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           
           proxy_redirect off;
       }
   }
   ```

3. Verifica que la sintaxis de Nginx sea correcta:
   ```bash
   sudo nginx -t
   ```
4. Reinicia Nginx para aplicar los cambios:
   ```bash
   sudo systemctl restart nginx
   ```

---

## 🔒 Paso 7: Configuración de Certificado SSL (HTTPS Obligatorio)

Para que el dictado por voz mediante la **Web Speech API** funcione en los smartphones y portátiles de los comerciales sin necesidad de hackear las directivas de seguridad locales del navegador, es **estrictamente obligatorio** servir el sitio web bajo **HTTPS** (contexto seguro).

En RHEL, la forma oficial y más rápida de obtener certificados SSL gratuitos firmados por **Let's Encrypt** es mediante Certbot.

1. Instalar Certbot y el plugin de Nginx (requiere el repositorio EPEL activo):
   ```bash
   sudo dnf install -y epel-release
   sudo dnf install -y certbot python3-certbot-nginx
   ```

2. Ejecutar Certbot para generar los certificados y auto-configurar Nginx automáticamente:
   ```bash
   # Reemplaza 'crm.sumelga.es' por el dominio real apuntado a la IP de tu RHEL
   sudo certbot --nginx -d crm.sumelga.es
   ```
   *Certbot te pedirá un email de contacto, que aceptes los términos de servicio, y te ofrecerá redirigir automáticamente todo el tráfico HTTP a HTTPS. Selecciona la opción de **redirección automática**.*

3. El cortafuegos de renovación automática se instala solo. Puedes probarlo con:
   ```bash
   sudo certbot renew --dry-run
   ```

---

## 📱 Paso 8: Conexión Remota y VPN

Si el servidor está alojado dentro de una **VPN Corporativa**, la IP pública se sustituye por la IP privada interna de la interfaz de la VPN (ej. `10.8.0.x` o `192.168.x.x`). 
Nginx escuchará en esa IP privada de forma transparente debido a que en su configuración tiene `listen 80;` (o `listen 443;`), lo que lo vincula a todas las interfaces disponibles de la máquina.

Tus comerciales tan solo tendrán que:
1. Encender el cliente VPN en su smartphone o portátil.
2. Abrir el navegador e ingresar a la dirección segura configurada en Nginx (ej. `https://crm.sumelga.es` o `http://IP_INTERNA_RHEL` si aplican las directivas seguras de Chrome).

---

## ⚡ Opciones de Arranque Directo sin Nginx (Desarrollo y Pruebas en RHEL)

Si necesitas arrancar el servidor directamente en RHEL para realizar pruebas rápidas en la red local **sin configurar Nginx**:

### Opción A: Usando el script de inicio con bandera de red externa
Puedes lanzar la aplicación indicándole que escuche en todas las interfaces (`0.0.0.0`) y especificar un puerto alternativo:
```bash
python3 run.py --external --port 8000
```
Esto mostrará en pantalla la dirección IP externa/local a la cual puedes conectarte directamente desde cualquier portátil de la misma red (ej. `http://IP_DEL_SERVIDOR:8000`).

### Opción B: Cambiar la vinculación del Servicio Systemd
Si deseas omitir Nginx en el servicio permanente, puedes configurar Gunicorn para que escuche en todas las interfaces de red (`0.0.0.0`) modificando la directiva `--bind` en el archivo `/etc/systemd/system/crmsumelga.service`:
```ini
ExecStart=/var/www/crmsumelga/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 ...
```
Una vez editado el servicio, recuerda recargar y reiniciar:
```bash
sudo systemctl daemon-reload
sudo systemctl restart crmsumelga
```
*(Nota: Asegúrate de que el firewall de RHEL permita conexiones entrantes en el puerto 8000 ejecutando: `sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent && sudo firewall-cmd --reload`).*
