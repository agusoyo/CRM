from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ----------------- USER (COMERCIAL) SCHEMAS -----------------
class UserBase(BaseModel):
    username: str
    nombre: str
    apellidos: str
    email: Optional[str] = None
    role: Optional[str] = "Comercial"  # Administrador, Comercial
    is_active: Optional[bool] = True
    representante_codigo: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = "1234"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    representante_codigo: Optional[str] = None

class UserResponse(UserBase):
    id: int
    clientes_asignados: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- ATTACHMENT SCHEMAS -----------------
class VisitAttachmentBase(BaseModel):
    file_path: str
    file_name: str

class VisitAttachmentCreate(VisitAttachmentBase):
    pass

class VisitAttachmentResponse(VisitAttachmentBase):
    id: int
    visit_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- CONTACT SCHEMAS -----------------
class ContactBase(BaseModel):
    nombre: str
    apellidos: str
    email: Optional[str] = None
    movil: Optional[str] = None
    linkedin: Optional[str] = None
    cargo: Optional[str] = None
    nivel_decision: Optional[str] = "Usuario"  # Decisor, Prescriptor, Usuario, Bloqueador
    notas_personales: Optional[str] = None

class ContactCreate(ContactBase):
    client_id: int

class ContactUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[str] = None
    movil: Optional[str] = None
    linkedin: Optional[str] = None
    cargo: Optional[str] = None
    nivel_decision: Optional[str] = None
    notas_personales: Optional[str] = None

class ContactResponse(ContactBase):
    id: int
    client_id: int

    class Config:
        from_attributes = True


# ----------------- VISIT SCHEMAS -----------------
class VisitBase(BaseModel):
    fecha: str  # YYYY-MM-DD
    hora: str   # HH:MM
    duracion: int  # en minutos
    tipo_visita: str  # Presencial, Teams/Zoom, Telefónica
    acompanantes_internos: Optional[str] = None
    objetivo: Optional[str] = None
    puntos_tratados: Optional[str] = None
    conclusiones: Optional[str] = None

class VisitCreate(VisitBase):
    client_id: int
    attendee_ids: Optional[List[int]] = []  # Lista de IDs de contactos de la empresa

class VisitUpdate(BaseModel):
    fecha: Optional[str] = None
    hora: Optional[str] = None
    duracion: Optional[int] = None
    tipo_visita: Optional[str] = None
    acompanantes_internos: Optional[str] = None
    objetivo: Optional[str] = None
    puntos_tratados: Optional[str] = None
    conclusiones: Optional[str] = None
    attendee_ids: Optional[List[int]] = None

class VisitResponse(VisitBase):
    id: int
    client_id: int
    attendees: List[ContactResponse] = []
    attachments: List[VisitAttachmentResponse] = []

    class Config:
        from_attributes = True


# ----------------- TASK SCHEMAS -----------------
class TaskBase(BaseModel):
    descripcion: str
    estado: Optional[str] = "Pendiente"  # Pendiente, En Progreso, Completada, Cancelada
    prioridad: Optional[str] = "Media"   # Alta, Media, Baja
    fecha_limite: str                    # YYYY-MM-DD

class TaskCreate(TaskBase):
    client_id: int
    visit_id: Optional[int] = None       # Visita opcional que la originó

class TaskUpdate(BaseModel):
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    fecha_limite: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    client_id: int
    visit_id: Optional[int] = None
    fecha_creacion: str

    class Config:
        from_attributes = True


# ----------------- CLIENT SCHEMAS -----------------
class ClientBase(BaseModel):
    razon_social: str
    nombre_comercial: Optional[str] = None
    cif_nif: Optional[str] = None
    codigo_sumelga: Optional[str] = None
    via: Optional[str] = None
    direccion: Optional[str] = None
    numero: Optional[str] = None
    poblacion: Optional[str] = None
    codigo_postal: Optional[str] = None
    telefono: Optional[str] = None
    web: Optional[str] = None
    sociedad: Optional[str] = "Sumelga"           # SUMELGA or MEGANOR
    tipo_cliente: Optional[str] = "CLIENTE FINAL"  # CLIENTE FINAL, OEM, SI, CUADRISTA, INSTALADOR
    sector: Optional[str] = "Industrial"        # Automoción, Distribución, Industrial, etc.
    clasificacion_abc: Optional[str] = "C"      # A, B, C
    volumen_ventas: Optional[float] = 0.0
    volumen_ventas_anterior: Optional[float] = 0.0
    ventas_2025: Optional[float] = 0.0
    ventas_2024: Optional[float] = 0.0
    ventas_2023: Optional[float] = 0.0
    comercial_id: Optional[int] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    cif_nif: Optional[str] = None
    codigo_sumelga: Optional[str] = None
    via: Optional[str] = None
    direccion: Optional[str] = None
    numero: Optional[str] = None
    poblacion: Optional[str] = None
    codigo_postal: Optional[str] = None
    telefono: Optional[str] = None
    web: Optional[str] = None
    sociedad: Optional[str] = None
    tipo_cliente: Optional[str] = None
    sector: Optional[str] = None
    clasificacion_abc: Optional[str] = None
    volumen_ventas: Optional[float] = None
    volumen_ventas_anterior: Optional[float] = None
    ventas_2025: Optional[float] = None
    ventas_2024: Optional[float] = None
    ventas_2023: Optional[float] = None
    comercial_id: Optional[int] = None

# Relational Client response with extra KPIs
class ClientResponse(ClientBase):
    id: int
    fecha_ultima_visita: Optional[str] = None
    estado_ultima_accion: Optional[str] = None
    comercial: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# ----------------- OFFER SCHEMAS -----------------
class OfferResponse(BaseModel):
    id: int
    numero_oferta: str
    descripcion: Optional[str] = None
    cliente_codigo: str
    cliente_nombre: Optional[str] = None
    comercial_codigo: Optional[str] = None
    referencia: Optional[str] = None
    fecha_creacion: Optional[str] = None
    situacion: str
    campo_i: Optional[str] = None
    total: float
    margen: float
    coste: float
    client_id: Optional[int] = None
    sociedad: Optional[str] = None

    class Config:
        from_attributes = True

# Fully nested cascade response (for Detail View)
class ClientDetailResponse(ClientResponse):
    contacts: List[ContactResponse] = []
    visits: List[VisitResponse] = []
    tasks: List[TaskResponse] = []
    offers: List[OfferResponse] = []

    class Config:
        from_attributes = True


# ----------------- DASHBOARD SCHEMAS -----------------
class DashboardMetrics(BaseModel):
    total_clientes_activos: int
    total_visitas_este_mes: int
    objetivo_visitas_mes: int
    visitas_completadas_porcentaje: float
    tareas_pendientes: int
    tareas_completadas_este_mes: int
    agenda_semana: List[VisitResponse] = []
    tareas_urgentes: List[TaskResponse] = []

class SyncSalesRequest(BaseModel):
    db_path: Optional[str] = "/Users/agus/Developer/KPI_Comercial/backend/kpi_comercial.db"

class UserVerifyPasswordRequest(BaseModel):
    user_id: int
    password: str

