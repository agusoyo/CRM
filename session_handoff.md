# Session Handoff: CRM Sumelga - Multi-Sociedad, Integración KPI_Comercial y Lanzadores Mac

Este documento detalla el estado actual de la aplicación CRM Sumelga tras completar la integración de datos multi-sociedad (Sumelga y Meganor) y la sincronización con la base de datos de KPI_Comercial.

---

## 🎯 Resumen de Hitos Alcanzados

Hemos completado con éxito la re-arquitectura de CRM Sumelga para soportar múltiples sociedades de forma independiente y coordinada:

1. **Base de Datos Multi-Sociedad (`crm.db`)**:
   - Rediseñamos el modelo `Client` en `app/models.py`. Eliminamos las restricciones `unique=True` individuales de `razon_social` y `codigo_sumelga` (código ERP del cliente).
   - Incorporamos una **restricción única compuesta**: `UniqueConstraint('sociedad', 'codigo_sumelga')`. De este modo, clientes de ambas sociedades pueden compartir el mismo código (ej. Código `00001` de Meganor y de Sumelga) sin conflicto.
   - Añadimos la columna `representante_codigo` en `User` para vincular de forma relacional a los comerciales con sus registros de ventas y clientes en el ERP.

2. **Ingesta y Sincronización Inteligente (`seed_users.py`)**:
   - El script de sembrado conecta directamente en modo lectura con la base de datos `/Users/agus/Developer/KPI_Comercial/backend/kpi_comercial.db`.
   - **Comerciales**: Mapea los códigos de representante `1`, `2` y `3` a los usuarios predefinidos (`admin`, `carlos`, `sofia`). Para los restantes (ej. `0004`, `M0001`), crea automáticamente usuarios comerciales con el formato de clave `comercial{codigo}123` e inicializa sus campos de ERP.
   - **Clientes**: Importa **2,366 clientes** en un solo lote rápido (*bulk insert*). Calcula el total de facturación acumulada de cada cliente de las tablas de ventas para poblar `volumen_ventas` y asignarles clasificaciones ABC realistas (`A` para > 50K€, `B` para > 10K€, `C` en otro caso).
   - **Mock Data**: Siembra de forma transparente contactos, visitas (minutas) y tareas en el Kanban de seguimiento para los primeros clientes reales asignados a Carlos y Sofía (ej. `IBERPOMPE,S.L.` y `GRANITOS CABALEIRO`) para que la aplicación muestre actividad interactiva de demostración al iniciar.

3. **Backend Adaptado (FastAPI)**:
   - Modificamos `crud.py` y `main.py` para añadir el filtro opcional de `sociedad` (`GET /api/clients?sociedad=...`).
   - Aumentamos el límite de registros por defecto a `10000` para permitir la correcta visualización de toda la cartera de clientes importada en el frontend.

4. **Interfaz Visual SPA Adaptada**:
   - **Filtro de Sociedad**: Añadido un selector dropdown en la barra superior (`Todas`, `Sumelga`, `Meganor`) que actualiza la lista en tiempo real.
   - **Badges de Sociedad**: La lista de clientes renderiza un badge Glassmorphic brillante al lado del nombre para diferenciar rápidamente su origen:
     - 🔵 `SUM` (Sumelga)
     - 🟣 `MEG` (Meganor)
   - **Detalles y Formularios**: Añadido el campo de sociedad en la pestaña de Información lateral y un desplegable de selección de sociedad en los modales de creación y edición de clientes.

5. **Entorno macOS y Permisos**:
   - Creamos `install_mac.command` que automatiza la creación de `venv`, la actualización de pip, la instalación de dependencias y el sembrado inicial.
   - Concedimos permisos de ejecución (`chmod +x`) a todos los ejecutables (`start_mac.command`, `install_mac.command`, `reset.sh`), listos para correr haciendo doble clic.

---

## 🚦 Estado de Procesos Activos

- **Servidor local de desarrollo**: Detenido actualmente.
- **Base de Datos**: `crm.db` (SQLite) lista y poblada con los comerciales y clientes importados de la base de datos analítica.
- **Comando de Arranque**:
  * `python3 run.py` (libera puertos colgados y arranca FastAPI con recarga en caliente).
  * O doble clic sobre `start_mac.command` en Finder.

---

## 🔍 Resultados de las Pruebas de Validación

Todas las comprobaciones arrojaron resultados perfectos en el entorno local:
1. **Sembrado**: `python3 seed_users.py` recrea la base de datos de manera limpia y sincroniza 26 comerciales adicionales y 2,366 clientes en **1.8 segundos**.
2. **Coexistencia de códigos**: Clientes con código duplicado (como `00001` de Meganor y `00001` de Sumelga) coexisten sin errores en la tabla `clients`.
3. **API y Rendimiento**:
   - `GET /api/clients?limit=2` -> Devuelve los clientes con su respectivo campo `sociedad` y datos del comercial.
   - `GET /api/clients?sociedad=Sumelga&limit=2` -> Filtra correctamente devolviendo solo registros de Sumelga.
   - **Rendimiento de Datos**: Optimizada la consulta de clientes a través de un esquema por lotes en `crud.py`, reduciendo el coste de carga de N+1 (más de 4,600 subconsultas SQLite individuales) a exactamente 3 consultas. La respuesta de la API bajó a **~0.1 segundos**.
   - **Fluidez Visual**: Refactorizados los bucles de renderizado (`innerHTML +=`) en `app.js` para realizar modificaciones en memoria antes del volcado final, eliminando por completo las congelaciones de pantalla y haciendo que el cambio de pestañas sea **instantáneo**.
   - **Indexación Completa**: Añadidos índices a la base de datos en las columnas de mayor uso analítico y de filtrado (`users.role`, `clients.tipo_cliente`, `clients.sector`, `clients.clasificacion_abc`, `visits.tipo_visita`, `tasks.visit_id`, `tasks.estado`, `tasks.prioridad`).

---

## 👥 Credenciales de Prueba seeded

Puedes simular la sesión de cualquier comercial utilizando la barra superior y verificando la contraseña:
- **Agustín (Admin)**: usuario `admin` / clave `admin123`
- **Carlos Sanz (Comercial)**: usuario `carlos` / clave `carlos123` (Representante `0002` - asignado a `IBERPOMPE,S.L.`)
- **Sofía Valiente (Comercial)**: usuario `sofia` / clave `sofia123` (Representante `0003` - asignada a `GRANITOS CABALEIRO`)
- **Ricardo**: usuario `ricardo` / clave `comercialm0003123` (Representante `M0003` - asignado a `RUSSULA`)
- **Martin**: usuario `martin` / clave `comercial0004123` (Representante `0004`)

---

## 📈 Próximos Pasos Recomendados

1. **Automatización de Sincronización**:
   Programar un cron job o tarea en segundo plano para que ejecute `seed_users.py` o un script de sincronización delta de forma periódica en producción, manteniendo CRM Sumelga coordinado con KPI_Comercial y las hojas de cálculo Excel de manera totalmente automática.
2. **HTTPS en Producción**:
   Asegurar el despliegue con SSL (como se detalla en `deploy_rhel.md` usando Certbot y Nginx) para habilitar el Dictado por Voz nativo en navegadores externos y smartphones, ya que Web Speech API exige un origen seguro.

---

## 🔒 Nuevos Hitos Relevantes (Añadido en esta sesión)

1. **Campos de Dirección Estructurados e Integración con Excel**:
   - Rediseñamos el modelo `Client` en [models.py](file:///Users/agus/Developer/CRM/app/models.py) y schemas en [schemas.py](file:///Users/agus/Developer/CRM/app/schemas.py) para soportar dirección física detallada dividida en campos individuales: `via`, `direccion` (calle), `numero`, `poblacion` y `codigo_postal`.
   - Modificamos [seed_users.py](file:///Users/agus/Developer/CRM/seed_users.py) para cruzar los clientes importados con los archivos Excel (`Listado de clientes Meganor.xlsx` y `Listado de clientes Sumelga.xlsx`) poblando automáticamente sus CIFs y direcciones desglosadas al sembrar.
   - Creamos el script de migración en caliente [update_db_schema.py](file:///Users/agus/Developer/CRM/update_db_schema.py) para actualizar bases de datos `crm.db` existentes sin pérdida de información histórica.
   - Renovamos los modales y vistas en [index.html](file:///Users/agus/Developer/CRM/static/index.html) y [app.js](file:///Users/agus/Developer/CRM/static/js/app.js) para desglosar la dirección en el formulario y formatear la visualización con enlace directo a Google Maps.

2. **Cuentas Asignadas en Equipo de Comerciales**:
   - Añadimos la columna **Cuentas Asignadas** en la tabla de Comerciales para administradores, que calcula y muestra en tiempo real la cantidad de clientes asociados a cada comercial en el backend.

3. **Soporte Móvil (PWA y Optimizaciones UX)**:
   - Convertimos la aplicación en una **PWA (Progressive Web App)** agregando un `manifest.json` y un `sw.js` (Service Worker) para permitir la instalación nativa de la app en iOS y Android.
   - Refactorizamos las consultas `@media` de CSS y añadimos comportamientos adaptativos táctiles (`-webkit-overflow-scrolling`) y *safe areas* para notch de iPhone.
   - Rediseñamos la tabla de clientes en móviles, ocultando columnas secundarias y reorganizando los botones de acción rápida para una mejor experiencia *mobile-first*.
   - Integración nativa del **Share Sheet (Web Share API)** para exportación de PDF, sustituyendo el flujo de impresión clásico por la generación interna de Blobs PDF con `html2pdf.js`, lo que permite compartir ofertas directamente por WhatsApp o Correo en teléfonos.
