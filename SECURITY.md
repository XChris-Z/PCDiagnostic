# Política de Seguridad y Modelo de Permisos

## 1. Alcance de Interrogación y Privilegios

**OmniCheck PC** es una suite de diagnóstico de hardware orientada a auditoría técnica y talleres de soporte. 

### 1.1 Modelo de Ejecución (Solo Lectura)
- Todas las operaciones de sondeo de hardware (WMI, CIM, `sysinfo`, `Win32_System_Power`, `Get-CimInstance`) son **estrictamente de solo lectura**.
- El software **no modifica** variables NVRAM/UEFI, tablas ACPI, configuraciones de overclocking ni registros del núcleo del sistema operativo.
- La prueba de estrés de memoria RAM se ejecuta en un buffer de espacio de usuario aislado en memoria virtual asignada dinámicamente mediante Rust (`Vec<u8>`), sin tocar espacio de memoria reservado por el kernel o de otros procesos.

### 1.2 Privilegios de Administrador (UAC)
- OmniCheck PC puede ejecutarse con privilegios estándar de usuario.
- Ciertos datos de telemetría física (como atributos SMART a bajo nivel de ciertos controladores NVMe o estado de Secure Boot en configuraciones corporativas) pueden requerir privilegios de administrador (`Run as Administrator`) para ser expuestos por el subsistema WMI/CIM de Windows.
- La aplicación indica visualmente al técnico si la sesión actual cuenta con elevación (`is_admin: true/false`).

### 1.3 Privacidad y Telemetría Externa
- **Cero Telemetría Externa:** OmniCheck PC opera 100% de manera local y offline (*air-gapped compatible*).
- Los identificadores de hardware, números de serie de placa base o direcciones MAC recopilados para el informe técnico permanecen únicamente en la memoria local de la aplicación y en los reportes HTML que el usuario decida guardar voluntariamente en su disco local.
- No existen dependencias de analítica web, telemetría remota ni envíos a servidores externos.

---

## 2. Reporte de Vulnerabilidades

Si descubres una posible vulnerabilidad de seguridad o un vector de denegación de servicio local:
1. Por favor, **no abras un issue público** en GitHub.
2. Envía un reporte detallado con los pasos de reproducción al mantenedor del repositorio o mediante los canales de divulgación privada de GitHub Security Advisories.
3. Se revisará el reporte y se proporcionará un parche en una versión correctiva.
