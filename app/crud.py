from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from datetime import datetime, date, timedelta
from typing import List, Optional
from app import models, schemas

# Helper to enrich client with rapid KPIs
def enrich_client_kpis(db: Session, client: models.Client):
    # Última visita
    last_visit = db.query(models.Visit.fecha).filter(
        models.Visit.client_id == client.id
    ).order_by(desc(models.Visit.fecha)).first()
    fecha_ultima_visita = last_visit[0] if last_visit else None

    # Estado de la última acción (tarea)
    last_task = db.query(models.Task.estado).filter(
        models.Task.client_id == client.id
    ).order_by(desc(models.Task.id)).first()
    estado_ultima_accion = last_task[0] if last_task else "Sin Tareas"

    # We dynamically attach these attributes so schemas.from_attributes can pick them up
    client.fecha_ultima_visita = fecha_ultima_visita
    client.estado_ultima_accion = estado_ultima_accion
    return client

# ----------------- CLIENT CRUD -----------------
def get_client(db: Session, client_id: int):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if client:
        enrich_client_kpis(db, client)
    return client

def get_clients(db: Session, skip: int = 0, limit: int = 10000, 
                search: Optional[str] = None, 
                sector: Optional[str] = None, 
                tipo_cliente: Optional[str] = None,
                sociedad: Optional[str] = None,
                comercial_id: Optional[int] = None):
    query = db.query(models.Client)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Client.razon_social.like(search_term),
                models.Client.nombre_comercial.like(search_term),
                models.Client.cif_nif.like(search_term)
            )
        )
    if sector:
        query = query.filter(models.Client.sector == sector)
    if tipo_cliente:
        query = query.filter(models.Client.tipo_cliente == tipo_cliente)
    if sociedad:
        query = query.filter(models.Client.sociedad == sociedad)
    if comercial_id is not None:
        query = query.filter(models.Client.comercial_id == comercial_id)
        
    clients = query.offset(skip).limit(limit).all()
    if not clients:
        return []
        
    client_ids = [c.id for c in clients]
    
    # Bulk fetch last visits for all selected clients (max fecha per client_id)
    last_visits = dict(
        db.query(models.Visit.client_id, func.max(models.Visit.fecha))
        .filter(models.Visit.client_id.in_(client_ids))
        .group_by(models.Visit.client_id).all()
    )
    
    # Bulk fetch last task statuses for all selected clients (status of the task with max id per client_id)
    subq = db.query(
        models.Task.client_id, 
        func.max(models.Task.id).label("max_id")
    ).filter(models.Task.client_id.in_(client_ids))\
     .group_by(models.Task.client_id).subquery()
     
    last_tasks = dict(
        db.query(models.Task.client_id, models.Task.estado)
        .join(subq, and_(models.Task.client_id == subq.c.client_id, models.Task.id == subq.c.max_id))
        .all()
    )
    
    for c in clients:
        c.fecha_ultima_visita = last_visits.get(c.id)
        c.estado_ultima_accion = last_tasks.get(c.id, "Sin Tareas")
        
    return clients

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    enrich_client_kpis(db, db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        return None
    
    update_data = client_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
        
    db.commit()
    db.refresh(db_client)
    enrich_client_kpis(db, db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        return False
    db.delete(db_client)
    db.commit()
    return True


# ----------------- CONTACT CRUD -----------------
def get_contact(db: Session, contact_id: int):
    return db.query(models.Contact).filter(models.Contact.id == contact_id).first()

def get_contacts(db: Session, skip: int = 0, limit: int = 100, client_id: Optional[int] = None):
    query = db.query(models.Contact)
    if client_id is not None:
        query = query.filter(models.Contact.client_id == client_id)
    return query.offset(skip).limit(limit).all()

def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def update_contact(db: Session, contact_id: int, contact_update: schemas.ContactUpdate):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        return None
    
    update_data = contact_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contact, key, value)
        
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        return False
    db.delete(db_contact)
    db.commit()
    return True


# ----------------- VISIT CRUD -----------------
def get_visit(db: Session, visit_id: int):
    return db.query(models.Visit).filter(models.Visit.id == visit_id).first()

def get_visits(db: Session, skip: int = 0, limit: int = 100, client_id: Optional[int] = None, comercial_id: Optional[int] = None):
    query = db.query(models.Visit)
    if client_id is not None:
        query = query.filter(models.Visit.client_id == client_id)
    if comercial_id is not None:
        query = query.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    return query.order_by(desc(models.Visit.fecha), desc(models.Visit.hora)).offset(skip).limit(limit).all()

def create_visit(db: Session, visit: schemas.VisitCreate):
    visit_data = visit.model_dump(exclude={"attendee_ids"})
    db_visit = models.Visit(**visit_data)
    
    # Resolve attendees
    if visit.attendee_ids:
        contacts = db.query(models.Contact).filter(
            models.Contact.id.in_(visit.attendee_ids),
            models.Contact.client_id == visit.client_id
        ).all()
        db_visit.attendees = contacts
        
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

def update_visit(db: Session, visit_id: int, visit_update: schemas.VisitUpdate):
    db_visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()
    if not db_visit:
        return None
    
    update_data = visit_update.model_dump(exclude_unset=True, exclude={"attendee_ids"})
    for key, value in update_data.items():
        setattr(db_visit, key, value)
        
    if visit_update.attendee_ids is not None:
        contacts = db.query(models.Contact).filter(
            models.Contact.id.in_(visit_update.attendee_ids),
            models.Contact.client_id == db_visit.client_id
        ).all()
        db_visit.attendees = contacts
        
    db.commit()
    db.refresh(db_visit)
    return db_visit

def delete_visit(db: Session, visit_id: int):
    db_visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()
    if not db_visit:
        return False
    db.delete(db_visit)
    db.commit()
    return True


# ----------------- ATTACHMENT CRUD -----------------
def create_visit_attachment(db: Session, visit_id: int, file_path: str, file_name: str):
    db_attachment = models.VisitAttachment(
        visit_id=visit_id,
        file_path=file_path,
        file_name=file_name
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def delete_visit_attachment(db: Session, attachment_id: int):
    db_attach = db.query(models.VisitAttachment).filter(models.VisitAttachment.id == attachment_id).first()
    if not db_attach:
        return False
    db.delete(db_attach)
    db.commit()
    return True


# ----------------- TASK CRUD -----------------
def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100, client_id: Optional[int] = None, comercial_id: Optional[int] = None):
    query = db.query(models.Task)
    if client_id is not None:
        query = query.filter(models.Task.client_id == client_id)
    if comercial_id is not None:
        query = query.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    return query.order_by(desc(models.Task.prioridad), models.Task.fecha_limite).offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    task_data = task.model_dump()
    db_task = models.Task(**task_data)
    # Today is YYYY-MM-DD
    db_task.fecha_creacion = date.today().isoformat()
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True


# ----------------- DASHBOARD METRICS -----------------
def get_dashboard_metrics(db: Session, target_visits_month: int = 20, comercial_id: Optional[int] = None):
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    
    # 1. Total Clientes Activos
    q_activos = db.query(models.Client).filter(models.Client.tipo_cliente == "Activo")
    if comercial_id is not None:
        q_activos = q_activos.filter(models.Client.comercial_id == comercial_id)
    total_activos = q_activos.count()
    
    # 2. Total Visitas este Mes
    start_of_month_str = start_of_month.isoformat()
    q_visitas = db.query(models.Visit).filter(
        models.Visit.fecha >= start_of_month_str
    )
    if comercial_id is not None:
        q_visitas = q_visitas.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    total_visitas_mes = q_visitas.count()
    
    # 3. Visitas completadas porcentaje
    pct = 0.0
    if target_visits_month > 0:
        pct = round((total_visitas_mes / target_visits_month) * 100, 1)
        
    # 4. Tareas Pendientes
    q_pendientes = db.query(models.Task).filter(
        models.Task.estado.in_(["Pendiente", "En Progreso"])
    )
    if comercial_id is not None:
        q_pendientes = q_pendientes.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    tareas_pendientes = q_pendientes.count()
    
    # 5. Tareas Completadas este Mes
    q_completadas = db.query(models.Task).filter(
        and_(
            models.Task.estado == "Completada",
            models.Task.fecha_limite >= start_of_month_str
        )
    )
    if comercial_id is not None:
        q_completadas = q_completadas.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    tareas_completadas_mes = q_completadas.count()
    
    # 6. Agenda de la Semana (visitas desde el lunes de esta semana hasta el domingo)
    # Lunes es 0, Domingo es 6
    weekday = today.weekday()
    start_of_week = today - timedelta(days=weekday)
    end_of_week = start_of_week + timedelta(days=6)
    
    q_agenda = db.query(models.Visit).filter(
        and_(
            models.Visit.fecha >= start_of_week.isoformat(),
            models.Visit.fecha <= end_of_week.isoformat()
        )
    )
    if comercial_id is not None:
        q_agenda = q_agenda.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    agenda = q_agenda.order_by(models.Visit.fecha, models.Visit.hora).all()
    
    # 7. Tareas urgentes (vencidas o que vencen hoy)
    # En rojo si fecha_limite <= hoy y estado es Pendiente o En Progreso
    today_str = today.isoformat()
    q_urgentes = db.query(models.Task).filter(
        and_(
            models.Task.estado.in_(["Pendiente", "En Progreso"]),
            models.Task.fecha_limite <= today_str
        )
    )
    if comercial_id is not None:
        q_urgentes = q_urgentes.join(models.Client).filter(models.Client.comercial_id == comercial_id)
    tareas_urgentes = q_urgentes.order_by(models.Task.fecha_limite).all()
    
    return schemas.DashboardMetrics(
        total_clientes_activos=total_activos,
        total_visitas_este_mes=total_visitas_mes,
        objetivo_visitas_mes=target_visits_month,
        visitas_completadas_porcentaje=pct,
        tareas_pendientes=tareas_pendientes,
        tareas_completadas_este_mes=tareas_completadas_mes,
        agenda_semana=agenda,
        tareas_urgentes=tareas_urgentes
    )

# ----------------- USER (COMERCIAL) CRUD -----------------
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    users = db.query(models.User).offset(skip).limit(limit).all()
    for u in users:
        u.clientes_asignados = db.query(models.Client).filter(models.Client.comercial_id == u.id).count()
    return users

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True
