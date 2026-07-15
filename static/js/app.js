/* ==========================================
   CRM Sumelga - APPLICATION CONTROLLER (SPA LOGIC)
   ========================================== */

// --- Global Application State ---
const state = {
  activeTab: 'dashboard',
  clients: [],
  contacts: [],
  visits: [],
  tasks: [],
  selectedClientId: null,
  selectedClientDetail: null,
  voiceRecognition: null,
  isRecording: false,
  activeRecordingField: null,
  currentUploads: [], // Array of File objects ready to upload on Visit save
  currentCalendarMonth: new Date().getMonth(),
  currentCalendarYear: new Date().getFullYear(),
  isFullscreenDetail: false
};


// --- DOM References ---
const DOM = {
  navItems: document.querySelectorAll('.nav-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  themeToggle: document.getElementById('theme-toggle'),
  globalSearch: document.getElementById('global-search'),
  
  // Dashboard
  metricActiveClients: document.getElementById('metric-active-clients'),
  metricMonthlyVisits: document.getElementById('metric-monthly-visits'),
  metricVisitsPct: document.getElementById('metric-visits-pct'),
  metricPendingTasks: document.getElementById('metric-pending-tasks'),
  metricCompletedTasks: document.getElementById('metric-completed-tasks'),
  visitsProgress: document.getElementById('visits-progress'),
  dashboardAgenda: document.getElementById('dashboard-agenda'),
  dashboardUrgentTodo: document.getElementById('dashboard-urgent-todo'),
  monthlyTargetInput: document.getElementById('monthly-target-input'),
  agendaCount: document.getElementById('agenda-count'),
  urgentTasksCount: document.getElementById('urgent-tasks-count'),
  
  // Clients
  clientsTableBody: document.getElementById('clients-table-body'),
  clientSearch: document.getElementById('client-search'),
  clientFilterSector: document.getElementById('client-filter-sector'),
  clientFilterTipo: document.getElementById('client-filter-tipo'),
  clientFilterSociedad: document.getElementById('client-filter-sociedad'),
  
  // Client Detail Cascade Panel
  clientDetailPanel: document.getElementById('client-detail-panel'),
  closeDetailPanel: document.getElementById('close-detail-panel'),
  detailClientName: document.getElementById('detail-client-name'),
  detailClientCommercial: document.getElementById('detail-client-commercial'),
  detailClientAbc: document.getElementById('detail-client-abc'),
  detailClientCif: document.getElementById('detail-client-cif'),
  detailClientSumelga: document.getElementById('detail-client-sumelga'),
  detailClientSociedad: document.getElementById('detail-client-sociedad'),
  detailClientPhone: document.getElementById('detail-client-phone'),
  detailClientWeb: document.getElementById('detail-client-web'),
  detailClientSector: document.getElementById('detail-client-sector'),
  detailClientType: document.getElementById('detail-client-type'),
  detailClientSales: document.getElementById('detail-client-sales'),
  detailClientSalesPrev: document.getElementById('detail-client-sales-prev'),
  detailClientSales2024: document.getElementById('detail-client-sales-2024'),
  detailClientSales2023: document.getElementById('detail-client-sales-2023'),
  detailClientAddress: document.getElementById('detail-client-address'),
  detailClientMap: document.getElementById('detail-client-map'),
  detailContactsList: document.getElementById('detail-contacts-list'),
  detailVisitsList: document.getElementById('detail-visits-list'),
  detailTasksList: document.getElementById('detail-tasks-list'),
  detailOffersList: document.getElementById('detail-offers-list'),
  btnExportOffersExcel: document.getElementById('btn-export-offers-excel'),
  btnExportOffersPdf: document.getElementById('btn-export-offers-pdf'),
  detailTabButtons: document.querySelectorAll('.detail-tab-btn'),
  detailTabContents: document.querySelectorAll('.detail-tab-content'),
  
  // Contacts
  contactsTableBody: document.getElementById('contacts-table-body'),
  contactFilterClient: document.getElementById('contact-filter-client'),
  
  // Visits
  visitsTimeline: document.getElementById('visits-timeline-container'),
  visitFilterClient: document.getElementById('visit-filter-client'),
  visitFilterMonth: document.getElementById('visit-filter-month'),
  visitFilterYear: document.getElementById('visit-filter-year'),
  
  // Tasks
  tasksTodoList: document.getElementById('tasks-todo-list'),
  tasksProgressList: document.getElementById('tasks-progress-list'),
  tasksDoneList: document.getElementById('tasks-done-list'),
  tasksCancelledList: document.getElementById('tasks-cancelled-list'),
  taskFilterClient: document.getElementById('task-filter-client'),
  countTodo: document.getElementById('count-todo'),
  countProgress: document.getElementById('count-progress'),
  countDone: document.getElementById('count-done'),
  countCancelled: document.getElementById('count-cancelled'),

  // Modals
  modalClient: document.getElementById('modal-client'),
  modalContact: document.getElementById('modal-contact'),
  modalVisit: document.getElementById('modal-visit'),
  modalTask: document.getElementById('modal-task'),
  
  // Forms
  formClient: document.getElementById('form-client'),
  formContact: document.getElementById('form-contact'),
  formVisit: document.getElementById('form-visit'),
  formTask: document.getElementById('form-task'),
  
  // Modals Trigger Buttons
  btnQuickVisit: document.getElementById('btn-quick-visit'),
  btnAddClient: document.getElementById('btn-add-client'),
  btnAddContact: document.getElementById('btn-add-contact'),
  btnAddVisit: document.getElementById('btn-add-visit'),
  btnAddTask: document.getElementById('btn-add-task'),
  
  btnEditClient: document.getElementById('btn-edit-client'),
  btnDeleteClient: document.getElementById('btn-delete-client'),
  btnAddContactToClient: document.getElementById('btn-add-contact-to-client'),
  btnAddVisitToClient: document.getElementById('btn-add-visit-to-client'),
  btnAddTaskToClient: document.getElementById('btn-add-task-to-client'),
  
  // Drag & drop visit uploads
  visitDropzone: document.getElementById('visit-dropzone'),
  visitFileInput: document.getElementById('visit-file-input'),
  visitUploadedFiles: document.getElementById('visit-uploaded-files'),
  visitAttendeesCheckboxes: document.getElementById('visit-attendees-checkboxes'),

  // Calendar
  calendarMonthYear: document.getElementById('calendar-month-year'),
  calendarDaysGrid: document.getElementById('calendar-days-grid'),
  calendarPrevMonth: document.getElementById('calendar-prev-month'),
  calendarNextMonth: document.getElementById('calendar-next-month'),
  calendarTodayBtn: document.getElementById('calendar-today-btn'),
  calendarBtnAddVisit: document.getElementById('calendar-btn-add-visit'),

  // Comerciales & Session Switcher
  sessionUserSelect: document.getElementById('session-user-select'),
  comercialesTableBody: document.getElementById('comerciales-table-body'),
  modalComercial: document.getElementById('modal-comercial'),
  formComercial: document.getElementById('form-comercial'),
  btnAddComercial: document.getElementById('btn-add-comercial'),

  // Password modal
  modalPasswordPrompt: document.getElementById('modal-password-prompt'),
  formPasswordPrompt: document.getElementById('form-password-prompt'),
  sessionPasswordInput: document.getElementById('session-password-input'),
  passwordErrorMsg: document.getElementById('password-error-msg'),
  passwordPromptUserId: document.getElementById('password-prompt-user-id'),
  passwordPromptUserName: document.getElementById('password-prompt-user-name'),
  btnCancelPassword: document.getElementById('btn-cancel-password'),
  btnConfirmPassword: document.getElementById('btn-confirm-password'),
  btnClosePasswordModal: document.getElementById('btn-close-password-modal')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client_id');
  if (clientId) {
    state.isFullscreenDetail = true;
    state.selectedClientId = parseInt(clientId, 10);
    state.activeTab = 'clients';
    document.body.classList.add('fullscreen-detail-mode');
  }

  setupEventListeners();
  setupSpeechRecognition();
  initSessionSwitcher(); // Initialize user sessions
  
  // Initial load of config
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    DOM.themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
  }

  // Fallback for modal light-dismiss on backdrop click (for Safari and older browsers)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInsideDialog = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInsideDialog) {
          dialog.close();
        }
      });
    });
  }
}

// --- Tab Navigation Controller ---
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update nav buttons
  DOM.navItems.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update view panes
  DOM.tabPanes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
  
  // Load data for specific tab
  loadTabContent(tabId);
}

function loadCurrentTab() {
  switchTab(state.activeTab);
}

function loadTabContent(tabId) {
  // Always fetch dynamic client lists to populate dropdown filters
  populateClientDropdowns();
  
  if (tabId === 'dashboard') {
    loadDashboard();
  } else if (tabId === 'clients') {
    loadClients();
  } else if (tabId === 'contacts') {
    loadContacts();
  } else if (tabId === 'visits') {
    loadVisits();
  } else if (tabId === 'tasks') {
    loadTasks();
  } else if (tabId === 'calendar') {
    loadCalendar();
  } else if (tabId === 'comerciales') {
    loadComerciales();
  } else if (tabId === 'configuracion') {
    initConfiguracionPage();
  }
}

// --- API Helpers ---
async function apiRequest(endpoint, options = {}) {
  try {
    // Inject active user id as header
    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      options.headers = options.headers || {};
      options.headers['X-User-Id'] = activeUserId;
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Error en la petición API');
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    alert(`Error: ${error.message}`);
    return null;
  }
}

// --- Populate dropdown selection lists ---
async function populateClientDropdowns() {
  const clients = await apiRequest('/api/clients');
  if (!clients) return;
  
  // Save global state
  state.clients = clients;
  
  const dropdowns = [DOM.contactFilterClient, DOM.visitFilterClient, DOM.taskFilterClient];
  const formDropdowns = [
    document.getElementById('contact-client'),
    document.getElementById('visit-client'),
    document.getElementById('task-client-select')
  ];
  
  // Generate options HTML in-memory as a single string to avoid O(N^2) innerHTML += performance hit
  let optionsHtml = '';
  clients.forEach(c => {
    optionsHtml += `<option value="${c.id}">${c.razon_social}</option>`;
  });
  
  // Filter Dropdowns
  dropdowns.forEach(dropdown => {
    if (!dropdown) return;
    const currentVal = dropdown.value;
    dropdown.innerHTML = `<option value="">Todas las empresas</option>` + optionsHtml;
    dropdown.value = currentVal;
  });
  
  // Form Dropdowns (don't have "all" option)
  formDropdowns.forEach(dropdown => {
    if (!dropdown) return;
    const currentVal = dropdown.value;
    dropdown.innerHTML = `<option value="" disabled selected>Selecciona una empresa...</option>` + optionsHtml;
    dropdown.value = currentVal;
  });
}

// --- 1. DASHBOARD CONTROLLER ---
async function loadDashboard() {
  const target = DOM.monthlyTargetInput.value || 20;
  const metrics = await apiRequest(`/api/dashboard?target=${target}`);
  if (!metrics) return;
  
  // Render KPI Numbers
  DOM.metricActiveClients.innerText = metrics.total_clientes_activos;
  DOM.metricMonthlyVisits.innerText = metrics.total_visitas_este_mes;
  DOM.metricVisitsPct.innerText = `${metrics.visitas_completadas_porcentaje}%`;
  DOM.metricPendingTasks.innerText = metrics.tareas_pendientes;
  DOM.metricCompletedTasks.innerText = metrics.tareas_completadas_este_mes;
  
  // Render KPI Progress bar
  DOM.visitsProgress.style.width = `${Math.min(metrics.visitas_completadas_porcentaje, 100)}%`;
  
  // Badges count
  DOM.agendaCount.innerText = `${metrics.agenda_semana.length} programadas`;
  DOM.urgentTasksCount.innerText = `${metrics.tareas_urgentes.length} urgentes`;
  
  // Render Agenda lists
  DOM.dashboardAgenda.innerHTML = '';
  if (metrics.agenda_semana.length === 0) {
    DOM.dashboardAgenda.innerHTML = `
      <div class="empty-state">
        <i class="bx bx-calendar-x"></i>
        <p>No tienes visitas programadas para esta semana.</p>
      </div>`;
  } else {
    metrics.agenda_semana.forEach(visit => {
      const client = state.clients.find(c => c.id === visit.client_id) || { razon_social: 'Empresa' };
      DOM.dashboardAgenda.innerHTML += `
        <div class="agenda-card" onclick="switchTab('visits')">
          <div class="agenda-main">
            <span class="agenda-company">${client.razon_social}</span>
            <span class="agenda-meta">
              <span><i class="bx bx-calendar"></i> ${formatDate(visit.fecha)}</span>
              <span><i class="bx bx-map"></i> ${visit.tipo_visita}</span>
            </span>
          </div>
          <span class="agenda-time">${visit.hora}</span>
        </div>`;
    });
  }
  
  // Render Urgent To-Do checklists
  DOM.dashboardUrgentTodo.innerHTML = '';
  if (metrics.tareas_urgentes.length === 0) {
    DOM.dashboardUrgentTodo.innerHTML = `
      <div class="empty-state">
        <i class="bx bx-check-double text-success"></i>
        <p>¡Buen trabajo! No tienes tareas urgentes o vencidas.</p>
      </div>`;
  } else {
    metrics.tareas_urgentes.forEach(task => {
      const client = state.clients.find(c => c.id === task.client_id) || { razon_social: 'Empresa' };
      const isOverdue = new Date(task.fecha_limite) < new Date();
      DOM.dashboardUrgentTodo.innerHTML += `
        <div class="todo-card">
          <div class="todo-content">
            <span class="todo-desc">${task.descripcion}</span>
            <span class="todo-meta">
              <span class="kanban-card-company">${client.razon_social}</span>
              <span class="kanban-date ${isOverdue ? 'date-overdue' : ''}">
                <i class="bx bx-calendar-alt"></i> Vence: ${formatDate(task.fecha_limite)}
              </span>
            </span>
          </div>
          <button class="todo-btn-done" onclick="completeTaskQuick(${task.id})" title="Marcar como Completada">
            <i class="bx bx-circle"></i>
          </button>
        </div>`;
    });
  }
}

async function completeTaskQuick(taskId) {
  const res = await apiRequest(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'Completada' })
  });
  if (res) {
    loadDashboard();
  }
}

// --- 2. CLIENTS CONTROLLER ---
function formatFullAddress(c) {
  if (!c) return 'Sin dirección registrada';
  const parts = [];
  if (c.via) parts.push(c.via);
  if (c.direccion) parts.push(c.direccion);
  if (c.numero) parts.push(c.numero);
  
  let mainAddress = parts.join(' ');
  const localityParts = [];
  if (c.codigo_postal) localityParts.push(c.codigo_postal);
  if (c.poblacion) localityParts.push(c.poblacion);
  
  if (localityParts.length > 0) {
    if (mainAddress) {
      mainAddress += `, ${localityParts.join(' ')}`;
    } else {
      mainAddress = localityParts.join(' ');
    }
  }
  return mainAddress || 'Sin dirección registrada';
}

async function loadClients() {
  const search = DOM.clientSearch.value;
  const sector = DOM.clientFilterSector.value;
  const tipo = DOM.clientFilterTipo.value;
  const sociedad = DOM.clientFilterSociedad ? DOM.clientFilterSociedad.value : '';
  
  let url = '/api/clients?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (sector) url += `sector=${encodeURIComponent(sector)}&`;
  if (tipo) url += `tipo_cliente=${encodeURIComponent(tipo)}&`;
  if (sociedad) url += `sociedad=${encodeURIComponent(sociedad)}&`;
  
  const clients = await apiRequest(url);
  if (!clients) return;
  
  state.clients = clients;
  
  // Render table rows using single innerHTML assignment
  if (clients.length === 0) {
    DOM.clientsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Ningún cliente coincide con los filtros.</td></tr>`;
  } else {
    let rowsHtml = '';
    clients.forEach(c => {
      const lastVisitFormatted = c.fecha_ultima_visita ? formatDate(c.fecha_ultima_visita) : 'Nunca';
      const actionBadgeClass = getActionBadgeClass(c.estado_ultima_accion);
      const comercialName = c.comercial ? `${c.comercial.nombre} ${c.comercial.apellidos[0]}.` : '<span class="text-muted">-</span>';
      
      const socBadge = c.sociedad === 'Meganor' ? 
        '<span class="badge-type" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); margin-left: 6px; padding: 2px 6px; font-size: 10px; font-weight: 700; border-radius: 4px;">MEG</span>' : 
        '<span class="badge-type" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); margin-left: 6px; padding: 2px 6px; font-size: 10px; font-weight: 700; border-radius: 4px;">SUM</span>';
        
      rowsHtml += `
        <tr onclick="showClientDetail(${c.id})">
          <td>
            <div style="font-weight: 600; display: flex; align-items: center; gap: 4px;">${c.razon_social} ${socBadge}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${c.nombre_comercial || ''}</div>
          </td>
          <td class="hide-on-mobile"><span class="badge-type type-${c.tipo_cliente.toLowerCase().replace(/\s+/g, '-')}">${c.tipo_cliente}</span></td>
          <td class="hide-on-mobile"><span class="abc-indicator abc-${c.clasificacion_abc.toLowerCase()}">${c.clasificacion_abc}</span></td>
          <td class="hide-on-mobile">${comercialName}</td>
          <td>${lastVisitFormatted}</td>
          <td><span class="sales-val">${formatMoney(c.volumen_ventas)}</span></td>
        </tr>`;
    });
    DOM.clientsTableBody.innerHTML = rowsHtml;
  }

  if (state.isFullscreenDetail && state.selectedClientId) {
    showClientDetail(state.selectedClientId);
  }
}

// --- Cascade Detail Panel display ---
async function showClientDetail(clientId) {
  if (!state.isFullscreenDetail) {
    window.open(`/?client_id=${clientId}`, '_blank');
    return;
  }

  state.selectedClientId = clientId;
  const clientDetail = await apiRequest(`/api/clients/${clientId}/detail`);
  if (!clientDetail) return;
  
  state.selectedClientDetail = clientDetail;
  document.title = `${clientDetail.razon_social} | Detalle de Cliente`;
  
  // Bind details to fields
  DOM.detailClientName.innerText = clientDetail.razon_social;
  DOM.detailClientCommercial.innerText = clientDetail.nombre_comercial || 'Sin nombre comercial';
  DOM.detailClientAbc.className = `detail-badge abc-${clientDetail.clasificacion_abc.toLowerCase()}`;
  DOM.detailClientAbc.innerText = `Clasificación ${clientDetail.clasificacion_abc}`;
  DOM.detailClientCif.innerText = clientDetail.cif_nif || '-';
  DOM.detailClientSumelga.innerText = clientDetail.codigo_sumelga || '-';
  DOM.detailClientSociedad.innerText = clientDetail.sociedad || '-';
  DOM.detailClientPhone.innerText = clientDetail.telefono || '-';
  
  if (clientDetail.web) {
    DOM.detailClientWeb.innerText = clientDetail.web;
    DOM.detailClientWeb.href = clientDetail.web.startsWith('http') ? clientDetail.web : `https://${clientDetail.web}`;
    DOM.detailClientWeb.style.display = 'inline-block';
  } else {
    DOM.detailClientWeb.innerText = '-';
    DOM.detailClientWeb.removeAttribute('href');
  }
  
  DOM.detailClientSector.innerText = clientDetail.sector;
  DOM.detailClientType.innerText = clientDetail.tipo_cliente;
  DOM.detailClientSales.innerText = formatMoney(clientDetail.volumen_ventas);
  DOM.detailClientSalesPrev.innerText = formatMoney(clientDetail.ventas_2025 || clientDetail.volumen_ventas_anterior || 0.0);
  DOM.detailClientSales2024.innerText = formatMoney(clientDetail.ventas_2024 || 0.0);
  DOM.detailClientSales2023.innerText = formatMoney(clientDetail.ventas_2023 || 0.0);
  
  const detailComercial = document.getElementById('detail-client-comercial-assigned');
  if (detailComercial) {
    detailComercial.innerText = clientDetail.comercial ? `${clientDetail.comercial.nombre} ${clientDetail.comercial.apellidos}` : 'Sin asignar';
  }
  
  const fullAddress = formatFullAddress(clientDetail);
  DOM.detailClientAddress.innerText = fullAddress;
  
  if (fullAddress !== 'Sin dirección registrada') {
    DOM.detailClientMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    DOM.detailClientMap.style.display = 'inline-flex';
  } else {
    DOM.detailClientMap.style.display = 'none';
  }
  
  // Populate Detail sub-tabs
  renderDetailContacts(clientDetail.contacts);
  renderDetailVisits(clientDetail.visits);
  renderDetailTasks(clientDetail.tasks);
  renderDetailOffers(clientDetail.offers);

  // Populate summary count statistics in the Hub/Ficha General
  const countOffers = clientDetail.offers ? clientDetail.offers.length : 0;
  const countVisits = clientDetail.visits ? clientDetail.visits.length : 0;
  const countTasks = clientDetail.tasks ? clientDetail.tasks.filter(t => t.estado !== 'Completada' && t.estado !== 'Cancelada').length : 0;

  let totalOffersAmount = 0;
  if (clientDetail.offers) {
    clientDetail.offers.forEach(o => {
      totalOffersAmount += o.total;
    });
  }

  const statOffersCount = document.getElementById('hub-stat-offers-count');
  const statOffersTotal = document.getElementById('hub-stat-offers-total');
  const statVisitsCount = document.getElementById('hub-stat-visits-count');
  const statTasksCount = document.getElementById('hub-stat-tasks-count');

  if (statOffersCount) statOffersCount.innerText = countOffers;
  if (statOffersTotal) statOffersTotal.innerText = formatMoney(totalOffersAmount);
  if (statVisitsCount) statVisitsCount.innerText = countVisits;
  if (statTasksCount) statTasksCount.innerText = countTasks;
  
  // Open Cascade detail panel
  DOM.clientDetailPanel.removeAttribute('hidden');
}

function renderDetailOffers(offers) {
  DOM.detailOffersList.innerHTML = '';

  // Calculate summary metrics
  const totalOffers = offers ? offers.length : 0;
  let totalAmount = 0;
  let openOffers = 0;
  let closedOffers = 0;

  if (offers && offers.length > 0) {
    offers.forEach(o => {
      totalAmount += o.total;
      if (o.situacion === 'C') {
        closedOffers++;
      } else {
        openOffers++;
      }
    });
  }

  // Render summary grid HTML
  const summaryEl = document.getElementById('detail-offers-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="offers-summary-box">
        <span class="summary-label">Nº Ofertas</span>
        <span class="summary-val">${totalOffers}</span>
      </div>
      <div class="offers-summary-box">
        <span class="summary-label">Total Ofertado</span>
        <span class="summary-val" style="color: var(--primary);">${formatMoney(totalAmount)}</span>
      </div>
      <div class="offers-summary-box">
        <span class="summary-label">Abiertas (P)</span>
        <span class="summary-val" style="color: #f59e0b;">${openOffers}</span>
      </div>
      <div class="offers-summary-box hide-on-mobile">
        <span class="summary-label">Cerradas (C)</span>
        <span class="summary-val" style="color: #10b981;">${closedOffers}</span>
      </div>
    `;
  }

  if (!offers || offers.length === 0) {
    DOM.detailOffersList.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No hay ofertas para este cliente.</td></tr>`;
  } else {
    offers.forEach(o => {
      const dateFormatted = o.fecha_creacion ? formatDate(o.fecha_creacion) : '-';
      const stateBadge = o.situacion === 'C' ?
        '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 6px; font-size: 11px; border-radius: 4px;">Cerrada</span>' :
        '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 6px; font-size: 11px; border-radius: 4px;">Pendiente</span>';

      const desc = o.descripcion || '';
      const ref = o.referencia ? `Ref: ${o.referencia}` : '';
      const textCell = [ref, desc].filter(x => x).join(' - ') || '-';

      DOM.detailOffersList.innerHTML += `
        <tr>
          <td style="font-weight: 600;">${o.numero_oferta}</td>
          <td>${textCell}</td>
          <td>${dateFormatted}</td>
          <td>${stateBadge}</td>
          <td style="text-align: right; font-weight: 600;">${formatMoney(o.total)}</td>
        </tr>`;
    });
  }
}

function renderDetailContacts(contacts) {
  DOM.detailContactsList.innerHTML = '';
  if (contacts.length === 0) {
    DOM.detailContactsList.innerHTML = `<p class="text-muted text-sm">No hay contactos para esta empresa.</p>`;
  } else {
    contacts.forEach(c => {
      DOM.detailContactsList.innerHTML += `
        <div class="compact-item">
          <div class="compact-item-main">
            <span class="compact-item-title">${c.nombre} ${c.apellidos}</span>
            <span class="compact-item-subtitle">${c.cargo || 'Cargo no definido'} | Decisión: ${c.nivel_decision}</span>
          </div>
          <a href="tel:${c.movil}" class="btn btn-sm btn-outline" style="padding:4px 8px;"><i class="bx bx-phone"></i></a>
        </div>`;
    });
  }
}

function renderDetailVisits(visits) {
  DOM.detailVisitsList.innerHTML = '';
  if (visits.length === 0) {
    DOM.detailVisitsList.innerHTML = `<p class="text-muted text-sm">No hay visitas registradas.</p>`;
  } else {
    visits.forEach(v => {
      DOM.detailVisitsList.innerHTML += `
        <div class="compact-item">
          <div class="compact-item-main">
            <span class="compact-item-title">${v.tipo_visita} (${v.duracion} min)</span>
            <span class="compact-item-subtitle">${formatDate(v.fecha)} a las ${v.hora}</span>
          </div>
          <button class="btn btn-sm btn-outline" style="padding:4px 8px;" onclick="switchTab('visits')"><i class="bx bx-show"></i></button>
        </div>`;
    });
  }
}

function renderDetailTasks(tasks) {
  DOM.detailTasksList.innerHTML = '';
  const pendings = tasks.filter(t => t.estado === 'Pendiente' || t.estado === 'En Progreso');
  if (pendings.length === 0) {
    DOM.detailTasksList.innerHTML = `<p class="text-muted text-sm">No hay acciones pendientes.</p>`;
  } else {
    pendings.forEach(t => {
      const isOverdue = new Date(t.fecha_limite) < new Date();
      DOM.detailTasksList.innerHTML += `
        <div class="compact-item" style="border-left: 3px solid ${t.prioridad === 'Alta' ? 'var(--accent-danger)' : 'var(--accent-yellow)'}">
          <div class="compact-item-main">
            <span class="compact-item-title">${t.descripcion}</span>
            <span class="compact-item-subtitle ${isOverdue ? 'date-overdue' : ''}">Vence: ${formatDate(t.fecha_limite)}</span>
          </div>
          <button class="btn btn-sm btn-outline" style="padding:4px 8px;" onclick="completeTaskQuick(${t.id}).then(() => showClientDetail(${state.selectedClientId}))"><i class="bx bx-check"></i></button>
        </div>`;
    });
  }
}

// --- 3. CONTACTS CONTROLLER ---
async function loadContacts() {
  const clientId = DOM.contactFilterClient.value;
  let url = '/api/contacts?';
  if (clientId) url += `client_id=${clientId}&`;
  
  const contacts = await apiRequest(url);
  if (!contacts) return;
  
  state.contacts = contacts;
  
  DOM.contactsTableBody.innerHTML = '';
  if (contacts.length === 0) {
    DOM.contactsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">Ningún contacto registrado.</td></tr>`;
  } else {
    contacts.forEach(c => {
      const client = state.clients.find(cl => cl.id === c.client_id) || { razon_social: '-' };
      DOM.contactsTableBody.innerHTML += `
        <tr>
          <td style="font-weight: 600;">${c.nombre} ${c.apellidos}</td>
          <td>${client.razon_social}</td>
          <td>${c.cargo || '-'}</td>
          <td><span class="badge" style="font-size: 11px;">${c.nivel_decision}</span></td>
          <td>${c.movil ? `<a href="tel:${c.movil}"><i class="bx bx-phone"></i> ${c.movil}</a>` : '-'}</td>
          <td>${c.email ? `<a href="mailto:${c.email}"><i class="bx bx-envelope"></i> ${c.email}</a>` : '-'}</td>
          <td>${c.linkedin ? `<a href="${c.linkedin}" target="_blank"><i class="bx bxl-linkedin-square" style="font-size: 20px;"></i></a>` : '-'}</td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="editContact(${c.id}, event)"><i class="bx bx-edit"></i></button>
            <button class="btn btn-sm btn-outline btn-danger" onclick="deleteContact(${c.id}, event)"><i class="bx bx-trash"></i></button>
          </td>
        </tr>`;
    });
  }
}

function editContact(contactId, event) {
  if (event) event.stopPropagation();
  const c = state.contacts.find(con => con.id === contactId);
  if (!c) return;
  
  document.getElementById('modal-contact-title').innerText = "Editar Contacto";
  document.getElementById('contact-form-id').value = c.id;
  document.getElementById('contact-client').value = c.client_id;
  document.getElementById('contact-nombre').value = c.nombre;
  document.getElementById('contact-apellidos').value = c.apellidos;
  document.getElementById('contact-email').value = c.email || '';
  document.getElementById('contact-movil').value = c.movil || '';
  document.getElementById('contact-linkedin').value = c.linkedin || '';
  document.getElementById('contact-cargo').value = c.cargo || '';
  document.getElementById('contact-decision').value = c.nivel_decision;
  document.getElementById('contact-notas').value = c.notas_personales || '';
  
  DOM.modalContact.showModal();
}

async function deleteContact(contactId, event) {
  if (event) event.stopPropagation();
  if (!confirm('¿Seguro que deseas eliminar este contacto?')) return;
  
  const success = await apiRequest(`/api/contacts/${contactId}`, { method: 'DELETE' });
  if (success) {
    loadContacts();
  }
}

// --- 4. VISITS CONTROLLER & VOICE DICTATION ---
async function loadVisits() {
  const clientId = DOM.visitFilterClient.value;
  let url = '/api/visits?';
  if (clientId) url += `client_id=${clientId}&`;
  
  let visits = await apiRequest(url);
  if (!visits) return;
  
  const filterMonth = DOM.visitFilterMonth ? DOM.visitFilterMonth.value : '';
  const filterYear = DOM.visitFilterYear ? DOM.visitFilterYear.value : '';
  
  if (filterMonth || filterYear) {
    visits = visits.filter(v => {
      if (!v.fecha) return false;
      const parts = v.fecha.split('-'); // [YYYY, MM, DD]
      if (parts.length < 2) return false;
      
      let matchesYear = true;
      let matchesMonth = true;
      
      if (filterYear && parts[0] !== filterYear) matchesYear = false;
      if (filterMonth && parts[1] !== filterMonth) matchesMonth = false;
      
      return matchesYear && matchesMonth;
    });
  }
  
  state.visits = visits;
  
  DOM.visitsTimeline.innerHTML = '';
  if (visits.length === 0) {
    DOM.visitsTimeline.innerHTML = `
      <div class="empty-state">
        <i class="bx bx-calendar-x"></i>
        <p>No hay visitas registradas para mostrar.</p>
      </div>`;
  } else {
    visits.forEach(v => {
      const client = state.clients.find(c => c.id === v.client_id) || { razon_social: 'Empresa' };
      
      // Build attendees icons or text
      let attendeesHtml = '';
      if (v.attendees && v.attendees.length > 0) {
        v.attendees.forEach(att => {
          const initials = `${att.nombre[0] || ''}${att.apellidos[0] || ''}`.toUpperCase();
          attendeesHtml += `<div class="attendee-avatar-icon" title="${att.nombre} ${att.apellidos}">${initials}</div>`;
        });
      } else {
        attendeesHtml = '<span class="text-muted text-sm">Sin asistentes</span>';
      }
      
      // Build attachments html
      let attachHtml = '';
      if (v.attachments && v.attachments.length > 0) {
        v.attachments.forEach(attach => {
          attachHtml += `
            <a href="${attach.file_path}" target="_blank" class="visit-attachment-pill">
              <i class="bx bx-file"></i> ${attach.file_name}
            </a>`;
        });
      }
      
      DOM.visitsTimeline.innerHTML += `
        <div class="timeline-item">
          <div class="timeline-header">
            <div>
              <span class="timeline-company-title">${client.razon_social}</span>
              <div class="timeline-meta" style="margin-top: 6px;">
                <span class="timeline-meta-span"><i class="bx bx-calendar"></i> ${formatDate(v.fecha)}</span>
                <span class="timeline-meta-span"><i class="bx bx-time"></i> ${v.hora} (${v.duracion} min)</span>
                <span class="timeline-meta-span"><i class="bx bx-devices"></i> ${v.tipo_visita}</span>
                ${v.acompanantes_internos ? `<span class="timeline-meta-span"><i class="bx bx-group"></i> Acompañantes: ${v.acompanantes_internos}</span>` : ''}
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-outline" onclick="editVisit(${v.id})"><i class="bx bx-edit"></i></button>
              <button class="btn btn-sm btn-outline btn-danger" onclick="deleteVisit(${v.id})"><i class="bx bx-trash"></i></button>
            </div>
          </div>
          <div class="timeline-body">
            ${v.objetivo ? `
              <div class="minuta-section">
                <span class="minuta-label">Objetivo</span>
                <p class="minuta-text">${v.objetivo}</p>
              </div>` : ''}
            ${v.puntos_tratados ? `
              <div class="minuta-section">
                <span class="minuta-label">Puntos Tratados</span>
                <p class="minuta-text">${v.puntos_tratados}</p>
              </div>` : ''}
            ${v.conclusiones ? `
              <div class="minuta-section">
                <span class="minuta-label">Conclusiones / Resultados</span>
                <p class="minuta-text">${v.conclusiones}</p>
              </div>` : ''}
          </div>
          
          <div class="timeline-footer">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span class="minuta-label">Asistentes Cliente</span>
              <div class="attendees-avatars">${attendeesHtml}</div>
            </div>
            ${attachHtml ? `
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
              <span class="minuta-label">Documentos</span>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">${attachHtml}</div>
            </div>` : ''}
          </div>
        </div>`;
    });
  }
}

// Voice Dictation API Setup (Web Speech API)
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Este navegador no soporta Web Speech API para dictado por voz.');
    // Hide or disable voice buttons dynamically if not supported
    document.querySelectorAll('.btn-voice').forEach(btn => btn.style.display = 'none');
    return;
  }
  
  state.voiceRecognition = new SpeechRecognition();
  state.voiceRecognition.continuous = true;
  state.voiceRecognition.interimResults = false;
  state.voiceRecognition.lang = 'es-ES';
  
  state.voiceRecognition.onstart = () => {
    state.isRecording = true;
    const btn = document.querySelector(`.btn-voice[data-target="${state.activeRecordingField}"]`);
    if (btn) {
      btn.classList.add('recording');
      btn.innerHTML = '<i class="bx bx-stop-circle"></i> Grabando...';
    }
  };
  
  state.voiceRecognition.onend = () => {
    state.isRecording = false;
    const btn = document.querySelector(`.btn-voice[data-target="${state.activeRecordingField}"]`);
    if (btn) {
      btn.classList.remove('recording');
      btn.innerHTML = '<i class="bx bx-microphone"></i> Dictar';
    }
    state.activeRecordingField = null;
  };
  
  state.voiceRecognition.onresult = (event) => {
    const field = document.getElementById(state.activeRecordingField);
    if (!field) return;
    
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    
    if (finalTranscript) {
      // Append text with space
      const existing = field.value;
      field.value = existing ? `${existing} ${finalTranscript}` : finalTranscript;
      // Auto-trigger resize or input event
      field.dispatchEvent(new Event('input'));
    }
  };
  
  state.voiceRecognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    state.voiceRecognition.stop();
  };
}

function toggleVoiceDictation(targetId) {
  if (!state.voiceRecognition) return;
  
  if (state.isRecording) {
    state.voiceRecognition.stop();
    if (state.activeRecordingField !== targetId) {
      // If clicking another button, wait a bit and start it for the new one
      setTimeout(() => {
        state.activeRecordingField = targetId;
        state.voiceRecognition.start();
      }, 400);
    }
  } else {
    state.activeRecordingField = targetId;
    state.voiceRecognition.start();
  }
}

async function editVisit(visitId) {
  const v = state.visits.find(vis => vis.id === visitId);
  if (!v) return;
  
  document.getElementById('modal-visit-title').innerText = "Editar Visita / Acta";
  document.getElementById('visit-form-id').value = v.id;
  document.getElementById('visit-client').value = v.client_id;
  document.getElementById('visit-tipo').value = v.tipo_visita;
  document.getElementById('visit-fecha').value = v.fecha;
  document.getElementById('visit-hora').value = v.hora;
  document.getElementById('visit-duracion').value = v.duracion;
  document.getElementById('visit-acompanantes').value = v.acompanantes_internos || '';
  document.getElementById('visit-objetivo').value = v.objetivo || '';
  document.getElementById('visit-puntos').value = v.puntos_tratados || '';
  document.getElementById('visit-conclusiones').value = v.conclusiones || '';
  
  // Refresh checkboxes for attendees
  await populateVisitAttendeesCheckboxes(v.client_id);
  
  // Check the currently linked attendees
  if (v.attendees) {
    v.attendees.forEach(att => {
      const chk = document.querySelector(`.attendee-checkbox[value="${att.id}"]`);
      if (chk) chk.checked = true;
    });
  }
  
  // Render current attachments in edit modal
  renderModalAttachments(v.attachments, v.id);
  
  DOM.modalVisit.showModal();
}

function renderModalAttachments(attachments, visitId) {
  DOM.visitUploadedFiles.innerHTML = '';
  if (attachments && attachments.length > 0) {
    attachments.forEach(att => {
      DOM.visitUploadedFiles.innerHTML += `
        <div class="uploaded-file-item" id="attach-item-${att.id}">
          <span><i class="bx bx-file"></i> ${att.file_name}</span>
          <button type="button" onclick="deleteAttachmentLocal(${att.id})" title="Eliminar adjunto"><i class="bx bx-trash"></i></button>
        </div>`;
    });
  }
}

async function deleteAttachmentLocal(attachmentId) {
  if (!confirm('¿Seguro que deseas borrar este documento?')) return;
  const success = await apiRequest(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
  if (success) {
    const element = document.getElementById(`attach-item-${attachmentId}`);
    if (element) element.remove();
    // Reload main timeline
    if (state.activeTab === 'visits') loadVisits();
  }
}

async function deleteVisit(visitId) {
  if (!confirm('¿Seguro que deseas eliminar este registro de visita y su minuta?')) return;
  const success = await apiRequest(`/api/visits/${visitId}`, { method: 'DELETE' });
  if (success) {
    loadVisits();
  }
}

// Populate attendees checkboxes based on client select in Visit Form
async function populateVisitAttendeesCheckboxes(clientId) {
  if (!clientId) {
    DOM.visitAttendeesCheckboxes.innerHTML = '<p class="text-muted text-sm">Selecciona una empresa para cargar sus contactos...</p>';
    return;
  }
  
  const contacts = await apiRequest(`/api/contacts?client_id=${clientId}`);
  DOM.visitAttendeesCheckboxes.innerHTML = '';
  if (!contacts || contacts.length === 0) {
    DOM.visitAttendeesCheckboxes.innerHTML = '<p class="text-muted text-sm">Esta empresa no tiene contactos registrados. Añádelos en la sección Contactos.</p>';
  } else {
    contacts.forEach(c => {
      DOM.visitAttendeesCheckboxes.innerHTML += `
        <label class="checkbox-item">
          <input type="checkbox" class="attendee-checkbox" value="${c.id}">
          <span>${c.nombre} ${c.apellidos} (${c.cargo || 'Cargo no especificado'})</span>
        </label>`;
    });
  }
}

// --- 5. TASKS / ACTIONS CONTROLLER (Drag & Drop Kanban) ---
async function loadTasks() {
  const clientId = DOM.taskFilterClient.value;
  let url = '/api/tasks?';
  if (clientId) url += `client_id=${clientId}&`;
  
  const tasks = await apiRequest(url);
  if (!tasks) return;
  
  state.tasks = tasks;
  
  // Clear lists
  const containers = [DOM.tasksTodoList, DOM.tasksProgressList, DOM.tasksDoneList, DOM.tasksCancelledList];
  containers.forEach(c => c.innerHTML = '');
  
  let counts = { Pendiente: 0, 'En Progreso': 0, Completada: 0, Cancelada: 0 };
  
  tasks.forEach(t => {
    const client = state.clients.find(c => c.id === t.client_id) || { razon_social: 'Empresa' };
    const isOverdue = (t.estado === 'Pendiente' || t.estado === 'En Progreso') && new Date(t.fecha_limite) < new Date();
    
    const cardHtml = `
      <div class="kanban-card" draggable="true" id="task-card-${t.id}" ondragstart="handleTaskDragStart(event)" data-task-id="${t.id}">
        <span class="kanban-card-company">${client.razon_social}</span>
        <div class="kanban-card-title">${t.descripcion}</div>
        <div class="kanban-card-footer">
          <span class="kanban-date ${isOverdue ? 'date-overdue' : ''}">
            <i class="bx bx-calendar-alt"></i> ${formatDate(t.fecha_limite)}
          </span>
          <span class="priority-badge prio-${t.prioridad.toLowerCase()}">${t.prioridad}</span>
        </div>
        <div style="display:flex; gap: 8px; margin-top: 6px; justify-content: flex-end;">
          <button class="btn btn-sm btn-outline" style="padding: 2px 6px;" onclick="editTask(${t.id}, event)"><i class="bx bx-edit"></i></button>
          <button class="btn btn-sm btn-outline btn-danger" style="padding: 2px 6px;" onclick="deleteTask(${t.id}, event)"><i class="bx bx-trash"></i></button>
        </div>
      </div>`;
      
    if (t.estado === 'Pendiente') {
      DOM.tasksTodoList.innerHTML += cardHtml;
      counts.Pendiente++;
    } else if (t.estado === 'En Progreso') {
      DOM.tasksProgressList.innerHTML += cardHtml;
      counts['En Progreso']++;
    } else if (t.estado === 'Completada') {
      DOM.tasksDoneList.innerHTML += cardHtml;
      counts.Completada++;
    } else if (t.estado === 'Cancelada') {
      DOM.tasksCancelledList.innerHTML += cardHtml;
      counts.Cancelada++;
    }
  });
  
  // Set count badges
  DOM.countTodo.innerText = counts.Pendiente;
  DOM.countProgress.innerText = counts['En Progreso'];
  DOM.countDone.innerText = counts.Completada;
  DOM.countCancelled.innerText = counts.Cancelada;
  
  setupKanbanDragAndDrop();
}

function editTask(taskId, event) {
  if (event) event.stopPropagation();
  const t = state.tasks.find(tk => tk.id === taskId);
  if (!t) return;
  
  document.getElementById('modal-task-title').innerText = "Editar Acción Pendiente";
  document.getElementById('task-form-id').value = t.id;
  document.getElementById('task-client-select').value = t.client_id;
  document.getElementById('task-desc').value = t.descripcion;
  document.getElementById('task-limite').value = t.fecha_limite;
  document.getElementById('task-prioridad').value = t.prioridad;
  document.getElementById('task-estado').value = t.estado;
  
  populateTaskVisitSelect(t.client_id, t.visit_id);
  
  DOM.modalTask.showModal();
}

async function deleteTask(taskId, event) {
  if (event) event.stopPropagation();
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;
  
  const success = await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
  if (success) {
    loadTasks();
  }
}

// Kanban Drag and Drop Logic
let draggedTaskId = null;

function handleTaskDragStart(event) {
  draggedTaskId = event.target.getAttribute('data-task-id');
  event.dataTransfer.setData('text/plain', draggedTaskId);
  event.target.classList.add('dragging');
}

function setupKanbanDragAndDrop() {
  const containers = document.querySelectorAll('.kanban-cards-container');
  containers.forEach(container => {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      container.classList.add('drag-over');
    });
    
    container.addEventListener('dragleave', () => {
      container.classList.remove('drag-over');
    });
    
    container.addEventListener('drop', async (e) => {
      e.preventDefault();
      container.classList.remove('drag-over');
      
      const id = e.dataTransfer.getData('text/plain');
      const draggingCard = document.getElementById(`task-card-${id}`);
      if (!draggingCard) return;
      
      draggingCard.classList.remove('dragging');
      
      // Determine new state based on container id
      let newState = 'Pendiente';
      if (container.id === 'tasks-progress-list') newState = 'En Progreso';
      else if (container.id === 'tasks-done-list') newState = 'Completada';
      else if (container.id === 'tasks-cancelled-list') newState = 'Cancelada';
      
      // Update state via PUT
      const res = await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newState })
      });
      
      if (res) {
        loadTasks(); // Reload full board
      }
    });
  });
}

// Populate visit origins for task modal based on selected client
async function populateTaskVisitSelect(clientId, activeVisitId = null) {
  const select = document.getElementById('task-visit-select');
  select.innerHTML = '<option value="">Ninguna visita (Sin origen)</option>';
  if (!clientId) return;
  
  const visits = await apiRequest(`/api/visits?client_id=${clientId}`);
  if (visits) {
    visits.forEach(v => {
      select.innerHTML += `<option value="${v.id}">${formatDate(v.fecha)} - ${v.tipo_visita} (${v.objetivo ? v.objetivo.substring(0,25) + '...' : 'Sin objetivo'})</option>`;
    });
  }
  if (activeVisitId) {
    select.value = activeVisitId;
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Sidebar Tabs Navigation
  DOM.navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Quick Register Visit header button
  if (DOM.btnQuickVisit) {
    DOM.btnQuickVisit.addEventListener('click', () => openVisitModal());
  }
  const btnQuickVisitMobile = document.getElementById('btn-quick-visit-mobile');
  if (btnQuickVisitMobile) {
    btnQuickVisitMobile.addEventListener('click', () => openVisitModal());
  }
  
  // Theme toggle
  DOM.themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      DOM.themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      DOM.themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
    }
  });

  // Global search input
  DOM.globalSearch.addEventListener('input', (e) => {
    const term = e.target.value;
    // Route search to appropriate active tab
    if (state.activeTab === 'clients') {
      DOM.clientSearch.value = term;
      loadClients();
    } else if (state.activeTab === 'contacts') {
      loadContacts(); // can do filtering locally or expand endpoints
    } else if (state.activeTab === 'dashboard') {
      // Do nothing or filter dashboard lists
    }
  });
  
  // Filter listeners
  DOM.clientSearch.addEventListener('input', loadClients);
  DOM.clientFilterSector.addEventListener('change', loadClients);
  DOM.clientFilterTipo.addEventListener('change', loadClients);
  DOM.clientFilterSociedad.addEventListener('change', loadClients);
  
  DOM.contactFilterClient.addEventListener('change', loadContacts);
  if (DOM.visitFilterClient) DOM.visitFilterClient.addEventListener('change', loadVisits);
  if (DOM.visitFilterMonth) DOM.visitFilterMonth.addEventListener('change', loadVisits);
  if (DOM.visitFilterYear) DOM.visitFilterYear.addEventListener('change', loadVisits);
  DOM.taskFilterClient.addEventListener('change', loadTasks);
  
  DOM.monthlyTargetInput.addEventListener('change', loadDashboard);
  
  // Cascade panel detail tabs
  DOM.detailTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-detail-tab');
      DOM.detailTabButtons.forEach(b => b.classList.remove('active'));
      DOM.detailTabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`detail-tab-${tabName}`).classList.add('active');
    });
  });
  
  DOM.closeDetailPanel.addEventListener('click', () => {
    if (state.isFullscreenDetail) {
      window.close();
    } else {
      DOM.clientDetailPanel.setAttribute('hidden', '');
      state.selectedClientId = null;
      state.selectedClientDetail = null;
    }
  });
  
  // Dialog cancel/close triggers
  document.querySelectorAll('dialog [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('dialog').close();
    });
  });

  // Client triggers
  DOM.btnAddClient.addEventListener('click', () => {
    document.getElementById('modal-client-title').innerText = "Añadir Cliente";
    DOM.formClient.reset();
    document.getElementById('client-form-id').value = '';
    document.getElementById('client-comercial-select').value = '';
    document.getElementById('client-sumelga-val').value = '';
    document.getElementById('client-sociedad').value = 'Sumelga';
    document.getElementById('client-via').value = '';
    document.getElementById('client-direccion').value = '';
    document.getElementById('client-numero').value = '';
    document.getElementById('client-poblacion').value = '';
    document.getElementById('client-cp').value = '';
    DOM.modalClient.showModal();
  });
  
  DOM.btnEditClient.addEventListener('click', () => {
    if (!state.selectedClientId || !state.selectedClientDetail) return;
    const c = state.selectedClientDetail;
    
    document.getElementById('modal-client-title').innerText = "Editar Cliente";
    document.getElementById('client-form-id').value = c.id;
    document.getElementById('client-razon').value = c.razon_social;
    document.getElementById('client-cif-val').value = c.cif_nif || '';
    document.getElementById('client-sumelga-val').value = c.codigo_sumelga || '';
    document.getElementById('client-sociedad').value = c.sociedad || 'Sumelga';
    document.getElementById('client-telefono').value = c.telefono || '';
    document.getElementById('client-via').value = c.via || '';
    document.getElementById('client-direccion').value = c.direccion || '';
    document.getElementById('client-numero').value = c.numero || '';
    document.getElementById('client-poblacion').value = c.poblacion || '';
    document.getElementById('client-cp').value = c.codigo_postal || '';
    document.getElementById('client-web-val').value = c.web || '';
    document.getElementById('client-ventas').value = c.volumen_ventas || 0;
    document.getElementById('client-tipo').value = c.tipo_cliente;
    document.getElementById('client-sector-val').value = c.sector;
    document.getElementById('client-abc').value = c.clasificacion_abc;
    document.getElementById('client-comercial-select').value = c.comercial_id || '';
    
    DOM.modalClient.showModal();
  });
  
  DOM.btnDeleteClient.addEventListener('click', async () => {
    if (!state.selectedClientId) return;
    if (!confirm('¿Seguro que deseas eliminar este cliente? Se borrarán todos sus contactos, visitas y tareas asociadas en cascada.')) return;
    const success = await apiRequest(`/api/clients/${state.selectedClientId}`, { method: 'DELETE' });
    if (success) {
      if (state.isFullscreenDetail) {
        window.close();
      } else {
        DOM.clientDetailPanel.setAttribute('hidden', '');
        loadClients();
      }
    }
  });

  // Form Submissions
  DOM.formClient.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(DOM.formClient);
    const id = formData.get('id');
    const data = Object.fromEntries(formData.entries());
    delete data.id; // not part of request body for FastAPI schemas
    data.volumen_ventas = parseFloat(data.volumen_ventas) || 0.0;
    data.comercial_id = data.comercial_id ? parseInt(data.comercial_id) : null;
    
    let res;
    if (id) {
      // Edit mode
      res = await apiRequest(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Create mode
      res = await apiRequest('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    if (res) {
      DOM.modalClient.close();
      loadClients();
      if (id) showClientDetail(id); // Refresh detail panel if editing
    }
  });
  
  // Contacts triggers
  DOM.btnAddContact.addEventListener('click', () => {
    document.getElementById('modal-contact-title').innerText = "Añadir Contacto";
    DOM.formContact.reset();
    document.getElementById('contact-form-id').value = '';
    DOM.modalContact.showModal();
  });
  
  DOM.btnAddContactToClient.addEventListener('click', () => {
    document.getElementById('modal-contact-title').innerText = "Añadir Contacto";
    DOM.formContact.reset();
    document.getElementById('contact-form-id').value = '';
    // Pre-select client
    if (state.selectedClientId) {
      document.getElementById('contact-client').value = state.selectedClientId;
    }
    DOM.modalContact.showModal();
  });
  
  DOM.formContact.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(DOM.formContact);
    const id = formData.get('id');
    const data = Object.fromEntries(formData.entries());
    delete data.id;
    data.client_id = parseInt(data.client_id);
    
    let res;
    if (id) {
      res = await apiRequest(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      res = await apiRequest('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    if (res) {
      DOM.modalContact.close();
      if (state.activeTab === 'contacts') loadContacts();
      else if (state.selectedClientId) showClientDetail(state.selectedClientId);
    }
  });

  // Visits triggers
  DOM.btnAddVisit.addEventListener('click', () => {
    openVisitModal();
  });
  
  DOM.btnAddVisitToClient.addEventListener('click', () => {
    openVisitModal(state.selectedClientId);
  });
  
  async function openVisitModal(preSelectedClientId = null) {
    document.getElementById('modal-visit-title').innerText = "Registrar Visita o Acta";
    DOM.formVisit.reset();
    document.getElementById('visit-form-id').value = '';
    
    // Set default date & time to today & now
    const now = new Date();
    document.getElementById('visit-fecha').value = now.toISOString().substring(0, 10);
    
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('visit-hora').value = `${hours}:${minutes}`;
    
    state.currentUploads = [];
    DOM.visitUploadedFiles.innerHTML = '';
    
    if (preSelectedClientId) {
      const clientSelect = document.getElementById('visit-client');
      clientSelect.value = preSelectedClientId;
      await populateVisitAttendeesCheckboxes(preSelectedClientId);
    } else {
      DOM.visitAttendeesCheckboxes.innerHTML = '<p class="text-muted text-sm">Selecciona una empresa para cargar sus contactos...</p>';
    }
    
    DOM.modalVisit.showModal();
  }
  
  // Handle client selection in visit form to load contacts list
  document.getElementById('visit-client').addEventListener('change', (e) => {
    populateVisitAttendeesCheckboxes(e.target.value);
  });
  
  // Voice Dictation Buttons trigger
  document.querySelectorAll('.btn-voice').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      toggleVoiceDictation(target);
    });
  });
  
  // Visit Drag and Drop Document Upload triggers
  DOM.visitDropzone.addEventListener('click', () => DOM.visitFileInput.click());
  
  DOM.visitDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.visitDropzone.style.borderColor = 'var(--primary)';
    DOM.visitDropzone.style.backgroundColor = 'var(--primary-light)';
  });
  
  DOM.visitDropzone.addEventListener('dragleave', () => {
    DOM.visitDropzone.style.borderColor = 'var(--border-color)';
    DOM.visitDropzone.style.backgroundColor = 'transparent';
  });
  
  DOM.visitDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.visitDropzone.style.borderColor = 'var(--border-color)';
    DOM.visitDropzone.style.backgroundColor = 'transparent';
    
    const files = e.dataTransfer.files;
    addFilesToQueue(files);
  });
  
  DOM.visitFileInput.addEventListener('change', (e) => {
    addFilesToQueue(e.target.files);
  });
  
  function addFilesToQueue(files) {
    for (let file of files) {
      state.currentUploads.push(file);
      DOM.visitUploadedFiles.innerHTML += `
        <div class="uploaded-file-item">
          <span><i class="bx bx-file"></i> ${file.name} (en cola)</span>
          <button type="button" class="btn-remove-queued-file"><i class="bx bx-x"></i></button>
        </div>`;
    }
    
    // Bind remove button listeners
    document.querySelectorAll('.btn-remove-queued-file').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        state.currentUploads.splice(idx, 1);
        btn.closest('.uploaded-file-item').remove();
      });
    });
  }
  
  // Visit Form Submission
  DOM.formVisit.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(DOM.formVisit);
    const id = formData.get('id');
    const data = Object.fromEntries(formData.entries());
    delete data.id;
    
    data.client_id = parseInt(data.client_id);
    data.duracion = parseInt(data.duracion) || 60;
    
    // Get checked attendees
    const checked = [];
    document.querySelectorAll('.attendee-checkbox:checked').forEach(chk => {
      checked.push(parseInt(chk.value));
    });
    data.attendee_ids = checked;
    
    let res;
    if (id) {
      res = await apiRequest(`/api/visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      res = await apiRequest('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    if (res) {
      const visitId = res.id;
      
      // Upload pending files if any
      if (state.currentUploads.length > 0) {
        for (let file of state.currentUploads) {
          const fileData = new FormData();
          fileData.append('file', file);
          await fetch(`/api/visits/${visitId}/attachments`, {
            method: 'POST',
            body: fileData
          });
        }
      }
      
      DOM.modalVisit.close();
      if (state.activeTab === 'visits') loadVisits();
      
      if (state.activeTab === 'clients') {
        if (state.selectedClientDetail && state.selectedClientDetail.id === data.client_id) {
          showClientDetail(data.client_id);
        }
      }

      // Automatically open Task creation if checked
      const createTask = document.getElementById('visit-create-task').checked;
      if (createTask) {
        document.getElementById('task-form-id').value = '';
        DOM.formTask.reset();
        
        // Populate client and visit dropdowns
        document.getElementById('task-client-select').value = data.client_id;
        await populateTaskVisitSelect(data.client_id, visitId);
        
        // Pre-fill task data
        let title = `Seguimiento de visita ${data.tipo_visita || ''}`;
        if (data.objetivo) {
          title += `: ${data.objetivo.substring(0, 50)}`;
        }
        document.getElementById('task-desc').value = title;
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('task-limite').value = tomorrow.toISOString().substring(0, 10);
        
        DOM.modalTask.showModal();
      }
      
      if (state.activeTab === 'calendar') loadCalendar();
      else if (state.selectedClientId) showClientDetail(state.selectedClientId);
    }
  });

  // Tasks triggers
  DOM.btnAddTask.addEventListener('click', () => {
    openTaskModal();
  });
  
  DOM.btnAddTaskToClient.addEventListener('click', () => {
    openTaskModal(state.selectedClientId);
  });
  
  function openTaskModal(preSelectedClientId = null) {
    document.getElementById('modal-task-title').innerText = "Crear Acción Pendiente";
    DOM.formTask.reset();
    document.getElementById('task-form-id').value = '';
    
    // Default deadline: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('task-limite').value = tomorrow.toISOString().substring(0, 10);
    
    if (preSelectedClientId) {
      document.getElementById('task-client-select').value = preSelectedClientId;
      populateTaskVisitSelect(preSelectedClientId);
    } else {
      document.getElementById('task-visit-select').innerHTML = '<option value="">Ninguna visita</option>';
    }
    
    DOM.modalTask.showModal();
  }
  
  document.getElementById('task-client-select').addEventListener('change', (e) => {
    populateTaskVisitSelect(e.target.value);
  });
  
  DOM.formTask.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(DOM.formTask);
    const id = formData.get('id');
    const data = Object.fromEntries(formData.entries());
    delete data.id;
    
    data.client_id = parseInt(data.client_id);
    data.visit_id = data.visit_id ? parseInt(data.visit_id) : null;
    
    let res;
    if (id) {
      res = await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      res = await apiRequest('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    if (res) {
      DOM.modalTask.close();
      if (state.activeTab === 'tasks') loadTasks();
      else if (state.selectedClientId) showClientDetail(state.selectedClientId);
    }
  });

  // Calendar navigation controls
  if (DOM.calendarPrevMonth) {
    DOM.calendarPrevMonth.addEventListener('click', () => {
      state.currentCalendarMonth--;
      if (state.currentCalendarMonth < 0) {
        state.currentCalendarMonth = 11;
        state.currentCalendarYear--;
      }
      renderCalendar();
    });
  }
  
  if (DOM.calendarNextMonth) {
    DOM.calendarNextMonth.addEventListener('click', () => {
      state.currentCalendarMonth++;
      if (state.currentCalendarMonth > 11) {
        state.currentCalendarMonth = 0;
        state.currentCalendarYear++;
      }
      renderCalendar();
    });
  }
  
  if (DOM.calendarTodayBtn) {
    DOM.calendarTodayBtn.addEventListener('click', () => {
      state.currentCalendarMonth = new Date().getMonth();
      state.currentCalendarYear = new Date().getFullYear();
      renderCalendar();
    });
  }
  
  if (DOM.calendarBtnAddVisit) {
    DOM.calendarBtnAddVisit.addEventListener('click', () => {
      openVisitModal();
    });
  }

  // Session switcher change event with password verification interceptor
  if (DOM.sessionUserSelect) {
    DOM.sessionUserSelect.addEventListener('change', async (e) => {
      const selectedId = parseInt(e.target.value);
      const previousId = parseInt(localStorage.getItem('activeUserId'));

      if (selectedId === previousId) {
        return; // No change
      }

      const user = state.comerciales.find(u => u.id === selectedId);
      if (user) {
        openPasswordPrompt(user);
      } else {
        DOM.sessionUserSelect.value = previousId;
      }
    });
  }

  // Password prompt modal events
  if (DOM.btnCancelPassword) {
    DOM.btnCancelPassword.addEventListener('click', () => {
      DOM.modalPasswordPrompt.close();
    });
  }

  if (DOM.btnClosePasswordModal) {
    DOM.btnClosePasswordModal.addEventListener('click', () => {
      DOM.modalPasswordPrompt.close();
    });
  }

  if (DOM.btnConfirmPassword) {
    DOM.btnConfirmPassword.addEventListener('click', () => {
      verifySessionPassword();
    });
  }

  if (DOM.formPasswordPrompt) {
    DOM.formPasswordPrompt.addEventListener('submit', (e) => {
      e.preventDefault();
      verifySessionPassword();
    });
  }

  if (DOM.modalPasswordPrompt) {
    DOM.modalPasswordPrompt.addEventListener('close', () => {
      DOM.sessionPasswordInput.value = '';
      DOM.passwordErrorMsg.style.display = 'none';
      DOM.passwordErrorMsg.textContent = '';
      DOM.sessionPasswordInput.classList.remove('shake-input');

      // Revert dropdown selector if the session wasn't actually changed
      const currentActiveId = localStorage.getItem('activeUserId');
      if (DOM.sessionUserSelect && String(DOM.sessionUserSelect.value) !== String(currentActiveId)) {
        DOM.sessionUserSelect.value = currentActiveId;
      }
    });
  }

  // Comerciales triggers
  if (DOM.btnAddComercial) {
    DOM.btnAddComercial.addEventListener('click', () => {
      document.getElementById('modal-comercial-title').innerText = "Registrar Comercial";
      DOM.formComercial.reset();
      document.getElementById('comercial-form-id').value = '';
      DOM.modalComercial.showModal();
    });
  }

  if (DOM.formComercial) {
    DOM.formComercial.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(DOM.formComercial);
      const id = formData.get('id');
      const data = Object.fromEntries(formData.entries());
      delete data.id;
      if (!data.password) {
        delete data.password;
      }
      data.is_active = data.is_active === 'true';

      let res;
      if (id) {
        res = await apiRequest(`/api/comerciales/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await apiRequest('/api/comerciales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (res) {
        DOM.modalComercial.close();
        // Refresh session switcher dropdown to reflect any name or new user changes
        await initSessionSwitcher();
        if (state.activeTab === 'comerciales') {
          loadComerciales();
        }
      }
    });
  }

  if (DOM.btnExportOffersExcel) {
    DOM.btnExportOffersExcel.addEventListener('click', () => {
      if (state.selectedClientDetail && state.selectedClientDetail.offers) {
        exportOffersToCSV(state.selectedClientDetail.offers, state.selectedClientDetail.razon_social);
      }
    });
  }

  if (DOM.btnExportOffersPdf) {
    DOM.btnExportOffersPdf.addEventListener('click', () => {
      if (state.selectedClientDetail && state.selectedClientDetail.offers) {
        exportOffersToPDF(state.selectedClientDetail.offers, state.selectedClientDetail.razon_social);
      }
    });
  }

  // Navigation button listeners inside the Ficha General summary tab
  const btnGotoOffers = document.getElementById('btn-goto-offers');
  const btnGotoVisits = document.getElementById('btn-goto-visits');
  const btnGotoTasks = document.getElementById('btn-goto-tasks');

  if (btnGotoOffers) {
    btnGotoOffers.addEventListener('click', () => {
      const tabBtn = Array.from(DOM.detailTabButtons).find(b => b.getAttribute('data-detail-tab') === 'offers');
      if (tabBtn) tabBtn.click();
    });
  }
  if (btnGotoVisits) {
    btnGotoVisits.addEventListener('click', () => {
      const tabBtn = Array.from(DOM.detailTabButtons).find(b => b.getAttribute('data-detail-tab') === 'visits');
      if (tabBtn) tabBtn.click();
    });
  }
  if (btnGotoTasks) {
    btnGotoTasks.addEventListener('click', () => {
      const tabBtn = Array.from(DOM.detailTabButtons).find(b => b.getAttribute('data-detail-tab') === 'tasks');
      if (tabBtn) tabBtn.click();
    });
  }
}

// --- Offers Export Helpers ---
function exportOffersToCSV(offers, clientName) {
  // ── KPIs ──────────────────────────────────────────────────────────
  const totalOfertas = offers.length;
  const abiertas     = offers.filter(o => o.situacion !== 'C').length;
  const cerradas     = offers.filter(o => o.situacion === 'C').length;
  const valorTotal   = offers.reduce((sum, o) => sum + (o.total || 0), 0);
  const valorAbierto = offers.filter(o => o.situacion !== 'C').reduce((sum, o) => sum + (o.total || 0), 0);
  const valorCerrado = offers.filter(o => o.situacion === 'C').reduce((sum, o) => sum + (o.total || 0), 0);

  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // Helper: escapa un valor para CSV (quoted)
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  // ── Bloque de cabecera (filas de resumen) ─────────────────────────
  const summaryRows = [
    [q('LISTADO DE OFERTAS'),    q(clientName),                '',                     '',                          '',          ''],
    [q('Generado el'),           q(today),                     '',                     '',                          '',          ''],
    ['', '', '', '', '', ''],   // fila vacía separadora
    [q('RESUMEN'),               q('Total Ofertas'),            q('En Curso'),          q('Cerradas'),               q('Valor Total Ofertado'), q('Valor En Curso')],
    [q(''),                      q(totalOfertas),               q(abiertas),            q(cerradas),                 q(valorTotal.toFixed(2)), q(valorAbierto.toFixed(2))],
    ['', '', '', '', '', ''],   // fila vacía separadora antes de la tabla
  ];

  // ── Tabla de datos ────────────────────────────────────────────────
  const headers = ['Nº Oferta', 'Referencia', 'Descripción', 'Fecha Creación', 'Estado', 'Total Importe (€)'];
  const dataRows = offers.map(o => [
    o.numero_oferta,
    o.referencia  || '',
    o.descripcion || '',
    o.fecha_creacion || '',
    o.situacion === 'C' ? 'Cerrada' : 'En Curso',
    o.total != null ? o.total.toFixed(2) : '0.00'
  ]);

  // ── Fila de totales al final ──────────────────────────────────────
  const totalRow = [q(''), q(''), q(''), q(''), q('TOTAL'), q(valorTotal.toFixed(2))];

  // ── Unir todo ─────────────────────────────────────────────────────
  const allRows = [
    ...summaryRows.map(r => r.join(';')),
    headers.map(h => q(h)).join(';'),
    ...dataRows.map(r => r.map(v => q(v)).join(';')),
    totalRow.join(';'),
  ];

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + allRows.join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Ofertas_${clientName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportOffersToPDF(offers, clientName) {
  if (typeof html2pdf === 'undefined') {
    alert("Cargando el generador de PDF, por favor intenta en unos segundos.");
    return;
  }

  // ── Calcular KPIs ────────────────────────────────────────────────
  const totalOfertas  = offers.length;
  const abiertas      = offers.filter(o => o.situacion !== 'C').length;
  const cerradas      = offers.filter(o => o.situacion === 'C').length;
  const valorTotal    = offers.reduce((sum, o) => sum + (o.total || 0), 0);
  const valorAbierto  = offers.filter(o => o.situacion !== 'C').reduce((sum, o) => sum + (o.total || 0), 0);
  const valorCerrado  = offers.filter(o => o.situacion === 'C').reduce((sum, o)  => sum + (o.total || 0), 0);

  const fmtEur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const today  = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Filas de la tabla ────────────────────────────────────────────
  const rowsHtml = offers.map((o, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
      <td>${o.numero_oferta}</td>
      <td>${o.referencia || '-'}</td>
      <td>${o.descripcion || '-'}</td>
      <td style="white-space:nowrap;">${o.fecha_creacion ? formatDate(o.fecha_creacion) : '-'}</td>
      <td style="text-align:center;">
        <span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;
              background:${o.situacion === 'C' ? '#dcfce7' : '#fef9c3'};
              color:${o.situacion === 'C' ? '#166534' : '#854d0e'};">
          ${o.situacion === 'C' ? 'Cerrada' : 'En Curso'}
        </span>
      </td>
      <td style="text-align:right;font-weight:600;">${formatMoney(o.total)}</td>
    </tr>
  `).join('');

  const html = `
    <div id="pdf-export-wrapper" style="font-family: 'Segoe UI', Arial, sans-serif; color: #334155; background: #fff; width: 100%;">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pdf-export-wrapper { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; background: #fff; }

        /* ── Header ── */
        .pdf-header {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 28px 32px 24px;
        }
        .pdf-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }
        .pdf-title   { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .pdf-client  { font-size: 14px; opacity: 0.75; margin-top: 4px; }
        .pdf-date    { font-size: 11px; opacity: 0.55; text-align: right; margin-top: 4px; }

        /* ── KPI Cards ── */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        .kpi-card {
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          padding: 10px 14px;
          text-align: center;
        }
        .kpi-card.accent-green  { background: rgba(34,197,94,0.18);  border-color: rgba(34,197,94,0.35); }
        .kpi-card.accent-amber  { background: rgba(251,191,36,0.18); border-color: rgba(251,191,36,0.35); }
        .kpi-card.accent-blue   { background: rgba(99,179,237,0.18); border-color: rgba(99,179,237,0.35); }
        .kpi-val   { font-size: 20px; font-weight: 800; color: #fff; display: block; line-height: 1.1; }
        .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; opacity: 0.65; color: #fff; margin-top: 3px; }

        /* ── Divider ── */
        .pdf-divider { height: 4px; background: linear-gradient(90deg, #6366f1, #a78bfa, #38bdf8); }

        /* ── Table ── */
        .pdf-body { padding: 20px 32px 32px; }
        .section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .8px; color: #6366f1; margin-bottom: 10px;
          padding-bottom: 6px; border-bottom: 2px solid #e2e8f0;
        }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead th {
          background: #f1f5f9; padding: 9px 10px; text-align: left;
          font-weight: 700; color: #334155; font-size: 11px;
          border-bottom: 2px solid #cbd5e1;
        }
        tbody td { padding: 8px 10px; color: #475569; border-bottom: 1px solid #f1f5f9; }
        tfoot td {
          padding: 10px 10px; font-weight: 700; color: #1e293b;
          background: #f8fafc; border-top: 2px solid #cbd5e1; font-size: 13px;
        }

        /* ── Footer ── */
        .pdf-footer {
          margin-top: 28px; font-size: 10px; color: #94a3b8;
          text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;
        }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-header { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>

      <!-- CABECERA -->
      <div class="pdf-header">
        <div class="pdf-header-top">
          <div>
            <div class="pdf-title">Listado de Ofertas</div>
            <div class="pdf-client">${clientName}</div>
          </div>
          <div class="pdf-date">Generado el ${today}</div>
        </div>

        <!-- KPI CARDS -->
        <div class="kpi-row">
          <div class="kpi-card">
            <span class="kpi-val">${totalOfertas}</span>
            <div class="kpi-label">Total Ofertas</div>
          </div>
          <div class="kpi-card accent-amber">
            <span class="kpi-val">${abiertas}</span>
            <div class="kpi-label">En Curso</div>
          </div>
          <div class="kpi-card accent-green">
            <span class="kpi-val">${cerradas}</span>
            <div class="kpi-label">Cerradas</div>
          </div>
          <div class="kpi-card accent-blue" style="grid-column:span 3;">
            <span class="kpi-val" style="font-size:17px;">${fmtEur(valorTotal)}</span>
            <div class="kpi-label">Valor Total Ofertado</div>
          </div>
        </div>
      </div>

      <!-- GRADIENTE SEPARADOR -->
      <div class="pdf-divider"></div>

      <!-- CUERPO -->
      <div class="pdf-body">
        <div class="section-title">Detalle de Ofertas</div>
        <table>
          <thead>
            <tr>
              <th>Nº Oferta</th>
              <th>Referencia</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th style="text-align:center;">Estado</th>
              <th style="text-align:right;">Total (€)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4"></td>
              <td style="text-align:right; color:#64748b; font-size:11px;">
                En Curso: ${fmtEur(valorAbierto)} &nbsp;|&nbsp; Cerradas: ${fmtEur(valorCerrado)}
              </td>
              <td style="text-align:right;">${fmtEur(valorTotal)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="pdf-footer">
          CRM Sumelga &nbsp;·&nbsp; ${clientName} &nbsp;·&nbsp; ${totalOfertas} ofertas &nbsp;·&nbsp; ${today}
        </div>
      </div>
    </div>
  `;

  const opt = {
    margin:       0,
    filename:     `Ofertas_${clientName.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  const element = document.createElement('div');
  element.innerHTML = html.trim();
  
  if (DOM.btnExportOffersPdf) {
    DOM.btnExportOffersPdf.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Generando...';
    DOM.btnExportOffersPdf.disabled = true;
  }

  html2pdf().set(opt).from(element.firstElementChild).outputPdf('blob').then(function (pdfBlob) {
    if (DOM.btnExportOffersPdf) {
      DOM.btnExportOffersPdf.innerHTML = '<i class="bx bxs-file-pdf"></i> PDF';
      DOM.btnExportOffersPdf.disabled = false;
    }
    
    const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
    
    // Web Share API (Nativo para iOS/Android: permite Enviar por Correo, Guardar en Archivos, WhatsApp...)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: opt.filename,
        files: [file]
      }).catch(err => console.log('Cancelado o error compartiendo:', err));
    } else {
      // Fallback normal para PC o si no soporta share: descarga el PDF directo
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = opt.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    }
  });
}

// --- Visual Helpers / Parsers ---
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatMoney(amount) {
  if (amount == null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function getActionBadgeClass(status) {
  if (!status) return 'badge-info';
  const s = status.toLowerCase();
  if (s.includes('pendiente')) return 'badge-warning';
  if (s.includes('progreso')) return 'badge-primary';
  if (s.includes('completada')) return 'badge-success';
  if (s.includes('cancelada')) return 'badge-danger';
  return 'badge-info';
}

// --- 6. CALENDAR CONTROLLER ---
async function loadCalendar() {
  const visits = await apiRequest('/api/visits');
  if (visits) {
    state.visits = visits;
  }
  renderCalendar();
}

function renderCalendar() {
  if (!DOM.calendarMonthYear || !DOM.calendarDaysGrid) return;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  DOM.calendarMonthYear.innerText = `${monthNames[state.currentCalendarMonth]} ${state.currentCalendarYear}`;
  DOM.calendarDaysGrid.innerHTML = '';
  
  // Calculate first day index (JS Sun=0, Mon=1, ..., Sat=6)
  const firstDayIndex = new Date(state.currentCalendarYear, state.currentCalendarMonth, 1).getDay();
  // Convert to Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  
  const totalDays = new Date(state.currentCalendarYear, state.currentCalendarMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(state.currentCalendarYear, state.currentCalendarMonth, 0).getDate();
  
  // 1. Render last month's adjacent cells
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const prevMonth = state.currentCalendarMonth === 0 ? 11 : state.currentCalendarMonth - 1;
    const prevYear = state.currentCalendarMonth === 0 ? state.currentCalendarYear - 1 : state.currentCalendarYear;
    renderDayCell(day, prevMonth, prevYear, true);
  }
  
  // 2. Render current month's cells
  for (let day = 1; day <= totalDays; day++) {
    renderDayCell(day, state.currentCalendarMonth, state.currentCalendarYear, false);
  }
  
  // 3. Render next month's adjacent cells to fill the grid
  const totalCellsUsed = startDay + totalDays;
  const remainingCells = totalCellsUsed % 7 === 0 ? 0 : 7 - (totalCellsUsed % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = state.currentCalendarMonth === 11 ? 0 : state.currentCalendarMonth + 1;
    const nextYear = state.currentCalendarMonth === 11 ? state.currentCalendarYear + 1 : state.currentCalendarYear;
    renderDayCell(day, nextMonth, nextYear, true);
  }
}

function renderDayCell(day, month, year, isAdjacent) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const today = new Date();
  const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  
  const dayVisits = state.visits.filter(v => v.fecha === dateStr);
  
  let eventsHtml = '';
  if (dayVisits.length > 0) {
    dayVisits.forEach(v => {
      const client = state.clients.find(c => c.id === v.client_id) || { razon_social: 'Empresa' };
      const eventClass = getEventClass(v.tipo_visita);
      eventsHtml += `
        <div class="calendar-event-pill ${eventClass}" onclick="handleCalendarEventClick(${v.id}, event)" title="${v.hora} - ${client.razon_social} (${v.objetivo || 'Sin objetivo'})">
          <i class="bx ${v.tipo_visita === 'Telefónica' ? 'bx-phone' : (v.tipo_visita === 'Teams/Zoom' ? 'bx-laptop' : 'bx-map-pin')}"></i>
          <span style="font-weight:700; margin-right:2px;">${v.hora}</span> ${client.razon_social}
        </div>`;
    });
  }
  
  const cellHtml = `
    <div class="calendar-day-cell ${isToday ? 'day-today' : ''} ${isAdjacent ? 'day-adjacent-month' : ''}" data-date="${dateStr}" onclick="handleCalendarDayClick('${dateStr}', event)">
      <span class="calendar-day-number">${day}</span>
      <div class="calendar-events-container">
        ${eventsHtml}
      </div>
    </div>`;
    
  DOM.calendarDaysGrid.innerHTML += cellHtml;
}

function getEventClass(tipo) {
  const t = tipo ? tipo.toLowerCase() : '';
  if (t.includes('teams') || t.includes('zoom')) return 'event-teams-zoom';
  if (t.includes('telef')) return 'event-telefonica';
  return 'event-presencial';
}

function handleCalendarEventClick(visitId, event) {
  event.stopPropagation();
  editVisit(visitId);
}

function handleCalendarDayClick(dateStr, event) {
  if (event.target.classList.contains('calendar-event-pill') || event.target.closest('.calendar-event-pill')) return;
  openVisitModalWithDate(dateStr);
}

async function openVisitModalWithDate(dateStr) {
  document.getElementById('modal-visit-title').innerText = "Registrar Visita o Acta";
  DOM.formVisit.reset();
  document.getElementById('visit-form-id').value = '';
  
  document.getElementById('visit-fecha').value = dateStr;
  
  const now = new Date();
  let hours = String(now.getHours()).padStart(2, '0');
  let minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('visit-hora').value = `${hours}:${minutes}`;
  
  state.currentUploads = [];
  DOM.visitUploadedFiles.innerHTML = '';
  
  DOM.visitAttendeesCheckboxes.innerHTML = '<p class="text-muted text-sm">Selecciona una empresa para cargar sus contactos...</p>';
  DOM.modalVisit.showModal();
}

function openPasswordPrompt(targetUser) {
  DOM.passwordPromptUserId.value = targetUser.id;
  DOM.passwordPromptUserName.textContent = `${targetUser.nombre} ${targetUser.apellidos}`;
  DOM.sessionPasswordInput.value = '';
  DOM.passwordErrorMsg.style.display = 'none';
  DOM.passwordErrorMsg.textContent = '';
  DOM.sessionPasswordInput.classList.remove('shake-input');
  
  DOM.modalPasswordPrompt.showModal();
  DOM.sessionPasswordInput.focus();
}

async function verifySessionPassword() {
  const pendingId = parseInt(DOM.passwordPromptUserId.value);
  const password = DOM.sessionPasswordInput.value;

  if (!password) {
    DOM.sessionPasswordInput.focus();
    return;
  }

  // Clear previous error states
  DOM.passwordErrorMsg.style.display = 'none';
  DOM.passwordErrorMsg.textContent = '';
  DOM.sessionPasswordInput.classList.remove('shake-input');

  try {
    const response = await fetch('/api/comerciales/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: pendingId,
        password: password
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Contraseña incorrecta');
    }

    const data = await response.json();
    if (data.status === 'ok') {
      // 1. Success! Update local storage
      localStorage.setItem('activeUserId', data.user.id);
      
      // 2. Update active user role
      onUserRoleChanged(data.user);
      
      // 3. Close the modal
      DOM.modalPasswordPrompt.close();
    }
  } catch (error) {
    // Show error message elegantly in modal
    DOM.passwordErrorMsg.textContent = error.message;
    DOM.passwordErrorMsg.style.display = 'block';

    // Micro-animation: shake input
    DOM.sessionPasswordInput.classList.add('shake-input');
    // Clear input password so they can type again
    DOM.sessionPasswordInput.value = '';
    DOM.sessionPasswordInput.focus();

    // Remove the shake class after animation completes so it can be re-triggered
    setTimeout(() => {
      DOM.sessionPasswordInput.classList.remove('shake-input');
    }, 400);
  }
}

// --- 7. COMERCIALES & PRIVILEGES (SESSION SWITCHER) ---
async function initSessionSwitcher() {
  const users = await apiRequest('/api/comerciales');
  if (!users) return;

  state.comerciales = users;

  // Populate session switcher dropdown
  if (DOM.sessionUserSelect) {
    const currentVal = localStorage.getItem('activeUserId') || DOM.sessionUserSelect.value;
    DOM.sessionUserSelect.innerHTML = '';
    users.forEach(u => {
      DOM.sessionUserSelect.innerHTML += `<option value="${u.id}">${u.role === 'Administrador' ? '👑' : '💼'} ${u.nombre} ${u.apellidos}</option>`;
    });

    let activeUser = users.find(u => String(u.id) === String(currentVal));
    if (!activeUser) {
      activeUser = users[0]; // Agustín Admin
    }

    DOM.sessionUserSelect.value = activeUser.id;
    localStorage.setItem('activeUserId', activeUser.id);
    onUserRoleChanged(activeUser);
  }
}

function onUserRoleChanged(user) {
  state.currentUser = user;

  // Enforce role body classes
  document.body.classList.remove('role-admin', 'role-comercial');
  const roleClass = user.role === 'Administrador' ? 'role-admin' : 'role-comercial';
  document.body.classList.add(roleClass);

  // Update profile footer info
  const avatarEl = document.getElementById('current-user-avatar');
  const nameEl = document.getElementById('current-user-name');
  const roleEl = document.getElementById('current-user-role');
  if (avatarEl) avatarEl.innerText = `${user.nombre[0] || ''}${user.apellidos[0] || ''}`.toUpperCase();
  if (nameEl) nameEl.innerText = `${user.nombre} ${user.apellidos}`;
  if (roleEl) roleEl.innerText = user.role;

  // Hide Comerciales tab if Comercial role is active
  const navComerciales = document.querySelector('.nav-item[data-tab="comerciales"]');
  if (navComerciales) {
    if (user.role === 'Administrador') {
      navComerciales.style.display = 'flex';
    } else {
      navComerciales.style.display = 'none';
      if (state.activeTab === 'comerciales') {
        switchTab('dashboard');
        return;
      }
    }
  }

  // Populate client-comercial-select dropdown inside Client form
  const clientComercialSelect = document.getElementById('client-comercial-select');
  if (clientComercialSelect) {
    clientComercialSelect.innerHTML = '<option value="">-- Sin asignar --</option>';
    state.comerciales.forEach(u => {
      clientComercialSelect.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellidos} (${u.role})</option>`;
    });
  }

  // Reload current view with the new user credentials and queries
  loadCurrentTab();
}

async function loadComerciales() {
  const users = await apiRequest('/api/comerciales');
  if (!users) return;

  state.comerciales = users;

  DOM.comercialesTableBody.innerHTML = '';
  users.forEach(u => {
    const isSelf = String(u.id) === String(state.currentUser.id);
    const deleteBtn = isSelf 
      ? `<button class="btn btn-sm btn-outline btn-danger" disabled title="No puedes eliminarte a ti mismo"><i class="bx bx-trash"></i></button>`
      : `<button class="btn btn-sm btn-outline btn-danger" onclick="deleteComercial(${u.id})"><i class="bx bx-trash"></i></button>`;
      
    DOM.comercialesTableBody.innerHTML += `
      <tr>
        <td style="font-weight: 600;">${u.nombre} ${u.apellidos}</td>
        <td>${u.username}</td>
        <td>${u.email || '-'}</td>
        <td><span class="badge ${u.role === 'Administrador' ? 'badge-danger' : ''}">${u.role}</span></td>
        <td style="text-align: center; font-weight: 600;">${u.clientes_asignados ?? 0}</td>
        <td><span class="badge-type type-${u.is_active ? 'activo' : 'inactivo'}">${u.is_active ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editComercial(${u.id})"><i class="bx bx-edit"></i></button>
          ${deleteBtn}
        </td>
      </tr>`;
  });
}

function editComercial(userId) {
  const u = state.comerciales.find(usr => usr.id === userId);
  if (!u) return;

  document.getElementById('modal-comercial-title').innerText = "Editar Comercial";
  document.getElementById('comercial-form-id').value = u.id;
  document.getElementById('comercial-username').value = u.username;
  document.getElementById('comercial-role').value = u.role;
  document.getElementById('comercial-nombre').value = u.nombre;
  document.getElementById('comercial-apellidos').value = u.apellidos;
  document.getElementById('comercial-email').value = u.email || '';
  document.getElementById('comercial-active').value = String(u.is_active);

  DOM.modalComercial.showModal();
}

async function deleteComercial(userId) {
  if (!confirm('¿Seguro que deseas eliminar este comercial? Sus clientes asignados quedarán sin comercial asignado para que puedas reasignarlos.')) return;

  const success = await apiRequest(`/api/comerciales/${userId}`, { method: 'DELETE' });
  if (success) {
    await initSessionSwitcher();
    if (state.activeTab === 'comerciales') {
      loadComerciales();
    }
  }
}

// ============================================================
//  CONFIGURACIÓN PAGE
// ============================================================

let configPageInitialized = false;

function initConfiguracionPage() {
  loadDiagnostics();
  if (configPageInitialized) return;
  configPageInitialized = true;
  setupOffersImport();
  setupOptimizeDb();
  setupSyncSales();

  // Inyecta el año en curso en el botón de sincronización de ventas
  const yearSpan = document.getElementById('sync-sales-year');
  if (yearSpan) yearSpan.textContent = `(${new Date().getFullYear()})`;

  document.getElementById('btn-refresh-diagnostics').addEventListener('click', loadDiagnostics);
}

// ── Diagnostics ─────────────────────────────────────────────
async function loadDiagnostics() {
  const body = document.getElementById('diagnostics-body');
  body.innerHTML = `<div class="diag-loading"><i class="bx bx-loader-alt bx-spin"></i> Cargando diagnósticos…</div>`;

  try {
    const data = await apiRequest('/api/admin/diagnostics');

    const intOk = data.database.integrity === 'ok';
    const fragPct = data.database.fragmentation_pct;
    const fragClass = fragPct < 5 ? 'ok' : fragPct < 15 ? 'warn' : 'bad';
    const fmt = (n) => new Intl.NumberFormat('es-ES').format(n);
    const fmtEur = (n) => new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);

    // Tables section
    const tableRows = Object.entries(data.tables).map(([t, c]) =>
      `<div class="diag-table-row">
        <span class="diag-table-name">${t}</span>
        <span class="diag-table-count">${fmt(c)}</span>
      </div>`
    ).join('');

    // Offers stats
    const offersHtml = Object.entries(data.offers_stats || {}).map(([soc, s]) => `
      <div style="margin-bottom:12px;">
        <div class="diag-table-row" style="font-weight:700; color:var(--text-primary);">${soc}</div>
        <div class="offers-stat-row">
          <div class="offers-stat-chip">
            <span class="chip-val">${fmt(s.total_ofertas)}</span>
            <span class="chip-label">Total</span>
          </div>
          <div class="offers-stat-chip">
            <span class="chip-val">${fmt(s.abiertas)}</span>
            <span class="chip-label">Abiertas</span>
          </div>
          <div class="offers-stat-chip">
            <span class="chip-val">${fmt(s.cerradas)}</span>
            <span class="chip-label">Cerradas</span>
          </div>
          <div class="offers-stat-chip" style="grid-column:span 3;">
            <span class="chip-val" style="font-size:14px;">${fmtEur(s.importe_total)}</span>
            <span class="chip-label">Importe Total</span>
          </div>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);font-size:13px;">Sin datos de ofertas.</p>';

    // Index count summary
    const idxTotal = data.indexes.total;

    body.innerHTML = `
      <!-- Server -->
      <div class="diag-section">
        <div class="diag-section-title">🖥️ Servidor</div>
        <div class="diag-grid">
          <div class="diag-item">
            <div class="diag-item-label">Python</div>
            <div class="diag-item-value">${data.server.python_version}</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Plataforma</div>
            <div class="diag-item-value">${data.server.platform}</div>
          </div>
          <div class="diag-item" style="grid-column:span 2;">
            <div class="diag-item-label">Timestamp</div>
            <div class="diag-item-value" style="font-size:12px;">${new Date(data.server.timestamp).toLocaleString('es-ES')}</div>
          </div>
        </div>
      </div>

      <!-- Database -->
      <div class="diag-section">
        <div class="diag-section-title">🗄️ Base de Datos</div>
        <div class="diag-grid">
          <div class="diag-item">
            <div class="diag-item-label">Tamaño</div>
            <div class="diag-item-value">${data.database.size_mb} MB</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Integridad</div>
            <div class="diag-item-value ${intOk ? 'ok' : 'bad'}">${data.database.integrity}</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Modo Journal</div>
            <div class="diag-item-value">${data.database.journal_mode.toUpperCase()}</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Fragmentación</div>
            <div class="diag-item-value ${fragClass}">${fragPct}%</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Páginas</div>
            <div class="diag-item-value">${fmt(data.database.page_count)}</div>
          </div>
          <div class="diag-item">
            <div class="diag-item-label">Tamaño Pág.</div>
            <div class="diag-item-value">${data.database.page_size} B</div>
          </div>
          <div class="diag-item" style="grid-column:span 2;">
            <div class="diag-item-label">Ruta</div>
            <div class="diag-item-value" style="font-size:11px;word-break:break-all;">${data.database.path}</div>
          </div>
        </div>
      </div>

      <!-- Table counts -->
      <div class="diag-section">
        <div class="diag-section-title">📊 Registros por Tabla</div>
        ${tableRows}
      </div>

      <!-- Indexes -->
      <div class="diag-section">
        <div class="diag-section-title">⚡ Índices de Rendimiento (${idxTotal} total)</div>
        <div class="diag-table-row">
          <span class="diag-table-name">Índices optimizados (idx_*)</span>
          <span class="diag-table-count">${data.indexes.list.filter(i => i.name.startsWith('idx_')).length}</span>
        </div>
        <div class="diag-table-row">
          <span class="diag-table-name">Índices ORM (ix_*)</span>
          <span class="diag-table-count">${data.indexes.list.filter(i => i.name.startsWith('ix_')).length}</span>
        </div>
        <div class="diag-table-row">
          <span class="diag-table-name">Índices automáticos SQLite</span>
          <span class="diag-table-count">${data.indexes.list.filter(i => i.name.startsWith('sqlite_')).length}</span>
        </div>
      </div>

      <!-- Offers stats -->
      <div class="diag-section">
        <div class="diag-section-title">📋 Estadísticas de Ofertas</div>
        ${offersHtml}
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div class="import-result error"><i class="bx bx-error-circle"></i> Error cargando diagnósticos: ${err.message}</div>`;
  }
}

// ── Import Offers ────────────────────────────────────────────
function setupOffersImport() {
  const zone = document.getElementById('upload-zone-offers');
  const fileInput = document.getElementById('input-offers-file');
  const btnImport = document.getElementById('btn-import-offers');
  let selectedFile = null;

  // Click to open file picker
  zone.addEventListener('click', () => fileInput.click());

  // Drag & drop
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) handleFileSelected(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFileSelected(e.target.files[0]);
  });

  function handleFileSelected(file) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      showToast('Por favor selecciona un fichero Excel (.xlsx o .xls)', 'error');
      return;
    }
    selectedFile = file;
    zone.classList.add('has-file');
    zone.querySelector('.upload-zone-label').textContent = '✅ Fichero seleccionado';
    // Show file name
    let nameEl = zone.querySelector('.file-name-display');
    if (!nameEl) {
      nameEl = document.createElement('p');
      nameEl.className = 'file-name-display';
      zone.appendChild(nameEl);
    }
    nameEl.textContent = file.name;
    btnImport.disabled = false;
  }

  btnImport.addEventListener('click', async () => {
    if (!selectedFile) return;

    const sociedad = document.getElementById('sel-import-sociedad').value;
    const replace  = document.getElementById('chk-replace-offers').checked;
    const progress = document.getElementById('import-offers-progress');
    const bar      = document.getElementById('import-progress-bar');
    const label    = document.getElementById('import-progress-label');
    const resultEl = document.getElementById('import-offers-result');

    // UI: start
    btnImport.disabled = true;
    progress.style.display = 'block';
    resultEl.style.display = 'none';
    bar.style.width = '20%';
    label.textContent = 'Subiendo fichero…';

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('sociedad', sociedad);
    formData.append('replace', replace ? 'true' : 'false');

    try {
      bar.style.width = '50%';
      label.textContent = 'Procesando Excel en el servidor…';

      const activeUserId = localStorage.getItem('activeUserId');
      const resp = await fetch('/api/admin/import-offers', {
        method: 'POST',
        headers: activeUserId ? { 'X-User-Id': activeUserId } : {},
        body: formData
      });

      bar.style.width = '90%';

      const json = await resp.json();

      bar.style.width = '100%';
      progress.style.display = 'none';

      if (!resp.ok) {
        resultEl.className = 'import-result error';
        resultEl.innerHTML = `<i class="bx bx-error-circle"></i> <strong>Error:</strong> ${json.detail || 'Error desconocido'}`;
      } else {
        const errorList = json.errors && json.errors.length
          ? `<br><small style="opacity:.7">Errores (${json.errors.length}): ${json.errors.slice(0,5).join(', ')}…</small>` : '';
        resultEl.className = 'import-result success';
        resultEl.innerHTML = `
          <i class="bx bx-check-circle"></i>
          <strong>Importación completada</strong><br>
          Sociedad: <strong>${json.sociedad}</strong> ·
          Eliminadas: <strong>${json.deleted}</strong> ·
          Importadas: <strong>${json.imported}</strong> ·
          Omitidas: <strong>${json.skipped}</strong>
          ${errorList}
        `;
        // Refresh diagnostics to reflect new counts
        loadDiagnostics();
      }
      resultEl.style.display = 'block';
    } catch (err) {
      progress.style.display = 'none';
      resultEl.className = 'import-result error';
      resultEl.innerHTML = `<i class="bx bx-error-circle"></i> Error de conexión: ${err.message}`;
      resultEl.style.display = 'block';
    } finally {
      btnImport.disabled = false;
    }
  });
}

// ── Optimize DB ──────────────────────────────────────────────
function setupOptimizeDb() {
  const btn = document.getElementById('btn-optimize-db');
  const resultEl = document.getElementById('optimize-result');

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Optimizando…';
    resultEl.style.display = 'none';

    try {
      const activeUserId = localStorage.getItem('activeUserId');
      const resp = await fetch('/api/admin/optimize-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(activeUserId ? { 'X-User-Id': activeUserId } : {}) }
      });
      const json = await resp.json();

      if (!resp.ok) {
        resultEl.className = 'import-result error';
        resultEl.innerHTML = `<i class="bx bx-error-circle"></i> ${json.detail || 'Error'}`;
      } else {
        resultEl.className = 'import-result success';
        resultEl.innerHTML = `<i class="bx bx-check-circle"></i> Optimización completada. ${json.indexes_applied} índices aplicados + ANALYZE + VACUUM.`;
        loadDiagnostics();
      }
      resultEl.style.display = 'block';
    } catch (err) {
      resultEl.className = 'import-result error';
      resultEl.innerHTML = `<i class="bx bx-error-circle"></i> ${err.message}`;
      resultEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-wrench"></i> Optimizar Base de Datos';
    }
  });
}

// ── Sync Sales from KPI ─────────────────────────────────────
function setupSyncSales() {
  const btn = document.getElementById('btn-sync-sales');
  const resultEl = document.getElementById('sync-sales-result');
  if (!btn || !resultEl) return;

  btn.addEventListener('click', async () => {
    if (!confirm('¿Sincronizar ventas y clasificación ABC del año en curso desde kpi_comercial.db?\n\nEsta operación actualizará volumen_ventas y clasificación ABC de los clientes existentes, y creará los clientes nuevos que aún no existan en el CRM.\n\nNo se modificarán contactos, visitas, tareas ni ofertas.')) {
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sincronizando…';
    resultEl.style.display = 'none';

    const fmt = (n) => new Intl.NumberFormat('es-ES').format(n);
    const fmtEur = (n) => new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n || 0);

    try {
      const activeUserId = localStorage.getItem('activeUserId');
      const dbPathInput = document.getElementById('sync-db-path');
      const payload = { db_path: dbPathInput ? dbPathInput.value : undefined };

      const resp = await fetch('/api/admin/sync-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(activeUserId ? { 'X-User-Id': activeUserId } : {}) },
        body: JSON.stringify(payload)
      });
      const json = await resp.json();

      if (!resp.ok) {
        resultEl.className = 'import-result error';
        resultEl.innerHTML = `<i class="bx bx-error-circle"></i> <strong>Error:</strong> ${json.detail || 'Error desconocido'}`;
      } else {
        const abc = json.abc_distribution || {};
        const chg = json.abc_changes || {};
        const totalChanges = Object.values(chg).reduce((a, b) => a + b, 0);

        resultEl.className = 'import-result success';
        resultEl.innerHTML = `
          <i class="bx bx-check-circle"></i>
          <strong>Sincronización completada</strong> — Año ${json.year} · ${json.duration_ms} ms<br>
          <div style="margin-top:8px; display:grid; grid-template-columns:repeat(2,1fr); gap:6px 16px; font-size:13px;">
            <div>📊 Clientes en ERP: <strong>${fmt(json.kpi_clients_total)}</strong></div>
            <div>✏️ Actualizados: <strong>${fmt(json.updated)}</strong></div>
            <div>➕ Creados: <strong>${fmt(json.created)}</strong></div>
            <div>⏭️ Sin cambios: <strong>${fmt(json.unchanged)}</strong></div>
            ${json.new_without_rep > 0 ? `<div>⚠️ Nuevos sin comercial: <strong>${fmt(json.new_without_rep)}</strong></div>` : ''}
          </div>
          <div style="margin-top:10px; font-size:13px;">
            <strong>Distribución ABC:</strong>
            🅰️ ${fmt(abc.A || 0)} ·
            🅱️ ${fmt(abc.B || 0)} ·
            ©️ ${fmt(abc.C || 0)}
            ${totalChanges > 0 ? ` · <strong>${totalChanges} cambios de clasificación</strong> (A→B ${chg.A_to_B||0}, B→A ${chg.B_to_A||0}, A→C ${chg.A_to_C||0}, C→A ${chg.C_to_A||0}, B→C ${chg.B_to_C||0}, C→B ${chg.C_to_B||0})` : ''}
          </div>
        `;
        // Refresca diagnósticos para que el contador de clientes en clients se actualice
        loadDiagnostics();
      }
      resultEl.style.display = 'block';
    } catch (err) {
      resultEl.className = 'import-result error';
      resultEl.innerHTML = `<i class="bx bx-error-circle"></i> Error de conexión: ${err.message}`;
      resultEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-refresh"></i> Sincronizar Ventas <span id="sync-sales-year">(' + new Date().getFullYear() + ')</span>';
    }
  });
}
