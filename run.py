import os
import sys
import subprocess
import time
import socket
import uvicorn

def get_local_ip():
    """Obtiene la dirección IP local de la máquina conectada a la red."""
    try:
        # Crea un socket dummy para determinar la interfaz de red activa
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def clear_port(port):
    print("====================================================")
    print("    CRM Sumelga - Inicializador Inteligente de App  ")
    print("====================================================")
    print(f"Verificando si el puerto {port} está ocupado...")
    
    # Solo intentamos liberar puertos en plataformas tipo Unix (macOS, Linux)
    if os.name == "posix":
        try:
            # Ejecuta lsof para obtener los PIDs escuchando en el puerto
            output = subprocess.check_output(["lsof", "-t", "-i", f":{port}"])
            pids = [line.strip() for line in output.decode().split("\n") if line.strip()]
            
            # Excluye nuestro propio PID
            my_pid = str(os.getpid())
            pids_to_kill = [pid for pid in pids if pid != my_pid]
            
            if pids_to_kill:
                print(f"Detectados procesos residuales en puerto {port}: {', '.join(pids_to_kill)}")
                print(f"Liberando puerto {port} automáticamente...")
                for pid in pids_to_kill:
                    try:
                        subprocess.call(["kill", "-9", pid])
                    except Exception as e:
                        print(f"No se pudo terminar PID {pid}: {e}")
                time.sleep(1)
                print(f"✓ Puerto {port} liberado correctamente.")
            else:
                print(f"✓ Puerto {port} libre de conflictos.")
                
        except subprocess.CalledProcessError:
            # lsof devuelve código 1 si no encuentra procesos, lo que significa que el puerto está libre
            print(f"✓ El puerto {port} está libre de conflictos.")
        except Exception as e:
            print(f"Advertencia al verificar el puerto: {e}")
    else:
        print(f"✓ Comprobación de puerto omitida en Windows (puerto por defecto: {port}).")

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    
    # Análisis simple de argumentos por línea de comandos
    if "--external" in sys.argv:
        host = "0.0.0.0"
        
    for i in range(len(sys.argv)):
        if sys.argv[i] == "--host" and i + 1 < len(sys.argv):
            host = sys.argv[i+1]
        elif sys.argv[i].startswith("--host="):
            host = sys.argv[i].split("=")[1]
        elif sys.argv[i] == "--port" and i + 1 < len(sys.argv):
            try:
                port = int(sys.argv[i+1])
            except ValueError:
                pass
        elif sys.argv[i].startswith("--port="):
            try:
                port = int(sys.argv[i].split("=")[1])
            except ValueError:
                pass

    clear_port(port)
    
    # Comprobar si se pasó el flag --seed para repoblar la base de datos
    if "--seed" in sys.argv:
        print("\n[BD] Detectada opción '--seed'. Reconstruyendo base de datos...")
        try:
            subprocess.call([sys.executable, "seed_users.py"])
            print("✓ Base de datos reconstruida y seedeada.")
        except Exception as e:
            print(f"Error al sembrar la base de datos: {e}")
        
    print("\nIniciando servidor de desarrollo CRM Sumelga...")
    if host == "0.0.0.0":
        local_ip = get_local_ip()
        print(f"Dirección local: http://127.0.0.1:{port}")
        if local_ip != "127.0.0.1":
            print(f"Dirección externa (red local): http://{local_ip}:{port}")
    else:
        print(f"Dirección de la aplicación: http://{host}:{port}")
    print("----------------------------------------------------")
    
    uvicorn.run("app.main:app", host=host, port=port, reload=True)

