# Guía de Scripts y Utilidades de CRM Sumelga

Este documento describe todos los scripts disponibles en el proyecto CRM Sumelga, su propósito y cómo ejecutarlos para la administración, desarrollo e inicialización de la aplicación.

---

## 🛠️ Scripts Principales

### 1. `run.py`
* **Utilidad**: Es el inicializador principal del servidor de desarrollo. Detecta y libera automáticamente el puerto activo en macOS/Linux si está ocupado por procesos residuales, y arranca el servidor web FastAPI con recarga en caliente (*hot reload*).
* **Parámetros**:
  * `--seed`: Borra la base de datos `crm.db` actual y la reconstruye ejecutando `seed_users.py` antes de iniciar el servidor.
  * `--external`: Vincula el servidor a todas las interfaces de red (`0.0.0.0`) y muestra dinámicamente la IP de la red local/VPN para permitir conexiones externas.
  * `--host=X.X.X.X` o `--host X.X.X.X`: Vincula el servidor a una dirección IP de host específica.
  * `--port=XXXX` o `--port XXXX`: Ejecuta el servidor en un puerto específico (por defecto el `8000`).
* **Cómo usarlo**:
  ```bash
  # Arrancar el servidor de desarrollo local
  python3 run.py

  # Permitir conexiones externas en el puerto 8000
  python3 run.py --external

  # Reconstruir base de datos y correr de forma externa en el puerto 8080
  python3 run.py --seed --external --port=8080
  ```

### 2. `update_db_schema.py`
* **Utilidad**: Script de migración y actualización en caliente de la base de datos. Añade las nuevas columnas estructuradas de dirección (`via`, `numero`, `poblacion`, `codigo_postal`) a la tabla de clientes en `crm.db` si no existen, y actualiza los CIF y las direcciones cruzando los códigos de cliente con las hojas de cálculo Excel (`Listado de clientes Meganor.xlsx` y `Listado de clientes Sumelga.xlsx`).
* **Cómo usarlo**:
  ```bash
  python3 update_db_schema.py
  ```

### 3. `seed_users.py` / `seed.py`
* **Utilidad**: Reconstruye la base de datos `crm.db` desde cero. Importa los comerciales y la cartera de clientes de `kpi_comercial.db`, cruza y enriquece la información con el CIF y las direcciones del Excel de Meganor y Sumelga, calcula el volumen de ventas e inyecta datos simulados interactivos de visitas, contactos y tareas. También importa las **7.310 ofertas** del fichero `Listado ofertas 2026 01_07_26.xlsx` asociándolas a los clientes de Sumelga.
* **Nota**: `seed.py` redirige directamente a `seed_users.py` para evitar duplicación.
* **Cómo usarlo**:
  ```bash
  python3 seed_users.py
  ```

### 4. `optimize_db_indexes.py`
* **Utilidad**: Aplica **35 índices optimizados** (simples y compuestos) sobre `crm.db` para mejorar el rendimiento de las consultas más frecuentes del sistema. Es completamente **seguro e idempotente**: usa `IF NOT EXISTS` en todos los índices y no modifica ni elimina datos. Al finalizar ejecuta `ANALYZE` (actualiza estadísticas del planificador de consultas) y `VACUUM` (compacta el fichero de base de datos).
* **Cuándo ejecutarlo**:
  * Tras un `seed_users.py` (reconstrucción completa de la BD).
  * Al desplegar en un nuevo entorno de producción.
  * Si se han añadido muchos registros y se nota lentitud.
* **Índices cubiertos**:

  | Tabla | Índices | Consultas beneficiadas |
  | :--- | :---: | :--- |
  | `clients` | 9 | Búsqueda por nombre, filtros sociedad/sector/tipo/ABC, cartera por comercial |
  | `visits` | 5 | Agenda semanal, historial por cliente, filtro por tipo de visita |
  | `tasks` | 7 | Kanban, alertas de vencimiento, tareas urgentes del Dashboard |
  | `contacts` | 2 | Ficha de cliente, filtro por nivel de decisión |
  | `offers` | 8 | Ofertas por cliente, cruce ERP, filtro abierto/cerrado |
  | `visit_attachments` | 1 | Adjuntos de una minuta |
  | `users` | 3 | Filtros por rol y estado activo |

* **Índices compuestos clave**:
  * `clients(sociedad, comercial_id)` → cartera por comercial en multi-sociedad
  * `tasks(estado, fecha_limite)` → tareas urgentes del Dashboard en una pasada
  * `tasks(client_id, estado)` → tareas activas en la ficha de cliente
  * `visits(client_id, fecha)` → historial de visitas ordenado sin sort extra
  * `offers(client_id, situacion)` → ofertas abiertas/cerradas de un cliente
  * `offers(sociedad, cliente_codigo)` → cruce con ERP durante importación
  * `users(role, is_active)` → lista de comerciales activos

* **Cómo usarlo**:
  ```bash
  python3 optimize_db_indexes.py
  ```

---

## ⚙️ Scripts de Automatización y Entorno

### 4. `reset.sh`
* **Utilidad**: Script en Bash para reiniciar el entorno de base de datos a un estado de demostración limpio. Borra la base de datos actual y ejecuta el script de sembrado (`seed_users.py`).
* **Cómo usarlo**:
  ```bash
  ./reset.sh
  ```

### 5. `install_mac.command`
* **Utilidad**: Script ejecutable de Finder para macOS. Automatiza la creación del entorno virtual Python (`venv`), la instalación de todas las dependencias listadas en `requirements.txt` y ejecuta el sembrado inicial de la base de datos.
* **Cómo usarlo**:
  * Haz doble clic sobre el archivo `install_mac.command` en Finder, o ejecútalo en la terminal:
    ```bash
    ./install_mac.command
    ```

### 6. `start_mac.command`
* **Utilidad**: Script ejecutable de Finder para macOS. Activa el entorno virtual de Python (`venv`), comprueba si deseas reconstruir la base de datos y si deseas permitir conexiones externas en tu red local de manera interactiva (mediante menús temporizados de 5 segundos) y arranca el servidor.
* **Cómo usarlo**:
  * Haz doble clic sobre el archivo `start_mac.command` en Finder, o ejecútalo en la terminal:
    ```bash
    ./start_mac.command
    ```
