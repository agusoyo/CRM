# CRM Sumelga - Manual de Usuario

Bienvenido a **CRM Sumelga** (Gestión Comercial Sumelga), una aplicación web de Single Page Application (SPA) ultra-moderna de alta gama diseñada bajo principios *mobile-first* y estética premium oscura con efectos de Glassmorphism (cristal translúcido). 

Este manual proporciona una guía detallada para comprender el funcionamiento de la aplicación, sus flujos de trabajo e interactuar con el sistema según tu rol asignado.

> [!TIP]
> **Compatibilidad Móvil y PWA:** CRM Sumelga está preparado como una Aplicación Web Progresiva (PWA). Si abres la dirección web desde tu teléfono móvil (Safari en iOS o Chrome en Android), podrás utilizar la función **"Añadir a la pantalla de inicio"**. Esto instalará el CRM como una aplicación nativa en tu teléfono, eliminando las barras del navegador y habilitando una interfaz simplificada para uso comercial en la calle.

---

## 📌 Índice de Contenidos

1. [Acceso al Sistema y Gestión de Sesiones](#1-acceso-al-sistema-y-gestión-de-sesiones)
2. [Barra de Navegación y Cabecera Global](#2-barra-de-navegación-y-cabecera-global)
3. [Cuadro de Mando (Dashboard)](#3-cuadro-de-mando-dashboard)
4. [Directorio de Clientes (Cuentas)](#4-directorio-de-clientes-cuentas)
5. [Ficha General del Cliente (Hub)](#5-ficha-general-del-cliente-hub)
6. [Personas de Contacto](#6-personas-de-contacto)
7. [Ofertas Comerciales](#7-ofertas-comerciales)
8. [Registro de Visitas y Minutas con Dictado por Voz](#8-registro-de-visitas-y-minutas-con-dictado-por-voz)
9. [Calendario de Planificación Mensual](#9-calendario-de-planificación-mensual)
10. [Tablero Kanban de Acciones To-Do](#10-tablero-kanban-de-acciones-to-do)
11. [Administración del Equipo de Comerciales](#11-administración-del-equipo-de-comerciales)
12. [Configuración del Sistema](#12-configuración-del-sistema)
13. [Guía de Inicio Rápido y Datos de Prueba](#13-guía-de-inicio-rápido-y-datos-de-prueba)

---

## 1. Acceso al Sistema y Gestión de Sesiones

CRM Sumelga cuenta con un robusto **sistema de roles y privilegios** (Administradores vs. Comerciales) que restringe y adapta la interfaz dinámicamente según la identidad del usuario actual.

### 🔄 Selector de Sesión Seguro (Header)
En la parte superior derecha de la cabecera, encontrarás el selector de **Sesión**. Este desplegable te permite simular la identidad de cualquier comercial o administrador en tiempo real:

1. **Seleccionar Usuario**: Haz clic en el combobox de sesión y selecciona el usuario que deseas simular.
2. **Introducir Contraseña**: Se abrirá automáticamente un modal de verificación de seguridad.
3. **Verificación Exitosa**: Al introducir la clave correcta, la interfaz se refrescará con los datos correspondientes al nuevo usuario.
4. **Validación de Error (Efecto Shake)**: Si introduces una contraseña incorrecta, el cuadro de texto vibrará visualmente en rojo (efecto *shake*) de manera elegante, notificará el error y te permitirá intentarlo de nuevo.
5. **Cancelación**: Si cancelas el modal o pulsas fuera de él, el selector superior revertirá de forma segura su estado visual al usuario que estaba activo previamente.

### 👥 Roles de Usuario y Sus Privilegios

| Privilegio / Función | Administrador | Comercial |
| :--- | :---: | :---: |
| **Visión de Clientes** | Global (Toda la base de datos) | Restringida (Solo clientes asignados) |
| **Asignar/Reasignar Clientes** | Sí (Desde el modal de Cliente) | No (Se le asigna automáticamente a sí mismo) |
| **Módulo de Comerciales** | Completo (Alta, Baja, Edición) | Oculto / Acceso Denegado (403 Forbidden) |
| **Visitas, Contactos y Tareas** | De todos los clientes del sistema | Exclusivo de sus clientes asignados |
| **KPIs del Dashboard** | Datos agregados globales | Datos exclusivos del comercial activo |

---

## 2. Barra de Navegación y Cabecera Global

La interfaz principal está optimizada para ofrecer un flujo de trabajo dinámico con un menú lateral izquierdo (*Sidebar*) y un encabezado superior (*Header*).

* **Sidebar**: Contiene el logo oficial de **Sumelga** y los botones de acceso directo a cada una de las pestañas o módulos: *Dashboard, Clientes, Contactos, Visitas / Minutas, Calendario, Acciones To-Do* y *Comerciales* (visible solo para Administradores). En la parte inferior del sidebar, se detalla permanentemente el avatar, nombre y rol del usuario que tiene la sesión activa.
* **Buscador Global**: En la parte izquierda de la cabecera, un cuadro de búsqueda inteligente te permite introducir términos en tiempo real para encontrar rápidamente coincidencias entre clientes, contactos o tareas.
* **Registrar Visita Rápida**: Un botón de acción destacada `+ Registrar Visita` que abre directamente la minuta para agilizar la entrada de datos estés en la pestaña que estés.
* **Interruptor de Tema**: Un botón flotante en la cabecera con el icono de sol/luna que permite alternar instantáneamente entre la estética oscura por defecto (*Dark Mode*) y un diseño claro (*Light Mode*) optimizado para entornos muy iluminados.

---

## 3. Cuadro de Mando (Dashboard)

El **Cuadro de Mando** es la pestaña de inicio predeterminada y el centro operativo diario.

* **Fijación de Objetivos**: Puedes configurar un objetivo mensual de visitas modificando el valor numérico en el control superior (*Objetivo Visitas*). La barra de progreso se actualizará en tiempo real.
* **KPIs Dinámicos**:
  * **Clientes Activos**: Muestra el recuento de empresas gestionadas por el usuario.
  * **Visitas este Mes**: Un indicador con una barra de progreso que evalúa el cumplimiento del objetivo mensual.
  * **Tareas Pendientes**: Número de acciones pendientes o en progreso que exigen atención.
  * **Acciones Cerradas**: Cantidad de tareas completadas durante el mes corriente.
* **Agenda de la Semana**: Un panel dedicado que extrae automáticamente las próximas visitas programadas para la semana actual.
* **To-Do Urgente**: Lista de prioridades que reúne las tareas cuya fecha límite es hoy o ya ha vencido. Cuenta con una casilla de verificación de marcado rápido que completa la tarea en la base de datos de forma instantánea.

---

## 4. Directorio de Clientes (Cuentas)

Este módulo organiza toda la cartera de organizaciones. Presenta una estructura de **Master-Detail Layout** (Lista-Detalle) en cascada.

* **Filtros Avanzados**: Permite filtrar empresas al instante por **Sector** (Automoción, Distribución, Industrial, Tecnológico, Otros) y por **Tipo de Cliente** (Cliente Final, OEM, SI, Cuadrista, Instalador), además de la barra de búsqueda en tiempo real.
* **Filtro de Sociedad**: Selector dropdown (`Todas`, `Sumelga`, `Meganor`) que actualiza la lista al instante.
* **Clasificación ABC**: Las cuentas se categorizan según su volumen de ventas potencial en:
  * **A (Alto Potencial)**: Resaltado visual para clientes estratégicos.
  * **B (Medio Potencial)**: Clientes de rango intermedio.
  * **C (Bajo Potencial)**: Cuentas de menor volumen o transaccionales.
* **Formulario de Dirección Estructurado**: Al añadir o editar un cliente, la dirección física se divide en campos individuales: **Vía**, **Dirección (Calle)**, **Número**, **Población** y **Código Postal**.
* Al hacer clic en cualquier fila de la tabla se abre la ficha del cliente en pantalla completa.

> [!WARNING]
> La eliminación de un cliente es una acción destructiva irreversible. Se ejecutará una eliminación en cascada en la base de datos que removerá automáticamente a todos los contactos, visitas, tareas y ofertas asociadas a ese cliente.

---

## 5. Ficha General del Cliente (Hub)

Al abrir un cliente en pantalla completa, la **Ficha General** es la pantalla de inicio predeterminada. Está diseñada como un **panel de mando centralizado** para ofrecer toda la información relevante de un vistazo y navegar rápidamente a cada módulo de detalle.

### Columna Izquierda: Información y Contactos
* **Datos de la Empresa**: CIF/NIF, Código Sumelga/Meganor (ERP), teléfono, sitio web, sector, tipo de cliente, histórico de ventas, sociedad y comercial asignado.
* **Dirección**: Dirección completa formateada con botón de enlace directo a **Google Maps**.
* **Botones de Acción**: Editar ficha del cliente y Eliminar (solo Administradores).
* **Contactos Vinculados**: Listado compacto de las personas de contacto asociadas al cliente, con botón para añadir nuevos contactos directamente.

### Columna Derecha: Tarjetas KPI de Acceso Rápido
Tres tarjetas resumen con indicadores numéricos y botón para ir al detalle completo:

| Tarjeta | Indicadores | Botón |
| :--- | :--- | :--- |
| **Ofertas en Curso** | Nº total de ofertas · Importe total ofertado | Ver Detalle de Ofertas |
| **Historial de Visitas** | Nº total de visitas registradas | Ver Detalle de Visitas |
| **Acciones Pendientes** | Nº de tareas activas (Pendiente + En Progreso) | Ver Detalle de Acciones |

### Navegación por Pestañas
En la parte superior de la ficha se encuentra la barra de navegación con cuatro pestañas:
* **Ficha General** *(activa por defecto)*: Panel Hub descrito arriba.
* **Ofertas**: Lista completa de ofertas del cliente con KPIs y exportación.
* **Visitas**: Historial completo de minutas de reuniones.
* **Acciones**: Tareas abiertas o cerradas vinculadas a la cuenta.

---

## 6. Personas de Contacto

Gestión de los interlocutores clave en las empresas del cliente para entablar relaciones de confianza.

* **Nivel de Decisión**: Clasificación de la influencia de cada contacto en el proceso de compra:
  * `Decisor`: Persona con autoridad final de firma.
  * `Prescriptor`: Recomienda y define soluciones técnicas.
  * `Usuario`: Operario o técnico que utilizará el producto.
  * `Bloqueador`: Interlocutor que puede obstaculizar la venta o tiene preferencias por la competencia.
* **Acciones Rápidas**: La tabla proporciona botones directos para abrir la aplicación de correo (`mailto:`), iniciar llamadas telefónicas (`tel:`) o visitar su perfil profesional en LinkedIn con un solo clic.
* **Notas Personales**: Campo especial donde se almacenan datos cualitativos (ej. "Prefiere reuniones de mañana", "Enfocado en eficiencia energética"), permitiendo al comercial preparar visitas con un enfoque personalizado.

---

## 7. Ofertas Comerciales

Módulo de consulta de las ofertas comerciales generadas en el ERP, accesible desde la **Ficha General** del cliente o desde la pestaña **Ofertas**.

### Tarjetas KPI Superiores
Cuatro indicadores de resumen calculados automáticamente para cada cliente:
* **Nº Total de Ofertas**: Recuento de todas las ofertas registradas.
* **Total Ofertado**: Suma del importe económico de todas las ofertas.
* **Ofertas Abiertas**: Ofertas en situación `P` (Pendiente de cierre).
* **Ofertas Cerradas**: Ofertas en situación `C` (Cerrada / ganada o perdida).

### Tabla de Ofertas
Listado detallado con las columnas:
* Nº Oferta · Referencia / Descripción · Fecha · Estado (Abierta / Cerrada) · Total (€)

### Exportación
* **Excel (CSV)**: Genera un fichero CSV con separador `;` y codificación UTF-8 BOM, listo para abrir directamente en Microsoft Excel en español.
* **PDF**: Fabrica internamente un archivo PDF real de alta calidad. En ordenadores de escritorio, descargará el archivo directamente. En dispositivos móviles, activará el **Menú Nativo de Compartir (Share Sheet)** de iOS o Android, permitiéndote enviar el PDF generado directamente a través de **Correo (Mail)**, **WhatsApp**, o guardarlo en los archivos del dispositivo.

> [!NOTE]
> Las ofertas se importan desde el fichero Excel `Listado ofertas 2026 01_07_26.xlsx` ejecutando `python3 seed_users.py`. Actualmente contiene **7.310 ofertas** de la sociedad **Sumelga**.

---

## 8. Registro de Visitas y Minutas con Dictado por Voz

El núcleo de interacciones de CRM Sumelga. Permite programar reuniones y registrar actas detalladas utilizando tecnologías de vanguardia.

### 🎙️ Dictado por Voz (Speech-to-Text)
En los campos *Objetivo, Puntos Tratados* y *Conclusiones*, encontrarás un botón de micrófono con la etiqueta **Dictar**:
1. Haz clic en **Dictar** para iniciar el reconocimiento de voz (el botón cambiará a un estado activo con luz parpadeante).
2. Habla con claridad al micrófono de tu dispositivo.
3. El sistema transcribirá tus palabras directamente dentro del cuadro de texto.
4. Vuelve a pulsar el botón para detener el dictado.

> [!IMPORTANT]
> El Dictado por Voz utiliza la **Web Speech API** del navegador. Por motivos de seguridad del navegador Chrome/Safari/Edge, **solo funciona en contextos seguros**:
> - En desarrollo local en `http://localhost:8000` o `http://127.0.0.1:8000`.
> - En producción a través de un protocolo cifrado **HTTPS** (ver manuales de despliegue).

### 📁 Subida de Archivos Adjuntos (Drag and Drop)
En la parte inferior del formulario de visita, dispones de una zona interactiva para adjuntar archivos (ofertas comerciales, planos técnicos, imágenes del taller):
* **Arrastrar y Soltar**: Arrastra archivos desde la carpeta de tu ordenador y suéltalos en la zona sombreada.
* **Selección manual**: Haz clic en la zona interactiva para abrir el selector de archivos del sistema.
* Los archivos se cargarán de forma asíncrona al guardar la visita y se alojarán de manera segura en el servidor, mostrándose como enlaces descargables dentro del historial.

---

## 9. Calendario de Planificación Mensual

Un organizador interactivo en forma de cuadrícula mensual completa generado dinámicamente según la fecha actual.

* **Visualización de Visitas**: Cada día muestra los eventos programados representados con etiquetas de colores según su modalidad:
  * 🟢 **Verde**: Visita Presencial.
  * 🔵 **Azul**: Reunión Virtual (Teams/Zoom).
  * 🟡 **Amarillo**: Llamada Telefónica.
* **Navegación**: Permite avanzar o retroceder de mes con los botones de flecha (`<` y `>`) o volver al mes corriente con el botón `Hoy`.
* **Interactividad de Celdas**:
  * **Crear**: Haz clic en un día vacío del calendario para abrir el formulario de visita con la fecha correspondiente ya preseleccionada.
  * **Editar**: Haz clic en una etiqueta de visita existente en el calendario para abrir directamente su minuta y editarla o descargar sus adjuntos.

---

## 10. Tablero Kanban de Acciones To-Do

El motor de seguimiento y cierre de tareas comerciales. Organiza el trabajo diario de forma visual en cuatro columnas de estado: `Pendiente`, `En Progreso`, `Completada` y `Cancelada`.

* **Drag and Drop (Arrastrar y Soltar)**: Puedes mover cualquier tarjeta de tarea de una columna a otra con el ratón o el dedo (en dispositivos móviles). El sistema guardará el nuevo estado de forma instantánea en la base de datos en segundo plano.
* **Indicador de Prioridad**: Las tarjetas reflejan su prioridad (`Alta`, `Media`, `Baja`) con etiquetas de color y contienen la descripción y fecha límite de la acción.
* **Alertas de Vencimiento**: Si una tarea no se ha completado y ha superado su fecha límite, la tarjeta mostrará un borde rojo brillante parpadeante y un aviso de "Vencida", ayudándote a priorizar las acciones críticas.

---

## 11. Administración del Equipo de Comerciales

Módulo exclusivo para usuarios con rol de **Administrador**. Permite mantener actualizada la plantilla del equipo de ventas.

* **Cuentas Asignadas**: La tabla del equipo de comerciales incluye una columna que muestra el número total de clientes (cuentas) asignados a cada comercial en tiempo real.
* **Registrar Comercial**: Formulario de alta para definir el nombre de usuario, rol (Comercial / Administrador), nombre, apellidos, correo electrónico y contraseña.
* **Edición**: Permite actualizar los datos personales, reasignar su rol o cambiar el estado del comercial.
* **Desactivación / Estado**: Si un comercial se encuentra ausente o causa baja, se puede modificar su estado a **Inactivo**. El usuario ya no podrá simular su sesión ni acceder a la API.
* **Protección de Auto-eliminación**: Un administrador no puede eliminarse a sí mismo de la base de datos para evitar bloqueos del sistema.

---

## 12. Configuración del Sistema

Módulo técnico exclusivo para **Administradores**, accesible desde la última pestaña del menú lateral, diseñado para realizar mantenimiento de la base de datos, diagnósticos y sincronización masiva de información con los sistemas ERP / Excel externos.

### Importar Ofertas desde Excel
Permite renovar el catálogo de presupuestos en curso mediante un fichero extraído del ERP:
* **Drag and Drop**: Arrastra el archivo `.xlsx` o `.xls` a la zona de subida interactiva.
* **Opciones de Importación**: Permite elegir la sociedad (`Sumelga` o `Meganor`) a la que aplicar la importación y determinar el comportamiento a través de la casilla "Reemplazar todas las ofertas existentes":
  * **Casilla marcada (por defecto)**: El sistema elimina primero **todas** las ofertas registradas previamente para la sociedad seleccionada y carga desde cero las incluidas en el Excel. Recomendado para evitar duplicados al extraer listados completos del ERP.
  * **Casilla desmarcada**: Conserva las ofertas actuales y **añade** las del archivo Excel como nuevas. *Importante:* No se verifica si las ofertas ya existían; si el Excel contiene ofertas que ya estaban en el CRM, se crearán registros duplicados.
* **Procesamiento**: Al iniciar la carga, verás una barra de progreso. El sistema mapeará el código ERP de la hoja de cálculo con el cliente interno del CRM, omitiendo filas inválidas de manera segura.

### Optimización de Índices
Herramienta de rendimiento (mantenimiento preventivo). Se recomienda ejecutar tras grandes importaciones:
* **Ejecución de un Clic**: Aplica los 35 índices de base de datos definidos en el sistema de una pasada, forzando un `ANALYZE` y un `VACUUM`.
* **Resultado**: Asegura que las búsquedas, los filtros por sociedad/sector y los paneles tarden apenas unos milisegundos en cargar, incluso con decenas de miles de registros.

### Sincronizar Ventas desde ERP
Integración nativa con la base de datos central `kpi_comercial.db` del backend analítico:
* **Recálculo de KPIs**: Actualiza el campo de facturación (`volumen_ventas`) de todos los clientes con los datos reales del año en curso.
* **Re-clasificación ABC Automática**: Ajusta dinámicamente si un cliente sube de B a A (al superar 50.000€) basándose en las ventas importadas.
* **Alta de Nuevos Clientes**: Escanea la base de datos ERP y crea nuevos perfiles de cliente en el CRM si no existían. No modifica campos que pertenecen exclusivamente a CRM (como personas de contacto, minutas de visitas o tareas).

### Diagnóstico del Sistema
Panel de salud en tiempo real que monitoriza los aspectos vitales del servidor y base de datos local:
* Muestra el tamaño físico del fichero `crm.db` y su porcentaje de fragmentación interna.
* Muestra el recuento de filas en tiempo real por cada tabla y el estado de la verificación de integridad de SQLite.
* Muestra el estado del modo asíncrono WAL, garantizando que el servidor FastAPI responda óptimamente bajo estrés.

---

## 13. Guía de Inicio Rápido y Datos de Prueba

Para realizar pruebas rápidas de las funcionalidades, el sistema viene preconfigurado con una base de datos de demostración que puedes restablecer en cualquier momento ejecutando el script de reinicio en tu terminal:

```bash
# En macOS o Linux para limpiar la base de datos y sembrar datos de demostración:
./reset.sh --seed

# Tras el sembrado, optimizar índices para máximo rendimiento:
python3 optimize_db_indexes.py
```

### 🔐 Credenciales seeded para Demostración

Puedes utilizar las siguientes cuentas de prueba a través del selector de sesión superior:

1. **Agustín (Administrador)**
   * **Usuario**: `admin`
   * **Contraseña**: `admin123`
   * *Ideal para*: Probar la gestión global de clientes, dar de alta nuevos comerciales en la pestaña "Comerciales" y reasignar clientes a Carlos o Sofía.

2. **Carlos Sanz (Comercial)**
   * **Usuario**: `carlos`
   * **Contraseña**: `carlos123`
   * *Clientes asignados*: Sanz Automoción S.A., Metalúrgicas del Norte S.A.S.
   * *Ideal para*: Comprobar el aislamiento de datos (solo visualizará sus 2 clientes asignados, sus visitas y tareas). La pestaña "Comerciales" no estará visible en su sidebar.

3. **Sofía Valiente (Comercial)**
   * **Usuario**: `sofia`
   * **Contraseña**: `sofia123`
   * *Clientes asignados*: Distribuciones del Mediterráneo S.L., Partner Tecnológico Avanzado S.L.
   * *Ideal para*: Visualizar sus clientes asignados y comprobar el funcionamiento de las tareas Kanban asignadas exclusivamente a su usuario.

### 👥 Credenciales de Comerciales Importados Dinámicamente
Además de las cuentas de demostración predeterminadas, CRM Sumelga importa de manera automática el resto de comerciales del ERP/KPI. A continuación se detallan sus credenciales de acceso:

> [!NOTE]
> La contraseña por defecto de los comerciales importados sigue el patrón `comercial[CODIGO]123` (manteniendo las mayúsculas/minúsculas del código).

<details>
<summary>📂 Mostrar listado completo de comerciales adicionales (26 usuarios)</summary>

| Nombre Comercial | Código (Rep) | Usuario | Contraseña |
| :--- | :--- | :--- | :--- |
| **Martin** | `0004` | `martin` | `comercial0004123` |
| **Javier** | `0005` | `javier` | `comercial0005123` |
| **Manuel Garcia** | `0006` | `manuelgarcia` | `comercial0006123` |
| **Mary Carmen** | `0007` | `marycarmen` | `comercial0007123` |
| **Santiago** | `0008` | `santiago` | `comercial0008123` |
| **Fco Javier Velasco** | `0009` | `fcojaviervelasco` | `comercial0009123` |
| **Alejandro Vazquez** | `0010` | `alejandrovazquez` | `comercial0010123` |
| **Manuel Meira** | `0011` | `manuelmeira` | `comercial0011123` |
| **Jose Manuel Louzao** | `0012` | `josemanuellouzao` | `comercial0012123` |
| **Jaime** | `0013` | `jaime` | `comercial0013123` |
| **Adrian Mariño** | `0014` | `adrianmarino` | `comercial0014123` |
| **Oscar** | `0015` | `oscar` | `comercial0015123` |
| **Raquel** | `0016` | `raquel` | `comercial0016123` |
| **Martin Bujan** | `0017` | `martinbujan` | `comercial0017123` |
| **Adrian Piñeiro** | `0019` | `adrianpineiro` | `comercial0019123` |
| **Iago Rodríguez** | `0020` | `iagorodriguez` | `comercial0020123` |
| **Sumelga (Javier Sousa)** | `5555` | `sumelgajaviersousaclientessinasignar` | `comercial5555123` |
| **Sumelga (Industrial)** | `6666` | `sumelgaindustrial` | `comercial6666123` |
| **Grupo Grudilec** | `8888` | `grupogrudilec` | `comercial8888123` |
| **Almacenes Grupo 24** | `9999` | `almacenesgrupo24competencias` | `comercial9999123` |
| **Marcos** | `M0001` | `marcos` | `comercialM0001123` |
| **Ricardo** | `M0003` | `ricardo` | `comercialM0003123` |
| **Ferrol** | `M0004` | `ferrol` | `comercialM0004123` |
| **Ignacio** | `M0005` | `ignacio` | `comercialM0005123` |
| **Alvaro** | `M0006` | `alvaro` | `comercialM0006123` |
| **Adrian** | `M0007` | `adrian` | `comercialM0007123` |

</details>

---

## 💻 14. Conexión desde otro Portátil / Dispositivo Remoto

Si has configurado tu Mac como servidor para que otros miembros del equipo se conecten a la aplicación desde sus propios portátiles o móviles, sigue estas sencillas pautas:

### Requisitos Previos
* Ambos equipos deben estar en la **misma red local (Wi-Fi/Ethernet)** o en la misma **VPN corporativa**.
* El cortafuegos del servidor debe permitir conexiones en el puerto de la aplicación (por defecto `8000`).

### Paso 1: Levantar el Servidor en Modo Externo
* **En macOS**: Haz doble clic en [start_mac.command](file:///Users/agus/Developer/CRM/start_mac.command). Cuando te pregunte si deseas permitir conexiones externas, pulsa `S` y luego `Enter`.
* **Por comando manual**: Ejecuta `python3 run.py --external` (o indica un puerto con `--port=XXXX`).
* En la consola del servidor aparecerá un texto informándote de las direcciones de acceso, incluyendo la IP local:
  ```text
  Dirección externa (red local): http://192.168.1.140:8000
  ```

### Paso 2: Conectarse desde el Portátil Cliente
1. Abre el navegador web en el portátil cliente.
2. Escribe la dirección IP externa mostrada en la consola del servidor (por ejemplo, `http://192.168.1.140:8000`) y presiona `Enter`.
3. Inicia sesión normalmente simulando o ingresando con tu usuario.

### 🎙️ Uso del Micrófono (Dictado por Voz) en Conexiones Inseguras
Dado que los navegadores modernos **bloquean el uso de micrófono y cámara en páginas web sin HTTPS**, si te conectas por red local/VPN bajo `http://` (HTTP no seguro), el botón de dictado por voz no se mostrará por privacidad.

* **Solución Profesional**: Desplegar la aplicación bajo un dominio seguro (`https://...`) usando un proxy inverso como Nginx/Caddy con certificados SSL.
* **Solución Rápida en Google Chrome de escritorio (Clientes)**:
  1. En el portátil cliente, abre Chrome y navega a `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
  2. Pega la URL del servidor (ej. `http://192.168.1.140:8000`) en el cuadro de texto.
  3. Cambia el selector lateral a **Enabled**.
  4. Pulsa en **Relaunch** para reiniciar Chrome. El navegador habilitará el micrófono normalmente.
