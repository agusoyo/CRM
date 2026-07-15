import sqlite3
import os

def run():
    db_path = os.path.abspath("crm.db")
    if not os.path.exists(db_path):
        print("crm.db no encontrado.")
        return

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("ALTER TABLE clients ADD COLUMN volumen_ventas_anterior FLOAT DEFAULT 0.0;")
        print("Migración completada con éxito: se ha añadido 'volumen_ventas_anterior'.")
    except Exception as e:
        print(f"La migración falló o la columna ya existe: {e}")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    run()
