import os
import sqlite3
import unicodedata
from app.database import SessionLocal, engine, Base
from app import models
from datetime import date, timedelta

# Delete existing crm.db to force a clean, migrated recreate
if os.path.exists("crm.db"):
    try:
        os.remove("crm.db")
        print("Existing crm.db removed for clean schema migration.")
    except Exception as e:
        print(f"Warning: could not remove crm.db directly: {e}")

# Create all tables in crm.db
Base.metadata.create_all(bind=engine)

db = SessionLocal()

import pandas as pd

# Load Excel data for matching detailed CIF and address fields
meganor_excel_path = "/Users/agus/Developer/CRM/Listado de clientes Meganor.xlsx"
sumelga_excel_path = "/Users/agus/Developer/CRM/Listado de clientes Sumelga.xlsx"

excel_clients = {} # key: (sociedad_lower, code_str), value: dict of details

def clean_val(val):
    if pd.isna(val) or val is None:
        return ""
    return str(val).strip()

def clean_code(val):
    c = clean_val(val)
    if not c:
        return ""
    if c.isdigit():
        return f"{int(c):05d}"
    return c.zfill(5)

# Load Meganor Excel
if os.path.exists(meganor_excel_path):
    try:
        df_m = pd.read_excel(meganor_excel_path)
        for _, row in df_m.iterrows():
            c_code = clean_code(row.get('Cliente'))
            if c_code:
                cp_val = row.get('Distrito Postal')
                cp = str(int(cp_val)).strip() if isinstance(cp_val, float) else clean_val(cp_val)
                excel_clients[('meganor', c_code)] = {
                    'cif': clean_val(row.get('C.I.F.')),
                    'via': clean_val(row.get('Vía')),
                    'direccion': clean_val(row.get('Dirección')),
                    'numero': clean_val(row.get('Número')),
                    'poblacion': clean_val(row.get('Población')),
                    'codigo_postal': cp
                }
    except Exception as e:
        print(f"Error reading Meganor Excel in seed: {e}")

# Load Sumelga Excel
if os.path.exists(sumelga_excel_path):
    try:
        df_s = pd.read_excel(sumelga_excel_path)
        for _, row in df_s.iterrows():
            c_code = clean_code(row.get('Cliente'))
            if c_code:
                cp_val = row.get('Distrito Postal')
                cp = str(int(cp_val)).strip() if isinstance(cp_val, float) else clean_val(cp_val)
                excel_clients[('sumelga', c_code)] = {
                    'cif': clean_val(row.get('C.I.F.')),
                    'via': clean_val(row.get('Vía')),
                    'direccion': clean_val(row.get('Dirección')),
                    'numero': clean_val(row.get('Número')),
                    'poblacion': clean_val(row.get('Población')),
                    'codigo_postal': cp
                }
    except Exception as e:
        print(f"Error reading Sumelga Excel in seed: {e}")

print("Seeding database by importing users and clients from kpi_comercial.db...")

# 1. Connect to kpi_comercial.db (Read-Only)
kpi_db_path = "/Users/agus/Developer/KPI_Comercial/backend/kpi_comercial.db"
if not os.path.exists(kpi_db_path):
    print(f"Error: KPI database not found at {kpi_db_path}")
    db.close()
    exit(1)

kpi_conn = sqlite3.connect(kpi_db_path)
kpi_cursor = kpi_conn.cursor()

# 2. Seed default users first to keep IDs (1, 2, 3) and credentials
admin = models.User(
    username="admin",
    nombre="Agustín",
    apellidos="Admin",
    email="admin@sumelga.com",
    role="Administrador",
    password="admin123",
    is_active=True,
    representante_codigo="0001" # Maps to Enrique (0001) in KPI
)

comercial1 = models.User(
    username="carlos",
    nombre="Carlos",
    apellidos="Sanz",
    email="carlos@sumelga.com",
    role="Comercial",
    password="carlos123",
    is_active=True,
    representante_codigo="0002" # Maps to Rodrigo (0002) in KPI
)

comercial2 = models.User(
    username="sofia",
    nombre="Sofía",
    apellidos="Valiente",
    email="sofia@sumelga.com",
    role="Comercial",
    password="sofia123",
    is_active=True,
    representante_codigo="0003" # Maps to José Carlos (0003) in KPI
)

db.add_all([admin, comercial1, comercial2])
db.commit()
db.refresh(admin)
db.refresh(comercial1)
db.refresh(comercial2)

# Helper function to create clean usernames
def make_clean_username(name, code, existing_usernames):
    # Normalize accents
    n = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    n = "".join(c for c in n if c.isalnum()).lower()
    if not n or len(n) < 3:
        n = "comercial"
        
    username = n
    if username in existing_usernames:
        username = f"{n}_{code.lower()}"
    return username

# 3. Read and import commercials from KPI DB
kpi_cursor.execute("SELECT representante, nombre, email, activo FROM comerciales")
kpi_reps = kpi_cursor.fetchall()

existing_usernames = {"admin", "carlos", "sofia"}
rep_code_to_user_id = {
    "0001": admin.id,
    "0002": comercial1.id,
    "0003": comercial2.id
}

users_to_add = []
for rep_code, nombre, email, activo in kpi_reps:
    # Skip preseeded ones
    if rep_code in rep_code_to_user_id:
        continue
        
    username = make_clean_username(nombre, rep_code, existing_usernames)
    existing_usernames.add(username)
    
    # Split name into first and last name if possible
    parts = nombre.strip().split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else "Ventas"
    
    new_user = models.User(
        username=username,
        nombre=first_name,
        apellidos=last_name,
        email=email or f"{username}@sumelga.com",
        role="Comercial",
        password=f"comercial{rep_code}123", # standard default password pattern
        is_active=bool(activo),
        representante_codigo=rep_code
    )
    users_to_add.append(new_user)

if users_to_add:
    db.add_all(users_to_add)
    db.commit()
    # Populate mapping dict for foreign keys
    for u in users_to_add:
        db.refresh(u)
        rep_code_to_user_id[u.representante_codigo] = u.id

print(f"Imported {len(users_to_add)} additional commercial users from KPI database.")

# 4. Read and import clients from KPI DB (with accumulated sales volume)
kpi_cursor.execute("""
    SELECT c.codigo, c.razon_social, c.cif, c.representante, c.sociedad, SUM(v.importe) as total_ventas
    FROM clientes c
    LEFT JOIN ventas_mensuales v ON c.id = v.cliente_id
    GROUP BY c.id
""")
kpi_clients = kpi_cursor.fetchall()

clients_to_add = []
for code, razon_social, cif, representante, sociedad, total_ventas in kpi_clients:
    sales = float(total_ventas) if total_ventas is not None else 0.0
    
    # Assign ABC classification based on sales total
    if sales > 50000:
        abc = "A"
    elif sales > 10000:
        abc = "B"
    else:
        abc = "C"
        
    comercial_id = rep_code_to_user_id.get(representante)
    
    # In kpi_comercial.db, sociedad is stored in uppercase (SUMELGA, MEGANOR). 
    # Let's title-case it for CRM Sumelga's standard (Sumelga, Meganor)
    soc_name = sociedad.capitalize()
    
    # Try to match with Excel data
    excel_match = excel_clients.get((sociedad.lower(), code))
    if excel_match:
        cif_nif = excel_match['cif']
        via = excel_match['via']
        direccion = excel_match['direccion']
        numero = excel_match['numero']
        poblacion = excel_match['poblacion']
        codigo_postal = excel_match['codigo_postal']
    else:
        cif_nif = cif or ""
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
        sociedad=soc_name,
        tipo_cliente="CLIENTE FINAL",
        sector="Industrial",
        clasificacion_abc=abc,
        volumen_ventas=sales,
        comercial_id=comercial_id
    )
    clients_to_add.append(new_client)

# Perform bulk insert to make it extremely fast
db.bulk_save_objects(clients_to_add)
db.commit()
print(f"Imported {len(clients_to_add)} clients from KPI database.")

# 5. Fetch some of the imported clients to seed interactive mock data (contacts, visits, tasks)
# Carlos' clients: IBERPOMPE,S.L (code 00002, Sumelga) and JOYMA (code 00129, Sumelga)
# Sofia's clients: GRANITOS CABALEIRO (code 00161, Sumelga) and NESSAMAR (code 01663, Sumelga)
client_iberpompe = db.query(models.Client).filter(models.Client.codigo_sumelga == "00002", models.Client.sociedad == "Sumelga").first()
client_granitos = db.query(models.Client).filter(models.Client.codigo_sumelga == "00161", models.Client.sociedad == "Sumelga").first()
client_joyma = db.query(models.Client).filter(models.Client.codigo_sumelga == "00129", models.Client.sociedad == "Sumelga").first()
client_nessamar = db.query(models.Client).filter(models.Client.codigo_sumelga == "01663", models.Client.sociedad == "Sumelga").first()

# Safe fallback if codes don't match exactly
if not client_iberpompe: client_iberpompe = db.query(models.Client).filter(models.Client.comercial_id == comercial1.id).first()
if not client_granitos: client_granitos = db.query(models.Client).filter(models.Client.comercial_id == comercial2.id).first()
if not client_joyma: client_joyma = db.query(models.Client).filter(models.Client.comercial_id == comercial1.id).offset(1).first()
if not client_nessamar: client_nessamar = db.query(models.Client).filter(models.Client.comercial_id == comercial2.id).offset(1).first()

if client_iberpompe and client_granitos:
    print("Seeding mock interactions and contacts for active demo clients...")
    
    # 5.1 Create Contacts
    contact1 = models.Contact(
        client_id=client_iberpompe.id,
        nombre="Laura",
        apellidos="Martínez",
        email="l.martinez@iberpompe.es",
        movil="+34 607 112 233",
        cargo="Responsable de Compras",
        nivel_decision="Decisor",
        notas_personales="Muy meticulosa con los plazos de entrega."
    )
    
    contact2 = models.Contact(
        client_id=client_iberpompe.id,
        nombre="Francisco",
        apellidos="Sanz",
        email="f.sanz@iberpompe.es",
        movil="+34 607 445 566",
        linkedin="https://linkedin.com/in/francisco-sanz-iberpompe",
        cargo="Director General",
        nivel_decision="Prescriptor",
        notas_personales="Muy enfocado en la transición al coche eléctrico. Prefiere llamadas por la tarde."
    )
    
    contact3 = models.Contact(
        client_id=client_granitos.id,
        nombre="Carlos",
        apellidos="Gómez",
        email="carlos.gomez@granitoscabaleiro.com",
        movil="+34 688 990 011",
        cargo="Gerente de Operaciones",
        nivel_decision="Decisor",
        notas_personales="Contacto clave. Atento a las ofertas y descuentos."
    )
    
    contacts_list = [contact1, contact2, contact3]
    
    if client_joyma:
        contact4 = models.Contact(
            client_id=client_joyma.id,
            nombre="Alberto",
            apellidos="Jiménez",
            email="ajimenez@joyma.es",
            movil="+34 612 345 678",
            cargo="Jefe de Mantenimiento",
            nivel_decision="Usuario",
            notas_personales="Suele bloquear si requiere formación extra en repuestos."
        )
        contacts_list.append(contact4)
        
    db.add_all(contacts_list)
    db.commit()
    
    # 5.2 Create Visits & Attendees
    today = date.today()
    yesterday = today - timedelta(days=1)
    tomorrow = today + timedelta(days=2)
    next_week = today + timedelta(days=4)
    
    visit1 = models.Visit(
        client_id=client_iberpompe.id,
        fecha=yesterday.isoformat(),
        hora="10:30",
        duracion=45,
        tipo_visita="Presencial",
        acompanantes_internos="Soporte Técnico (Marcos)",
        objetivo="Presentación de la nueva gama de conectores y seguimiento de oferta",
        puntos_tratados="Francisco Sanz mostró gran interés en la durabilidad. Laura Martínez solicitó desglose de precios.",
        conclusiones="Favorable. Enviaremos oferta económica desglosada."
    )
    visit1.attendees = [contact1, contact2]
    
    visit2 = models.Visit(
        client_id=client_granitos.id,
        fecha=today.isoformat(),
        hora="16:00",
        duracion=30,
        tipo_visita="Teams/Zoom",
        objetivo="Revisión de plazos del pedido en curso y renovación del catálogo anual",
        puntos_tratados="Se resolvió la duda del transporte marítimo y aduanas.",
        conclusiones="Exitoso. Pedido en marcha."
    )
    visit2.attendees = [contact3]
    
    visit3 = models.Visit(
        client_id=client_iberpompe.id,
        fecha=next_week.isoformat(),
        hora="11:00",
        duracion=60,
        tipo_visita="Presencial",
        acompanantes_internos="Ingeniería Comercial (Sandra)",
        objetivo="Reunión técnica inicial de preventa y toma de requerimientos",
        puntos_tratados="Revisión de las instalaciones de mantenimiento y almacén de repuestos.",
        conclusiones="Agendada con éxito."
    )
    
    db.add_all([visit1, visit2, visit3])
    db.commit()
    db.refresh(visit1)
    db.refresh(visit2)
    db.refresh(visit3)
    
    # 5.3 Create Tasks
    task1 = models.Task(
        client_id=client_iberpompe.id,
        visit_id=visit1.id,
        descripcion="Enviar oferta de conectores adaptada con el desglose de precios solicitado por Laura",
        estado="Pendiente",
        prioridad="Alta",
        fecha_creacion=yesterday.isoformat(),
        fecha_limite=today.isoformat()
    )
    
    task2 = models.Task(
        client_id=client_granitos.id,
        visit_id=visit2.id,
        descripcion="Enviar confirmación por escrito del plazo de transporte marítimo a Carlos Gómez",
        estado="Pendiente",
        prioridad="Media",
        fecha_creacion=today.isoformat(),
        fecha_limite=tomorrow.isoformat()
    )
    
    task3 = models.Task(
        client_id=client_iberpompe.id,
        visit_id=visit1.id,
        descripcion="Llamar a Francisco Sanz para cerrar fecha de pruebas físicas del conector rápido en su taller",
        estado="En Progreso",
        prioridad="Alta",
        fecha_creacion=yesterday.isoformat(),
        fecha_limite=next_week.isoformat()
    )
    
    tasks_to_add = [task1, task2, task3]
    
    if client_nessamar:
        task4 = models.Task(
            client_id=client_nessamar.id,
            descripcion="Contacto inicial para revisar acuerdo marco de colaboración tecnológica",
            estado="Completada",
            prioridad="Baja",
            fecha_creacion=(today - timedelta(days=10)).isoformat(),
            fecha_limite=yesterday.isoformat()
        )
        tasks_to_add.append(task4)
        
    db.add_all(tasks_to_add)
    db.commit()

    # 6. Read and import offers from Excel file for Sumelga clients
    offers_excel_path = "/Users/agus/Developer/CRM/Listado ofertas 2026 01_07_26.xlsx"
    if os.path.exists(offers_excel_path):
        print("Importing offers from Excel...")
        try:
            # Map of Sumelga client codes to client IDs
            sumelga_clients_map = {c.codigo_sumelga: c.id for c in db.query(models.Client).filter(models.Client.sociedad == "Sumelga").all()}
            
            df_o = pd.read_excel(offers_excel_path)
            offers_to_add = []
            for _, row in df_o.iterrows():
                off_num = clean_val(row.get('Oferta'))
                if not off_num:
                    continue
                    
                cli_code_raw = row.get('Cli./Pot.')
                if pd.isna(cli_code_raw) or cli_code_raw is None:
                    continue
                c_str = str(cli_code_raw).strip()
                if c_str.isdigit():
                    c_code = f"{int(c_str):05d}"
                else:
                    c_code = c_str.zfill(5)
                    
                # Date handling
                date_val = row.get('F. Oferta')
                date_str = ""
                if pd.notna(date_val):
                    if hasattr(date_val, 'strftime'):
                        date_str = date_val.strftime('%Y-%m-%d')
                    else:
                        date_str = str(date_val).split(' ')[0]
                
                # Numeric values
                total_val = row.get('Total Importe')
                total = float(total_val) if pd.notna(total_val) else 0.0
                
                margen_val = row.get('Margen')
                margen = float(margen_val) if pd.notna(margen_val) else 0.0
                
                coste_val = row.get('Coste')
                coste = float(coste_val) if pd.notna(coste_val) else 0.0
                
                new_offer = models.Offer(
                    numero_oferta=off_num,
                    descripcion=clean_val(row.get('Descripción')),
                    cliente_codigo=c_code,
                    cliente_nombre=clean_val(row.get('Razón Social')),
                    comercial_codigo=clean_val(row.get('Ag. Com.')),
                    referencia=clean_val(row.get('Referencia')),
                    fecha_creacion=date_str,
                    situacion=clean_val(row.get('Situación')) or "P",
                    campo_i=clean_val(row.get('Proc.')),
                    total=total,
                    margen=margen,
                    coste=coste,
                    client_id=sumelga_clients_map.get(c_code),
                    sociedad="Sumelga"
                )
                offers_to_add.append(new_offer)
                
            if offers_to_add:
                db.bulk_save_objects(offers_to_add)
                db.commit()
                print(f"Imported {len(offers_to_add)} offers from Excel.")
        except Exception as e:
            print(f"Error reading offers Excel in seed: {e}")
    else:
        print("Offers Excel file not found at", offers_excel_path)

print(f"Database migrated and seeded successfully!")
print(f"Created Users: Agustín (Admin), Carlos (Comercial), Sofía (Comercial) + {len(rep_code_to_user_id)-3} dynamic Comerciales.")
print("Database seeding completed.")

kpi_conn.close()
db.close()
