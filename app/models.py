from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Table, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association Table for Many-to-Many relationship between Visits and Contacts
visit_attendees = Table(
    "visit_attendees",
    Base.metadata,
    Column("visit_id", Integer, ForeignKey("visits.id", ondelete="CASCADE"), primary_key=True),
    Column("contact_id", Integer, ForeignKey("contacts.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    email = Column(String, nullable=True)
    role = Column(String, default="Comercial", index=True)  # Administrador, Comercial
    password = Column(String, default="1234")  # Plain text password for ease of simulation
    is_active = Column(Boolean, default=True)
    representante_codigo = Column(String, unique=True, index=True, nullable=True) # ERP rep code link

    # Relationships
    clients = relationship("Client", back_populates="comercial")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String, index=True, nullable=False)
    nombre_comercial = Column(String, nullable=True)
    cif_nif = Column(String, nullable=True)
    codigo_sumelga = Column(String, index=True, nullable=True)  # ERP integration code
    via = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    numero = Column(String, nullable=True)
    poblacion = Column(String, nullable=True)
    codigo_postal = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    web = Column(String, nullable=True)
    sociedad = Column(String, default="Sumelga", nullable=False, index=True) # SUMELGA or MEGANOR
    
    # Segmentación
    tipo_cliente = Column(String, default="CLIENTE FINAL", index=True)  # CLIENTE FINAL, OEM, SI, CUADRISTA, INSTALADOR
    sector = Column(String, default="Industrial", index=True)        # Automoción, Distribución, Industrial, etc.
    clasificacion_abc = Column(String, default="C", index=True)      # A, B, C
    volumen_ventas = Column(Float, default=0.0)
    volumen_ventas_anterior = Column(Float, default=0.0)
    ventas_2025 = Column(Float, default=0.0)
    ventas_2024 = Column(Float, default=0.0)
    ventas_2023 = Column(Float, default=0.0)

    # Comercial asignado (Vínculo de privilegios)
    comercial_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint('sociedad', 'codigo_sumelga', name='uix_sociedad_codigo_sumelga'),
    )
    
    # Relationships
    comercial = relationship("User", back_populates="clients")
    contacts = relationship("Contact", back_populates="client", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="client", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="client", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="client", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    email = Column(String, nullable=True)
    movil = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    
    # Rol y cargo
    cargo = Column(String, nullable=True)
    nivel_decision = Column(String, default="Usuario")  # Decisor, Prescriptor, Usuario, Bloqueador
    notas_personales = Column(Text, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="contacts")
    visits = relationship("Visit", secondary=visit_attendees, back_populates="attendees")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    fecha = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    hora = Column(String, nullable=False)   # HH:MM
    duracion = Column(Integer, default=60)  # en minutos
    tipo_visita = Column(String, default="Presencial", index=True)  # Presencial, Teams/Zoom, Telefónica
    acompanantes_internos = Column(String, nullable=True)
    
    # Minuta
    objetivo = Column(Text, nullable=True)
    puntos_tratados = Column(Text, nullable=True)
    conclusiones = Column(Text, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="visits")
    attendees = relationship("Contact", secondary=visit_attendees, back_populates="visits")
    attachments = relationship("VisitAttachment", back_populates="visit", cascade="all, delete-orphan")
    tasks_generated = relationship("Task", back_populates="visit", cascade="all, delete")


class VisitAttachment(Base):
    __tablename__ = "visit_attachments"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    visit = relationship("Visit", back_populates="attachments")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="SET NULL"), nullable=True, index=True)
    
    descripcion = Column(Text, nullable=False)
    estado = Column(String, default="Pendiente", index=True)  # Pendiente, En Progreso, Completada, Cancelada
    prioridad = Column(String, default="Media", index=True)   # Alta, Media, Baja
    fecha_creacion = Column(String, nullable=False) # YYYY-MM-DD
    fecha_limite = Column(String, nullable=False, index=True)   # YYYY-MM-DD

    # Relationships
    client = relationship("Client", back_populates="tasks")
    visit = relationship("Visit", back_populates="tasks_generated")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    numero_oferta = Column(String, index=True, nullable=False)
    descripcion = Column(String, nullable=True)
    cliente_codigo = Column(String, index=True, nullable=False)
    cliente_nombre = Column(String, nullable=True)
    comercial_codigo = Column(String, index=True, nullable=True)
    referencia = Column(String, nullable=True)
    fecha_creacion = Column(String, nullable=True)
    situacion = Column(String, default="P", index=True)  # P (pendiente) or C (cerrada)
    campo_i = Column(String, nullable=True)  # "Proc." which is not used
    total = Column(Float, default=0.0)
    margen = Column(Float, default=0.0)
    coste = Column(Float, default=0.0)
    
    # Matching fields for CRM
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=True, index=True)
    sociedad = Column(String, default="Sumelga", nullable=True, index=True)
    
    # Relationships
    client = relationship("Client", back_populates="offers")
