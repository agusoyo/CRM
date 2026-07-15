import sqlite3
import os
import pandas as pd

def migrate_and_update():
    db_path = "/Users/agus/Developer/CRM/crm.db"
    meganor_path = "/Users/agus/Developer/CRM/Listado de clientes Meganor.xlsx"
    sumelga_path = "/Users/agus/Developer/CRM/Listado de clientes Sumelga.xlsx"

    print("--- Database Migration & Population ---")
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return

    # 1. Connect to SQLite DB
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 2. Inspect clients table columns
    cursor.execute("PRAGMA table_info(clients)")
    existing_cols = [col[1] for col in cursor.fetchall()]
    
    new_cols = {
        'via': 'VARCHAR',
        'numero': 'VARCHAR',
        'poblacion': 'VARCHAR',
        'codigo_postal': 'VARCHAR'
    }

    # 3. Add columns if missing
    for col_name, col_type in new_cols.items():
        if col_name not in existing_cols:
            print(f"Adding column '{col_name}' to 'clients' table...")
            cursor.execute(f"ALTER TABLE clients ADD COLUMN {col_name} {col_type}")
            conn.commit()
        else:
            print(f"Column '{col_name}' already exists.")

    # 4. Load Excel files
    print("\nReading Excel files...")
    
    # Meganor
    try:
        df_meganor = pd.read_excel(meganor_path)
        print(f"Loaded {len(df_meganor)} records from Meganor Excel.")
    except Exception as e:
        print(f"Error reading Meganor Excel: {e}")
        df_meganor = pd.DataFrame()

    # Sumelga
    try:
        df_sumelga = pd.read_excel(sumelga_path)
        print(f"Loaded {len(df_sumelga)} records from Sumelga Excel.")
    except Exception as e:
        print(f"Error reading Sumelga Excel: {e}")
        df_sumelga = pd.DataFrame()

    # Helper function to clean text / handle NaN
    def clean_val(val):
        if pd.isna(val) or val is None:
            return ""
        return str(val).strip()

    # 5. Populate Meganor clients in DB
    print("\nUpdating Meganor clients...")
    meganor_updated = 0
    for _, row in df_meganor.iterrows():
        client_code = clean_val(row.get('Cliente'))
        if not client_code:
            continue
        # Format code to 5 digits
        if client_code.isdigit():
            client_code = f"{int(client_code):05d}"
        else:
            client_code = client_code.zfill(5)

        cif = clean_val(row.get('C.I.F.'))
        via = clean_val(row.get('Vía'))
        direccion = clean_val(row.get('Dirección'))
        numero = clean_val(row.get('Número'))
        poblacion = clean_val(row.get('Población'))
        
        # Postal code might be read as float/int
        cp_val = row.get('Distrito Postal')
        if pd.isna(cp_val) or cp_val is None:
            cp = ""
        elif isinstance(cp_val, float):
            cp = str(int(cp_val)).strip()
        else:
            cp = str(cp_val).strip()

        # Update in database
        cursor.execute("""
            UPDATE clients 
            SET cif_nif = ?, via = ?, direccion = ?, numero = ?, poblacion = ?, codigo_postal = ?
            WHERE sociedad = 'Meganor' AND codigo_sumelga = ?
        """, (cif, via, direccion, numero, poblacion, cp, client_code))
        
        if cursor.rowcount > 0:
            meganor_updated += 1

    print(f"Updated {meganor_updated} Meganor clients in DB.")

    # 6. Populate Sumelga clients in DB
    print("\nUpdating Sumelga clients...")
    sumelga_updated = 0
    for _, row in df_sumelga.iterrows():
        client_code = clean_val(row.get('Cliente'))
        if not client_code:
            continue
        # Format code to 5 digits
        if client_code.isdigit():
            client_code = f"{int(client_code):05d}"
        else:
            client_code = client_code.zfill(5)

        cif = clean_val(row.get('C.I.F.'))
        via = clean_val(row.get('Vía'))
        direccion = clean_val(row.get('Dirección'))
        numero = clean_val(row.get('Número'))
        poblacion = clean_val(row.get('Población'))
        
        cp_val = row.get('Distrito Postal')
        if pd.isna(cp_val) or cp_val is None:
            cp = ""
        elif isinstance(cp_val, float):
            cp = str(int(cp_val)).strip()
        else:
            cp = str(cp_val).strip()

        # Update in database
        cursor.execute("""
            UPDATE clients 
            SET cif_nif = ?, via = ?, direccion = ?, numero = ?, poblacion = ?, codigo_postal = ?
            WHERE sociedad = 'Sumelga' AND codigo_sumelga = ?
        """, (cif, via, direccion, numero, poblacion, cp, client_code))
        
        if cursor.rowcount > 0:
            sumelga_updated += 1

    print(f"Updated {sumelga_updated} Sumelga clients in DB.")

    conn.commit()
    conn.close()
    print("\nMigration completed successfully!")

if __name__ == "__main__":
    migrate_and_update()
