# Guía de Despliegue en Servidor Virtual Windows (Remote Access)

Esta guía detalla el procedimiento paso a paso para instalar y configurar **CRM Sumelga** en un Servidor Virtual (VPS o Máquina Virtual) con sistema operativo **Windows Server (2019, 2022 o Windows 10/11 Pro)**, permitiendo que comerciales y clientes remotos se conecten de manera segura a través de internet o de la red local.

---

## 📋 Arquitectura del Entorno

Para un despliegue óptimo y permanente en Windows Server, utilizaremos la siguiente pila:
* **Python 3.10+**: Intérprete para ejecutar el backend.
* **FastAPI + Uvicorn**: Servidor asíncrono configurado para escuchar en la interfaz pública (`0.0.0.0`).
* **SQLite (`crm.db`)**: Base de datos ligera e integrada (no requiere configuración de servidores de BD pesados).
* **NSSM (Non-Sucking Service Manager)**: Herramienta estándar de Windows para convertir el servidor en un **Servicio del Sistema Windows** que se ejecute en segundo plano y se reinicie automáticamente si el servidor se apaga.
* **Cortafuegos de Windows (Firewall)**: Configurado con una regla de entrada para permitir conexiones remotas.

---

## 🛠️ Paso 1: Preparación del Servidor Windows

1. **Instalar Python**:
   * Descarga la última versión de Python 3 (ej. Python 3.11 o 3.12) para Windows desde la web oficial.
   * **IMPORTANTE**: Durante la instalación, marca la casilla **"Add python.exe to PATH"**.
   * Elige la instalación estándar y finalízala.

2. **Copiar el Proyecto**:
   * Copia la carpeta completa de tu proyecto `CRM` al servidor virtual (por ejemplo, en la ruta raíz `C:\CRM Sumelga`).

---

## 📦 Paso 2: Configuración del Entorno de Python

Abre la terminal de Windows (**PowerShell** o **Símbolo del Sistema** como Administrador) y ejecuta:

```powershell
# 1. Navegar a la carpeta de la aplicación
cd C:\CRM Sumelga

# 2. Crear un entorno virtual aislado
python -m venv venv

# 3. Activar el entorno virtual
# En PowerShell:
.\venv\Scripts\Activate.ps1
# En CMD estándar:
.\venv\Scripts\activate.bat

# 4. Actualizar pip e instalar dependencias del sistema
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🗄️ Paso 3: Inicializar o Actualizar la Base de Datos

### Para una instalación nueva:
En la misma terminal con el entorno virtual activo, ejecuta el sembrador de usuarios para crear el archivo `crm.db` inicial (que enriquece las cuentas con los Excel de Meganor y Sumelga):
```powershell
python seed_users.py
```

### Para actualizar una instalación existente con Excel:
Si ya tienes una base de datos en producción y deseas actualizar el esquema de base de datos e importar la información de los Excel de clientes sin perder los registros existentes (reuniones, tareas, etc.):
```powershell
python update_db_schema.py
```

*Esto creará la estructura de SQLite o actualizará el esquema de base de datos en `crm.db`.*

---

## 🛡️ Paso 4: Abrir el Puerto en el Firewall de Windows

Por defecto, Windows bloquea todas las conexiones entrantes. Debemos crear una regla para permitir que los clientes remotos accedan al puerto del CRM (usaremos el puerto estándar HTTP `80` o en su defecto el `8000`).

### Opción Rápida (Recomendada - PowerShell):
Abre una consola de **PowerShell como Administrador** y ejecuta esta línea de comando:

```powershell
New-NetFirewallRule -Name "CRM Sumelga" -DisplayName "CRM Sumelga - Servidor Web" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80
```

### Opción Manual (Interfaz Gráfica):
1. Abre el menú Inicio, busca **Windows Defender Firewall con seguridad avanzada**.
2. Haz clic en **Reglas de entrada** (Inbound Rules) en la barra lateral izquierda.
3. En la barra derecha, haz clic en **Nueva regla...** (New Rule).
4. Elige Tipo de regla: **Puerto** -> Siguiente.
5. Selecciona **TCP** y en Puertos locales específicos introduce: `80` (o `8000`).
6. Selecciona **Permitir la conexión** -> Siguiente.
7. Deja marcadas las opciones de Dominio, Privado y Público -> Siguiente.
8. Nómbrala `CRM Sumelga` y haz clic en **Finalizar**.

---

## 🔄 Paso 5: Configurar CRM Sumelga como Servicio de Windows (Siempre Activo)

Para evitar tener una ventana de consola abierta que se cierre si cierras tu sesión de Escritorio Remoto (RDP), instalaremos la aplicación como un **Servicio del Sistema**.

1. Descarga **NSSM** (versión estable) desde [nssm.cc](https://nssm.cc/download).
2. Extrae el archivo `.zip` y copia el ejecutable `nssm.exe` de la carpeta `win64` dentro de la raíz de tu proyecto en `C:\CRM Sumelga`.
3. Abre la consola de **PowerShell como Administrador** y ejecuta:

```powershell
cd C:\CRM Sumelga
.\nssm.exe install CRM Sumelga
```

4. Se abrirá una interfaz gráfica de configuración de NSSM. Completa los campos exactamente así:

   * **Path**: `C:\CRM Sumelga\venv\Scripts\python.exe`
   * **Startup directory**: `C:\CRM Sumelga`
   * **Arguments**: `-m uvicorn app.main:app --host 0.0.0.0 --port 80`
     *(Nota: Usar `--host 0.0.0.0` es crítico para que escuche conexiones de internet y no sólo locales).*

5. Haz clic en el botón **Install service**.
6. Para iniciar el servicio de inmediato y dejarlo configurado para que arranque solo al encender el servidor virtual, ejecuta:

```powershell
Start-Service CRM Sumelga
```

*¡Listo! CRM Sumelga ya se está ejecutando silenciosamente en segundo plano.*

---

## 📱 Paso 6: Conexión desde Clientes Remotos

A partir de este momento, cualquier miembro del equipo puede conectarse desde su ordenador, tablet o móvil:

1. **Obtén la IP Pública** de tu servidor virtual Windows (ej. `185.120.45.89`).
2. Abre el navegador web en cualquier dispositivo remoto y escribe la IP en la barra de direcciones:
   ```
   http://185.120.45.89
   ```
3. Si utilizaste un puerto diferente al 80 (como el 8000), escribe:
   ```
   http://185.120.45.89:8000
   ```

---

## 🔒 Despliegue Seguro mediante VPN Corporativa (Acceso Local / Remoto)

El uso de tu **VPN (Virtual Private Network) corporativa existente** es la **regla de oro en seguridad empresarial**. Te permite dar acceso completo y remoto a tus comerciales desde cualquier lugar del mundo **sin abrir ningún puerto al internet público**, previniendo de raíz ataques de hackers, escaneos de puertos y accesos no autorizados.

### 🧠 ¿Cómo funciona la arquitectura con tu VPN?
Cuando tus comerciales están fuera de la oficina, conectan sus dispositivos (portátiles, móviles) a la VPN corporativa. Al establecer la conexión, el túnel cifrado de la VPN les asigna una dirección IP interna y su dispositivo actúa **exactamente como si estuvieran físicamente conectados al switch de la oficina**. Por tanto, pueden acceder a CRM Sumelga usando la **IP privada local** del Servidor Windows.

A continuación, los pasos exactos para configurarlo:

---

### Paso A: Obtener la IP Privada del Servidor Windows
Debes averiguar qué IP local tiene asignada el servidor virtual dentro de tu red local/VPN:
1. Abre **PowerShell** en tu servidor Windows.
2. Escribe el comando:
   ```powershell
   ipconfig
   ```
3. Busca el adaptador de red activo (normalmente llamado *Adaptador de Ethernet Ethernet* o *Ethernet adapter*).
4. Anota el valor del campo **Dirección IPv4** (IPv4 Address).
   * *Ejemplo típico*: `192.168.1.150` o `10.0.0.50`.
   * *Esta será la dirección que usarán tus comerciales en sus navegadores.*

---

### Paso B: Configurar la escucha en Uvicorn (`0.0.0.0`)
Para que el servidor web responda a las peticiones que llegan desde el túnel de la VPN, Uvicorn debe escuchar en todas las interfaces de red del servidor (no solo en localhost `127.0.0.1`):
* En tu configuración de **NSSM** (o al lanzar el comando manualmente), asegúrate de que los argumentos incluyan:
  ```powershell
  --host 0.0.0.0 --port 80
  ```
  *Al usar `--host 0.0.0.0`, el servidor se vincula tanto a la interfaz física local como a la interfaz virtual de la VPN.*

---

### Paso C: Blindar el Firewall de Windows para redes Privadas/Dominio
Para maximizar la seguridad, configuraremos el Cortafuegos de Windows para que **solo permita tráfico web en redes de confianza** (redes de Dominio Corporativo o Privadas), bloqueando de inmediato cualquier petición que provenga del perfil público de internet:

1. Ejecuta este comando en **PowerShell como Administrador** para restringir la regla del CRM a los perfiles seguros:
   ```powershell
   Set-NetFirewallRule -Name "CRM Sumelga" -Profile Domain,Private
   ```
   *De esta forma, si el servidor virtual Windows alguna vez se conecta directamente a una red pública (internet sin filtrar), el firewall bloqueará en seco cualquier intento de conexión externa.*

---

### Paso D: Flujo de Conexión para los Comerciales Remotos

Para que tus comerciales accedan al CRM desde fuera de la oficina, indícales que sigan estos 3 sencillos pasos:

1. **Conectarse a la VPN**:
   En su dispositivo (ordenador o móvil), deben activar y conectar su cliente de VPN corporativa (ej. FortiClient, OpenVPN, Cisco AnyConnect, WireGuard, L2TP, etc.).
2. **Acceder a la URL local**:
   Una vez que la VPN muestre el estado "Conectado", deben abrir su navegador habitual (Chrome, Safari, Firefox, etc.) y escribir la **IP privada del Servidor Windows** que obtuviste en el Paso A:
   ```
   http://192.168.1.150
   ```
   *(Si configuraste un puerto diferente al 80, ej. 8000, deberán escribir: `http://192.168.1.150:8000`).*
3. **¡Listo!**:
   El CRM cargará de forma rápida y ultra-segura a través del túnel encriptado de tu VPN corporativa, permitiéndoles loguearse con sus contraseñas asignadas.

---

## 🎙️ Paso Especial: Activar el Dictado por Voz (Web Speech API) en Remoto

CRM Sumelga incluye una función premium de **Dictado por Voz** para rellenar de forma ultra-rápida y hablada las minutas de las visitas (Objetivos, Puntos Tratados y Conclusiones).

Esta función utiliza la **Web Speech API** del navegador de forma nativa (sin consumir APIs de pago externas). Para garantizar su funcionamiento correcto en remoto, debes tener en cuenta lo siguiente:

### 1. Requisitos de Navegadores Compatibles
* **Altamente Soportado**: Google Chrome y Safari (tanto en ordenadores de escritorio como en smartphones iPhone y Android).
* **No Soportado de fábrica**: Firefox (por políticas internas de Mozilla, tiene el dictado por voz desactivado por defecto). Indicar a los comerciales que usen **Chrome** o **Safari** si van a dictar visitas.

### 2. Activación del Permiso de Micrófono
Al hacer clic por primera vez en cualquier botón de **"🎙️ Dictar"** en el formulario de registrar visita, el navegador solicitará permiso explícito para acceder al micrófono. Los comerciales deben pulsar en **"Permitir"** (Allow).

### 3. Requisito de Seguridad Obligatorio: "Contexto Seguro" (Microphone Over VPN)
Por estricta privacidad, los navegadores modernos **bloquean el uso de micrófonos y cámaras en páginas que no utilicen HTTPS** (salvo en localhost/127.0.0.1). 
Si tus comerciales se conectan remotamente por la IP de la VPN (ej. `http://192.168.1.150`), el navegador detectará que no es una conexión cifrada (`HTTP`) y **ocultará o desactivará el botón de dictado** por seguridad.

#### 🛠️ Cómo solucionarlo (2 alternativas):

* **Alternativa A (Recomendada y Profesional)**:
  Configura un subdominio y un proxy inverso ligero (como **Caddy Server** o **IIS** con Let's Encrypt gratuito) en tu máquina Windows para servir la aplicación bajo un dominio seguro: `https://crm.sumelga.es`.
  Al entrar por `https://`, los navegadores habilitarán el micrófono de forma nativa e inmediata en todos los móviles y portátiles de tu equipo, sin requerir ninguna acción adicional.

* **Alternativa B (Solución Rápida en Chrome de escritorio)**:
  Si no deseas configurar certificados HTTPS y tus comerciales usan **Google Chrome** en el ordenador, pueden forzar a Chrome a considerar segura la dirección de la VPN siguiendo estos pasos:
  1. En su ordenador, abren Google Chrome y navegan a la siguiente URL interna:
     ```
     chrome://flags/#unsafely-treat-insecure-origin-as-secure
     ```
  2. En el cuadro de texto que aparece, pegan la dirección IP interna del servidor (incluyendo el puerto si no es el 80), por ejemplo:
     `http://192.168.1.150` o `http://192.168.1.150:8000`.
  3. Cambian el selector de la derecha de *Disabled* a **Enabled**.
  4. Hacen clic en el botón **Relaunch** abajo a la derecha para reiniciar Chrome.
  5. ¡Listo! A partir de ese momento, Chrome les permitirá usar el micrófono de forma normal y transparente a través de la IP de la VPN.

---

## ⚡ Arranque Directo sin NSSM (Pruebas y Desarrollo en Windows)

Si prefieres lanzar la aplicación de manera interactiva en tu terminal de Windows para realizar pruebas rápidas de conexión externa sin configurar NSSM como servicio:

1. Abre **PowerShell** o **CMD** en la carpeta del proyecto (`C:\CRM Sumelga`).
2. Activa tu entorno virtual.
3. Ejecuta el script de inicio indicando el flag de conexiones externas y un puerto de tu elección (por defecto el `8000` si omites `--port`):
   ```powershell
   python run.py --external --port 8000
   ```
4. El script comprobará si el puerto está libre (mostrando un aviso en Windows ya que la liberación automática de puertos se omite en esta plataforma) y mostrará en consola tanto la dirección local (`http://127.0.0.1:8000`) como la **dirección IP de tu red local/VPN** (ej. `http://192.168.1.150:8000`) para que puedas escribirla directamente en el navegador del portátil cliente.
