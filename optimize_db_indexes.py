#!/usr/bin/env python3
"""
optimize_db_indexes.py
======================
Aplica índices optimizados sobre crm.db para mejorar el rendimiento
de las consultas más frecuentes del CRM Sumelga.

Ejecutar: python3 optimize_db_indexes.py

Es SEGURO ejecutar sobre una base de datos existente con datos reales:
- Usa IF NOT EXISTS en todos los índices para ser idempotente.
- No modifica ni elimina ningún registro.
- Solo añade estructuras de búsqueda sin alterar los datos.
"""

import sqlite3
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "crm.db")

# ===========================================================================
# DEFINICIÓN DE ÍNDICES
# Formato: (nombre, tabla, columnas, descripción)
# ===========================================================================
INDEXES = [

    # ─── clients ─────────────────────────────────────────────────────────────
    ("idx_clients_razon_social",       "clients", ["razon_social"],             "Búsqueda por nombre de empresa"),
    ("idx_clients_sociedad",           "clients", ["sociedad"],                  "Filtro por sociedad"),
    ("idx_clients_sector",             "clients", ["sector"],                    "Filtro por sector"),
    ("idx_clients_tipo_cliente",       "clients", ["tipo_cliente"],              "Filtro por tipo de cliente"),
    ("idx_clients_clasificacion",      "clients", ["clasificacion_abc"],         "Filtro por clasificación ABC"),
    ("idx_clients_comercial_id",       "clients", ["comercial_id"],              "FK comercial asignado"),
    ("idx_clients_sociedad_sector",    "clients", ["sociedad", "sector"],        "Filtro combinado sociedad+sector"),
    ("idx_clients_sociedad_comercial", "clients", ["sociedad", "comercial_id"],  "Cartera por comercial y sociedad"),
    ("idx_clients_volumen_ventas",     "clients", ["volumen_ventas"],            "Ordenación por volumen de ventas"),

    # ─── visits ──────────────────────────────────────────────────────────────
    ("idx_visits_client_id",           "visits",  ["client_id"],                "FK visitas de un cliente"),
    ("idx_visits_fecha",               "visits",  ["fecha"],                    "Filtro por fecha de visita"),
    ("idx_visits_tipo_visita",         "visits",  ["tipo_visita"],              "Filtro por tipo de visita"),
    ("idx_visits_client_fecha",        "visits",  ["client_id", "fecha"],       "Visitas de cliente ordenadas por fecha"),
    ("idx_visits_fecha_client",        "visits",  ["fecha", "client_id"],       "Agenda semanal y mensual"),

    # ─── tasks ───────────────────────────────────────────────────────────────
    ("idx_tasks_client_id",            "tasks",   ["client_id"],                "FK tareas de un cliente"),
    ("idx_tasks_visit_id",             "tasks",   ["visit_id"],                 "FK visita origen de tarea"),
    ("idx_tasks_estado",               "tasks",   ["estado"],                   "Filtro por estado de tarea"),
    ("idx_tasks_prioridad",            "tasks",   ["prioridad"],                "Ordenación por prioridad"),
    ("idx_tasks_fecha_limite",         "tasks",   ["fecha_limite"],             "Filtro tareas vencidas/urgentes"),
    ("idx_tasks_estado_fecha",         "tasks",   ["estado", "fecha_limite"],   "Kanban y alertas de vencimiento"),
    ("idx_tasks_client_estado",        "tasks",   ["client_id", "estado"],      "Tareas activas de un cliente"),

    # ─── contacts ────────────────────────────────────────────────────────────
    ("idx_contacts_client_id",         "contacts", ["client_id"],               "FK contactos de un cliente"),
    ("idx_contacts_nivel_decision",    "contacts", ["nivel_decision"],          "Filtro por nivel de decisión"),

    # ─── offers ──────────────────────────────────────────────────────────────
    ("idx_offers_client_id",           "offers",  ["client_id"],                "FK ofertas de un cliente"),
    ("idx_offers_sociedad",            "offers",  ["sociedad"],                 "Filtro por sociedad en ofertas"),
    ("idx_offers_situacion",           "offers",  ["situacion"],                "Filtro por estado de oferta"),
    ("idx_offers_cliente_codigo",      "offers",  ["cliente_codigo"],           "Búsqueda por código de cliente ERP"),
    ("idx_offers_numero",              "offers",  ["numero_oferta"],            "Búsqueda por número de oferta"),
    ("idx_offers_fecha",               "offers",  ["fecha_creacion"],           "Ordenación por fecha de oferta"),
    ("idx_offers_client_situacion",    "offers",  ["client_id", "situacion"],   "Ofertas activas/cerradas de cliente"),
    ("idx_offers_sociedad_codigo",     "offers",  ["sociedad", "cliente_codigo"], "Cruce ERP por sociedad"),

    # ─── visit_attachments ───────────────────────────────────────────────────
    ("idx_attachments_visit_id",       "visit_attachments", ["visit_id"],       "FK adjuntos de una visita"),

    # ─── users ───────────────────────────────────────────────────────────────
    ("idx_users_role",                 "users",   ["role"],                     "Filtro por rol de usuario"),
    ("idx_users_is_active",            "users",   ["is_active"],                "Filtro por estado activo"),
    ("idx_users_role_active",          "users",   ["role", "is_active"],        "Comerciales activos por rol"),
]


def build_create_sql(name, table, columns):
    cols = ", ".join(columns)
    return f"CREATE INDEX IF NOT EXISTS {name} ON {table} ({cols});"


def run():
    if not os.path.exists(DB_PATH):
        print(f"❌ Base de datos no encontrada en: {DB_PATH}")
        print("   Ejecuta primero: python3 seed_users.py")
        return

    print("=" * 60)
    print("  Optimización de Índices — CRM Sumelga")
    print("=" * 60)
    print(f"  BD: {DB_PATH}\n")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    cursor = conn.cursor()

    ok = 0
    errors = []

    for (name, table, columns, desc) in INDEXES:
        sql = build_create_sql(name, table, columns)
        t0 = time.perf_counter()
        try:
            cursor.execute(sql)
            elapsed = (time.perf_counter() - t0) * 1000
            print(f"  ✅ [{elapsed:6.1f} ms]  {name}")
            print(f"           → {table}({', '.join(columns)})  —  {desc}")
            ok += 1
        except sqlite3.Error as e:
            elapsed = (time.perf_counter() - t0) * 1000
            print(f"  ❌ [{elapsed:6.1f} ms]  {name}  →  {e}")
            errors.append((name, str(e)))

    conn.commit()

    print("\n  📊 Actualizando estadísticas del planificador (ANALYZE)...")
    t0 = time.perf_counter()
    conn.execute("ANALYZE;")
    conn.commit()
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"     Completado en {elapsed:.1f} ms")

    print("\n  🗜️  Compactando base de datos (VACUUM)...")
    t0 = time.perf_counter()
    conn.execute("VACUUM;")
    conn.commit()
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"     Completado en {elapsed:.1f} ms")

    conn.close()

    print("\n" + "=" * 60)
    print(f"  Resultado: {ok}/{len(INDEXES)} índices aplicados correctamente")
    if errors:
        print(f"  ⚠️  {len(errors)} errores:")
        for n, e in errors:
            print(f"     - {n}: {e}")
    else:
        print("  ✅ Sin errores.")
    print("=" * 60)

    conn2 = sqlite3.connect(DB_PATH)
    rows = conn2.execute(
        "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name;"
    ).fetchall()
    conn2.close()

    print(f"\n  📑 Total de índices en la BD: {len(rows)}")
    current_table = None
    for (idx_name, tbl) in rows:
        if tbl != current_table:
            print(f"\n  [{tbl}]")
            current_table = tbl
        print(f"    · {idx_name}")
    print()


if __name__ == "__main__":
    run()
