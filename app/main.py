import os
import io
import shutil
import sqlite3
import sys
import platform
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import engine, Base, get_db
from app import models, schemas, crud

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency to retrieve the logged-in user
def get_current_user(x_user_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if x_user_id:
        try:
            user_id = int(x_user_id)
            user = crud.get_user(db, user_id)
            if user:
                return user
        except ValueError:
            pass
            
    # Default fallback: get first administrator
    admin = db.query(models.User).filter(models.User.role == "Administrador").first()
    if not admin:
        default_admin = models.User(
            username="admin",
            nombre="Agustín",
            apellidos="Admin",
            email="admin@sumelga.com",
            role="Administrador",
            is_active=True
        )
        db.add(default_admin)
        db.commit()
        db.refresh(default_admin)
        return default_admin
    return admin

app = FastAPI(
    title="CRM Ventas e Interacciones",
    description="API robusta para la gestión de Clientes, Contactos, Visitas, Tareas y Dashboard Operativo.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Disable caching for static assets in development to prevent stale caches
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Define Base Dir
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Ensure folders exist
if os.environ.get("VERCEL") == "1":
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- CLIENTS ENDPOINTS -----------------
@app.post("/api/clients", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client: schemas.ClientCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Sales Reps can only create clients for themselves
        if current_user.role == "Comercial":
            client.comercial_id = current_user.id
        return crud.create_client(db=db, client=client)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el cliente: {str(e)}")

@app.get("/api/clients", response_model=List[schemas.ClientResponse])
def read_clients(
    skip: int = 0, 
    limit: int = 10000, 
    search: Optional[str] = None,
    sector: Optional[str] = None,
    tipo_cliente: Optional[str] = None,
    sociedad: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comercial_id = current_user.id if current_user.role == "Comercial" else None
    return crud.get_clients(db=db, skip=skip, limit=limit, search=search, sector=sector, tipo_cliente=tipo_cliente, sociedad=sociedad, comercial_id=comercial_id)

@app.get("/api/clients/{client_id}", response_model=schemas.ClientResponse)
def read_client(
    client_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_client = crud.get_client(db=db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    # Check permissions
    if current_user.role == "Comercial" and db_client.comercial_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver este cliente")
        
    return db_client

@app.get("/api/clients/{client_id}/detail", response_model=schemas.ClientDetailResponse)
def read_client_detail(
    client_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    # Check permissions
    if current_user.role == "Comercial" and db_client.comercial_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver el detalle de este cliente")
        
    crud.enrich_client_kpis(db, db_client)
    return db_client

@app.put("/api/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int, 
    client: schemas.ClientUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_client = crud.get_client(db=db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    # Check permissions and prevent sales reps from changing client's assigned rep
    if current_user.role == "Comercial":
        if db_client.comercial_id != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes permisos para editar este cliente")
        # Sales reps cannot reassign clients
        client.comercial_id = current_user.id
        
    db_client = crud.update_client(db=db, client_id=client_id, client_update=client)
    return db_client

@app.delete("/api/clients/{client_id}")
def delete_client(
    client_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_client = crud.get_client(db=db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    if current_user.role == "Comercial":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores. Los comerciales no pueden eliminar clientes")
        
    crud.delete_client(db=db, client_id=client_id)
    return {"message": "Cliente eliminado correctamente y todas sus relaciones en cascada"}


# ----------------- CONTACTS ENDPOINTS -----------------
@app.post("/api/contacts", response_model=schemas.ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    return crud.create_contact(db=db, contact=contact)

@app.get("/api/contacts", response_model=List[schemas.ContactResponse])
def read_contacts(skip: int = 0, limit: int = 100, client_id: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_contacts(db=db, skip=skip, limit=limit, client_id=client_id)

@app.get("/api/contacts/{contact_id}", response_model=schemas.ContactResponse)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = crud.get_contact(db=db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    return db_contact

@app.put("/api/contacts/{contact_id}", response_model=schemas.ContactResponse)
def update_contact(contact_id: int, contact: schemas.ContactUpdate, db: Session = Depends(get_db)):
    db_contact = crud.update_contact(db=db, contact_id=contact_id, contact_update=contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    return db_contact

@app.delete("/api/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    success = crud.delete_contact(db=db, contact_id=contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    return {"message": "Contacto eliminado correctamente"}


# ----------------- VISITS ENDPOINTS -----------------
@app.post("/api/visits", response_model=schemas.VisitResponse, status_code=status.HTTP_201_CREATED)
def create_visit(visit: schemas.VisitCreate, db: Session = Depends(get_db)):
    return crud.create_visit(db=db, visit=visit)

@app.get("/api/visits", response_model=List[schemas.VisitResponse])
def read_visits(
    skip: int = 0, 
    limit: int = 100, 
    client_id: Optional[int] = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comercial_id = current_user.id if current_user.role == "Comercial" else None
    return crud.get_visits(db=db, skip=skip, limit=limit, client_id=client_id, comercial_id=comercial_id)

@app.get("/api/visits/{visit_id}", response_model=schemas.VisitResponse)
def read_visit(visit_id: int, db: Session = Depends(get_db)):
    db_visit = crud.get_visit(db=db, visit_id=visit_id)
    if db_visit is None:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return db_visit

@app.put("/api/visits/{visit_id}", response_model=schemas.VisitResponse)
def update_visit(visit_id: int, visit: schemas.VisitUpdate, db: Session = Depends(get_db)):
    db_visit = crud.update_visit(db=db, visit_id=visit_id, visit_update=visit)
    if db_visit is None:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return db_visit

@app.delete("/api/visits/{visit_id}")
def delete_visit(
    visit_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_visit = crud.get_visit(db=db, visit_id=visit_id)
    if db_visit is None:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
        
    if current_user.role == "Comercial" and db_visit.client.comercial_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar una visita de un cliente que no tienes asignado")
        
    success = crud.delete_visit(db=db, visit_id=visit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return {"message": "Visita eliminada correctamente"}


# ----------------- ATTACHMENT UPLOAD ENDPOINT -----------------
@app.post("/api/visits/{visit_id}/attachments", response_model=schemas.VisitAttachmentResponse)
def upload_visit_attachment(visit_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_visit = crud.get_visit(db=db, visit_id=visit_id)
    if not db_visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    
    # Save the file locally
    filename = f"visit_{visit_id}_{file.filename}"
    file_path = f"/static/uploads/{filename}"
    full_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {str(e)}")
        
    return crud.create_visit_attachment(db=db, visit_id=visit_id, file_path=file_path, file_name=file.filename)

@app.delete("/api/attachments/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db)):
    db_attach = db.query(models.VisitAttachment).filter(models.VisitAttachment.id == attachment_id).first()
    if not db_attach:
        raise HTTPException(status_code=404, detail="Adjunto no encontrado")
        
    # Delete file from filesystem
    filename = os.path.basename(db_attach.file_path)
    full_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception:
            pass
            
    crud.delete_visit_attachment(db=db, attachment_id=attachment_id)
    return {"message": "Adjunto eliminado correctamente"}


# ----------------- TASKS ENDPOINTS -----------------
@app.post("/api/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)

@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    client_id: Optional[int] = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comercial_id = current_user.id if current_user.role == "Comercial" else None
    return crud.get_tasks(db=db, skip=skip, limit=limit, client_id=client_id, comercial_id=comercial_id)

@app.get("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def read_task(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.get_task(db=db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return db_task

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = crud.update_task(db=db, task_id=task_id, task_update=task)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return db_task

@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = crud.get_task(db=db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    if current_user.role == "Comercial" and db_task.client.comercial_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar una tarea de un cliente que no tienes asignado")
        
    success = crud.delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return {"message": "Tarea eliminada correctamente"}


# ----------------- DASHBOARD METRICS ENDPOINT -----------------
@app.get("/api/dashboard", response_model=schemas.DashboardMetrics)
def read_dashboard_metrics(
    target: int = 20, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comercial_id = current_user.id if current_user.role == "Comercial" else None
    return crud.get_dashboard_metrics(db=db, target_visits_month=target, comercial_id=comercial_id)

# ----------------- USER (COMERCIAL) ENDPOINTS -----------------
@app.get("/api/comerciales", response_model=List[schemas.UserResponse])
def read_comerciales(db: Session = Depends(get_db)):
    return crud.get_users(db=db)

@app.post("/api/comerciales/verify")
def verify_comercial_password(
    req: schemas.UserVerifyPasswordRequest,
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Comercial no encontrado")
    if user.password != req.password:
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")
    return {
        "status": "ok", 
        "user": {
            "id": user.id,
            "username": user.username,
            "nombre": user.nombre,
            "apellidos": user.apellidos,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@app.post("/api/comerciales", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_comercial(
    comercial: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")
    
    db_user = crud.get_user_by_username(db, comercial.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
        
    return crud.create_user(db=db, user=comercial)

@app.put("/api/comerciales/{user_id}", response_model=schemas.UserResponse)
def update_comercial(
    user_id: int,
    comercial: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")
        
    db_user = crud.update_user(db=db, user_id=user_id, user_update=comercial)
    if not db_user:
        raise HTTPException(status_code=404, detail="Comercial no encontrado")
    return db_user

@app.delete("/api/comerciales/{user_id}")
def delete_comercial(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")
        
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
        
    success = crud.delete_user(db=db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comercial no encontrado")
    return {"message": "Comercial eliminado correctamente"}


# ----------------- ADMIN: DIAGNOSTICS -----------------
@app.get("/api/admin/diagnostics")
def get_diagnostics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")

    db_path = os.path.abspath("crm.db")

    # ── DB stats via direct sqlite3 ──────────────────────────────────────────
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Table row counts
    table_counts = {}
    for table in ["users", "clients", "contacts", "visits", "tasks", "offers", "visit_attachments", "visit_attendees"]:
        try:
            count = cur.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            table_counts[table] = count
        except Exception:
            table_counts[table] = 0

    # Index list
    indexes = cur.execute(
        "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name"
    ).fetchall()
    index_list = [{"name": r["name"], "table": r["tbl_name"]} for r in indexes]

    # DB file size
    db_size_bytes = os.path.getsize(db_path) if os.path.exists(db_path) else 0
    db_size_mb = round(db_size_bytes / (1024 * 1024), 2)

    # WAL mode and integrity check
    journal_mode = cur.execute("PRAGMA journal_mode").fetchone()[0]
    integrity = cur.execute("PRAGMA integrity_check").fetchone()[0]
    page_count = cur.execute("PRAGMA page_count").fetchone()[0]
    page_size = cur.execute("PRAGMA page_size").fetchone()[0]
    freelist_count = cur.execute("PRAGMA freelist_count").fetchone()[0]

    # Offers breakdown by sociedad and situacion
    offers_stats = {}
    try:
        rows = cur.execute(
            "SELECT sociedad, situacion, COUNT(*) as cnt, COALESCE(SUM(total),0) as total "
            "FROM offers GROUP BY sociedad, situacion"
        ).fetchall()
        for r in rows:
            key = r["sociedad"]
            if key not in offers_stats:
                offers_stats[key] = {"total_ofertas": 0, "importe_total": 0.0, "abiertas": 0, "cerradas": 0}
            offers_stats[key]["total_ofertas"] += r["cnt"]
            offers_stats[key]["importe_total"] += float(r["total"])
            if r["situacion"] == "P":
                offers_stats[key]["abiertas"] += r["cnt"]
            elif r["situacion"] == "C":
                offers_stats[key]["cerradas"] += r["cnt"]
    except Exception:
        pass

    conn.close()

    # ── System info ─────────────────────────────────────────────────────────
    uname = platform.uname()

    return JSONResponse({
        "server": {
            "python_version": sys.version.split()[0],
            "platform": f"{uname.system} {uname.release}",
            "machine": uname.machine,
            "timestamp": datetime.now().isoformat()
        },
        "database": {
            "path": db_path,
            "size_mb": db_size_mb,
            "size_bytes": db_size_bytes,
            "journal_mode": journal_mode,
            "integrity": integrity,
            "page_count": page_count,
            "page_size": page_size,
            "freelist_count": freelist_count,
            "fragmentation_pct": round(freelist_count / max(page_count, 1) * 100, 1)
        },
        "tables": table_counts,
        "indexes": {
            "total": len(index_list),
            "list": index_list
        },
        "offers_stats": offers_stats
    })


# ----------------- ADMIN: IMPORT OFFERS -----------------
@app.post("/api/admin/import-offers")
async def import_offers(
    file: UploadFile = File(...),
    sociedad: str = Form("Sumelga"),
    replace: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")

    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="El fichero debe ser un Excel (.xlsx o .xls)")

    try:
        import pandas as pd
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error leyendo el fichero Excel: {e}")

    def clean_val(val):
        import pandas as pdi
        if pdi.isna(val) or val is None:
            return ""
        return str(val).strip()

    def clean_code(val):
        c = clean_val(val)
        if not c:
            return ""
        if c.isdigit():
            return f"{int(c):05d}"
        return c.zfill(5)

    # Build client code → id map for chosen sociedad
    sociedad_clients = {
        c.codigo_sumelga: c.id
        for c in db.query(models.Client).filter(models.Client.sociedad == sociedad).all()
    }

    # Optional: delete existing offers for this sociedad
    deleted = 0
    if replace:
        deleted = db.query(models.Offer).filter(models.Offer.sociedad == sociedad).delete()
        db.commit()

    # Parse and insert
    imported = 0
    skipped = 0
    errors = []
    offers_to_add = []

    for idx, row in df.iterrows():
        try:
            off_num = clean_val(row.get("Oferta"))
            if not off_num:
                skipped += 1
                continue

            cli_code_raw = row.get("Cli./Pot.")
            import pandas as pdi
            if pdi.isna(cli_code_raw) or cli_code_raw is None:
                skipped += 1
                continue
            c_code = clean_code(cli_code_raw)

            date_val = row.get("F. Oferta")
            date_str = ""
            if pdi.notna(date_val):
                if hasattr(date_val, "strftime"):
                    date_str = date_val.strftime("%Y-%m-%d")
                else:
                    date_str = str(date_val).split(" ")[0]

            def safe_float(v):
                try:
                    import pandas as pd2
                    return float(v) if pd2.notna(v) else 0.0
                except Exception:
                    return 0.0

            offers_to_add.append(models.Offer(
                numero_oferta=off_num,
                descripcion=clean_val(row.get("Descripción")),
                cliente_codigo=c_code,
                cliente_nombre=clean_val(row.get("Razón Social")),
                comercial_codigo=clean_val(row.get("Ag. Com.")),
                referencia=clean_val(row.get("Referencia")),
                fecha_creacion=date_str,
                situacion=clean_val(row.get("Situación")) or "P",
                campo_i=clean_val(row.get("Proc.")),
                total=safe_float(row.get("Total Importe")),
                margen=safe_float(row.get("Margen")),
                coste=safe_float(row.get("Coste")),
                client_id=sociedad_clients.get(c_code),
                sociedad=sociedad
            ))
            imported += 1
        except Exception as e:
            errors.append(f"Fila {idx+2}: {e}")
            skipped += 1

    if offers_to_add:
        db.bulk_save_objects(offers_to_add)
        db.commit()

    return JSONResponse({
        "ok": True,
        "sociedad": sociedad,
        "deleted": deleted,
        "imported": imported,
        "skipped": skipped,
        "errors": errors[:20]  # max 20 error messages
    })


# ----------------- ADMIN: RUN INDEX OPTIMIZATION -----------------
@app.post("/api/admin/optimize-db")
def optimize_database(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")

    db_path = os.path.abspath("crm.db")
    INDEXES = [
        ("idx_clients_razon_social",       "clients",  ["razon_social"]),
        ("idx_clients_sociedad",           "clients",  ["sociedad"]),
        ("idx_clients_sector",             "clients",  ["sector"]),
        ("idx_clients_tipo_cliente",       "clients",  ["tipo_cliente"]),
        ("idx_clients_clasificacion",      "clients",  ["clasificacion_abc"]),
        ("idx_clients_comercial_id",       "clients",  ["comercial_id"]),
        ("idx_clients_sociedad_sector",    "clients",  ["sociedad", "sector"]),
        ("idx_clients_sociedad_comercial", "clients",  ["sociedad", "comercial_id"]),
        ("idx_clients_volumen_ventas",     "clients",  ["volumen_ventas"]),
        ("idx_visits_client_id",           "visits",   ["client_id"]),
        ("idx_visits_fecha",               "visits",   ["fecha"]),
        ("idx_visits_tipo_visita",         "visits",   ["tipo_visita"]),
        ("idx_visits_client_fecha",        "visits",   ["client_id", "fecha"]),
        ("idx_visits_fecha_client",        "visits",   ["fecha", "client_id"]),
        ("idx_tasks_client_id",            "tasks",    ["client_id"]),
        ("idx_tasks_visit_id",             "tasks",    ["visit_id"]),
        ("idx_tasks_estado",               "tasks",    ["estado"]),
        ("idx_tasks_prioridad",            "tasks",    ["prioridad"]),
        ("idx_tasks_fecha_limite",         "tasks",    ["fecha_limite"]),
        ("idx_tasks_estado_fecha",         "tasks",    ["estado", "fecha_limite"]),
        ("idx_tasks_client_estado",        "tasks",    ["client_id", "estado"]),
        ("idx_contacts_client_id",         "contacts", ["client_id"]),
        ("idx_contacts_nivel_decision",    "contacts", ["nivel_decision"]),
        ("idx_offers_client_id",           "offers",   ["client_id"]),
        ("idx_offers_sociedad",            "offers",   ["sociedad"]),
        ("idx_offers_situacion",           "offers",   ["situacion"]),
        ("idx_offers_cliente_codigo",      "offers",   ["cliente_codigo"]),
        ("idx_offers_numero",              "offers",   ["numero_oferta"]),
        ("idx_offers_fecha",               "offers",   ["fecha_creacion"]),
        ("idx_offers_client_situacion",    "offers",   ["client_id", "situacion"]),
        ("idx_offers_sociedad_codigo",     "offers",   ["sociedad", "cliente_codigo"]),
        ("idx_attachments_visit_id",       "visit_attachments", ["visit_id"]),
        ("idx_users_role",                 "users",    ["role"]),
        ("idx_users_is_active",            "users",    ["is_active"]),
        ("idx_users_role_active",          "users",    ["role", "is_active"]),
    ]

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL;")
    ok = 0
    for (name, table, columns) in INDEXES:
        sql = f"CREATE INDEX IF NOT EXISTS {name} ON {table} ({', '.join(columns)});"
        try:
            conn.execute(sql)
            ok += 1
        except Exception:
            pass
    conn.commit()
    conn.execute("ANALYZE;")
    conn.commit()
    conn.execute("VACUUM;")
    conn.commit()
    conn.close()

    return JSONResponse({"ok": True, "indexes_applied": ok})


# ----------------- ADMIN: SYNC SALES FROM KPI -----------------
KPI_DB_PATH = "/Users/agus/Developer/KPI_Comercial/backend/kpi_comercial.db"

# ABC classification thresholds (kept in sync with seed_users.py)
ABC_THRESHOLD_A = 50000.0
ABC_THRESHOLD_B = 10000.0


def _classify_abc(sales: float) -> str:
    if sales > ABC_THRESHOLD_A:
        return "A"
    if sales > ABC_THRESHOLD_B:
        return "B"
    return "C"


def _clean_code(val) -> str:
    """Normalize an ERP client code to a 5-digit zero-padded string."""
    if val is None:
        return ""
    s = str(val).strip()
    if not s:
        return ""
    if s.isdigit():
        return f"{int(s):05d}"
    return s.zfill(5)


def _load_excel_clients(db_path: str = None) -> dict:
    """Load CIF and address details from the two Excel files into a lookup dict.
    Key: (sociedad_lower, code_str_5digits). Used to enrich newly created clients.
    Returns an empty dict if the files are missing or pandas is unavailable.
    """
    excel_map = {}
    try:
        import pandas as pd
    except Exception:
        return excel_map

    files = [
        ("meganor", "/Users/agus/Developer/CRM/Listado de clientes Meganor.xlsx"),
        ("sumelga", "/Users/agus/Developer/CRM/Listado de clientes Sumelga.xlsx"),
    ]
    for soc_lower, path in files:
        if not os.path.exists(path):
            continue
        try:
            df = pd.read_excel(path)
            for _, row in df.iterrows():
                raw = row.get("Cliente")
                if raw is None or (isinstance(raw, float) and pd.isna(raw)):
                    continue
                code = _clean_code(raw)
                if not code:
                    continue
                cp_val = row.get("Distrito Postal")
                if isinstance(cp_val, float) and not pd.isna(cp_val):
                    cp = str(int(cp_val)).strip()
                else:
                    cp = "" if cp_val is None or (isinstance(cp_val, float) and pd.isna(cp_val)) else str(cp_val).strip()
                excel_map[(soc_lower, code)] = {
                    "cif": ("" if row.get("C.I.F.") is None or (isinstance(row.get("C.I.F."), float) and pd.isna(row.get("C.I.F."))) else str(row.get("C.I.F.")).strip()),
                    "via": ("" if row.get("Vía") is None or (isinstance(row.get("Vía"), float) and pd.isna(row.get("Vía"))) else str(row.get("Vía")).strip()),
                    "direccion": ("" if row.get("Dirección") is None or (isinstance(row.get("Dirección"), float) and pd.isna(row.get("Dirección"))) else str(row.get("Dirección")).strip()),
                    "numero": ("" if row.get("Número") is None or (isinstance(row.get("Número"), float) and pd.isna(row.get("Número"))) else str(row.get("Número")).strip()),
                    "poblacion": ("" if row.get("Población") is None or (isinstance(row.get("Población"), float) and pd.isna(row.get("Población"))) else str(row.get("Población")).strip()),
                    "codigo_postal": cp,
                }
        except Exception as e:
            print(f"[sync-sales] Warning: could not read {path}: {e}")
    return excel_map


@app.post("/api/admin/sync-sales")
def sync_sales(
    payload: schemas.SyncSalesRequest = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Recalculate volumen_ventas and clasificacion_abc from the current year in
    kpi_comercial.db. Updates existing clients in-place and creates new ones
    found in the ERP that are not yet in the CRM. Does NOT touch any other
    field (contacts, visits, tasks, offers, etc.) nor any other client data.
    """
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Operación restringida a Administradores")

    kpi_path = payload.db_path if payload and payload.db_path else KPI_DB_PATH

    if not os.path.exists(kpi_path):
        raise HTTPException(
            status_code=503,
            detail=f"Base de datos KPI no encontrada en {kpi_path}. "
                   f"Comprueba que el proyecto KPI_Comercial está disponible."
        )

    import time
    t0 = time.time()
    current_year = datetime.now().year
    print(f"[sync-sales] START year={current_year} user={current_user.username}")

    # Build rep_code -> user_id map from existing CRM users
    rep_code_to_user_id = {
        u.representante_codigo: u.id
        for u in db.query(models.User).filter(models.User.representante_codigo.isnot(None)).all()
        if u.representante_codigo
    }

    # Build (sociedad, codigo) -> Client map for the entire CRM
    existing_clients = db.query(models.Client).all()
    existing_map = {}
    for c in existing_clients:
        if c.codigo_sumelga:
            existing_map[(c.sociedad, c.codigo_sumelga)] = c

    # Load Excel enrichment (CIF, address)
    excel_map = _load_excel_clients()

    # Open KPI DB in read-only mode
    try:
        kpi_conn = sqlite3.connect(f"file:{kpi_path}?mode=ro", uri=True)
        kpi_conn.row_factory = sqlite3.Row
        kpi_cur = kpi_conn.cursor()
        kpi_cur.execute(
            """
            SELECT c.codigo, c.razon_social, c.cif, c.representante, c.sociedad,
                   COALESCE(SUM(CASE WHEN v.anio = ? THEN v.importe ELSE 0 END), 0) as total_ventas,
                   COALESCE(SUM(CASE WHEN v.anio = ? THEN v.importe ELSE 0 END), 0) as total_ventas_anterior,
                   COALESCE(SUM(CASE WHEN v.anio = 2025 THEN v.importe ELSE 0 END), 0) as ventas_2025,
                   COALESCE(SUM(CASE WHEN v.anio = 2024 THEN v.importe ELSE 0 END), 0) as ventas_2024,
                   COALESCE(SUM(CASE WHEN v.anio = 2023 THEN v.importe ELSE 0 END), 0) as ventas_2023,
                   COUNT(CASE WHEN v.anio = ? THEN v.id END) as meses_con_venta
            FROM clientes c
            LEFT JOIN ventas_mensuales v
              ON c.id = v.cliente_id AND v.anio IN (2023, 2024, 2025, ?)
            GROUP BY c.id
            """,
            (current_year, current_year - 1, current_year, current_year),
        )
        kpi_rows = kpi_cur.fetchall()
        kpi_conn.close()
    except Exception as e:
        print(f"[sync-sales] ERROR reading KPI DB: {e}")
        raise HTTPException(status_code=500, detail=f"Error leyendo kpi_comercial.db: {e}")

    clients_to_add = []
    counts = {
        "updated": 0,
        "created": 0,
        "skipped": 0,
        "unchanged": 0,
        "new_without_rep": 0,
    }
    abc_changes = {
        "A_to_B": 0, "A_to_C": 0,
        "B_to_A": 0, "B_to_C": 0,
        "C_to_A": 0, "C_to_B": 0,
    }
    abc_distribution = {"A": 0, "B": 0, "C": 0}

    for row in kpi_rows:
        code_raw = row["codigo"]
        code = _clean_code(code_raw)
        if not code:
            counts["skipped"] += 1
            continue

        razon_social = (row["razon_social"] or "").strip() or f"Cliente {code}"
        rep_code = (row["representante"] or "").strip() or None
        sociedad_raw = (row["sociedad"] or "").strip()
        # KPI stores society in uppercase (SUMELGA, MEGANOR); normalize to title case
        sociedad = sociedad_raw.capitalize() if sociedad_raw else "Sumelga"
        if sociedad not in ("Sumelga", "Meganor"):
            sociedad = "Sumelga"  # safe default

        sales = float(row["total_ventas"] or 0.0)
        sales_anterior = float(row["total_ventas_anterior"] or 0.0)
        v_2025 = float(row["ventas_2025"] or 0.0)
        v_2024 = float(row["ventas_2024"] or 0.0)
        v_2023 = float(row["ventas_2023"] or 0.0)
        new_abc = _classify_abc(sales)
        abc_distribution[new_abc] += 1

        key = (sociedad, code)
        existing = existing_map.get(key)

        if existing is not None:
            old_abc = existing.clasificacion_abc or "C"
            changed = False
            if (abs((existing.volumen_ventas or 0.0) - sales) > 0.005 or 
                abs((existing.volumen_ventas_anterior or 0.0) - sales_anterior) > 0.005 or
                abs((existing.ventas_2025 or 0.0) - v_2025) > 0.005 or
                abs((existing.ventas_2024 or 0.0) - v_2024) > 0.005 or
                abs((existing.ventas_2023 or 0.0) - v_2023) > 0.005):
                
                existing.volumen_ventas = sales
                existing.volumen_ventas_anterior = sales_anterior
                existing.ventas_2025 = v_2025
                existing.ventas_2024 = v_2024
                existing.ventas_2023 = v_2023
                changed = True
            if old_abc != new_abc:
                existing.clasificacion_abc = new_abc
                change_key = f"{old_abc}_to_{new_abc}"
                if change_key in abc_changes:
                    abc_changes[change_key] += 1
                changed = True
            if changed:
                counts["updated"] += 1
            else:
                counts["unchanged"] += 1
        else:
            # Build new client (defaults mirror seed_users.py)
            comercial_id = rep_code_to_user_id.get(rep_code) if rep_code else None
            if comercial_id is None and rep_code:
                counts["new_without_rep"] += 1

            excel_match = excel_map.get((sociedad.lower(), code))
            if excel_match:
                cif_nif = excel_match["cif"]
                via = excel_match["via"]
                direccion = excel_match["direccion"]
                numero = excel_match["numero"]
                poblacion = excel_match["poblacion"]
                codigo_postal = excel_match["codigo_postal"]
            else:
                cif_nif = (row["cif"] or "").strip() if row["cif"] else ""
                via = ""
                direccion = "Dirección importada ERP"
                numero = ""
                poblacion = ""
                codigo_postal = ""

            new_client = models.Client(
                razon_social=razon_social,
                nombre_comercial=razon_social,
                cif_nif=cif_nif,
                codigo_sumelga=code,
                via=via,
                direccion=direccion,
                numero=numero,
                poblacion=poblacion,
                codigo_postal=codigo_postal,
                telefono="",
                web="",
                sociedad=sociedad,
                tipo_cliente="CLIENTE FINAL",
                sector="Industrial",
                clasificacion_abc=new_abc,
                volumen_ventas=sales,
                volumen_ventas_anterior=sales_anterior,
                ventas_2025=v_2025,
                ventas_2024=v_2024,
                ventas_2023=v_2023,
                comercial_id=comercial_id,
            )
            clients_to_add.append(new_client)
            counts["created"] += 1

    # Persist: flush new clients first so subsequent commits see them
    try:
        if clients_to_add:
            db.add_all(clients_to_add)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[sync-sales] COMMIT ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Error guardando cambios: {e}")

    duration_ms = int((time.time() - t0) * 1000)
    print(
        f"[sync-sales] DONE year={current_year} "
        f"updated={counts['updated']} created={counts['created']} "
        f"unchanged={counts['unchanged']} skipped={counts['skipped']} "
        f"new_without_rep={counts['new_without_rep']} duration={duration_ms}ms"
    )

    return JSONResponse({
        "ok": True,
        "year": current_year,
        "duration_ms": duration_ms,
        "kpi_clients_total": len(kpi_rows),
        **counts,
        "abc_distribution": abc_distribution,
        "abc_changes": abc_changes,
    })


# ----------------- STATIC SPA SERVING -----------------
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return FileResponse(os.path.join(STATIC_DIR, "logo_sumelga.png"))

@app.get("/")
def read_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# Mount files for access
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
