# Guía de Contribución a OmniCheck PC

Gracias por tu interés en contribuir a **OmniCheck PC**. Este documento describe el flujo de trabajo técnico, estándares de código y directrices de arquitectura para mantener la robustez y bajo impacto en recursos del sistema.

---

## 1. Arquitectura del Proyecto

El sistema está desacoplado en dos capas principales comunicadas mediante IPC binario seguro de Tauri v2:

1. **Núcleo de Sistema / Backend (Rust - `src-tauri/`)**:
   - `src-tauri/src/hardware/`: Módulos de interrogación de bajo nivel (CPU, RAM, Discos/SMART, GPU, Placa Base, Batería, Seguridad, Red).
   - `src-tauri/src/hardware/evaluator.rs`: Motor determinista de cálculo de score de salud (0–100) y generación de recomendaciones técnicas.
   - `src-tauri/src/report_pdf.rs`: Generador de informes técnicos HTML imprimibles a estándar vectorial.
   - `src-tauri/src/utils.rs`: Helpers de invocación de subprocesos con bandera `CREATE_NO_WINDOW (0x08000000)`.

2. **Capa de Presentación / Frontend (React 19 + TypeScript - `src/`)**:
   - `src/components/cards/`: Tarjetas modulares de telemetría de cada subsistema.
   - `src/components/modals/`: Modales de informe técnico, previsualización de impresión y metadatos de taller.
   - `src/types/diagnostics.ts`: Tipos TypeScript sincronizados con los esquemas Serde de Rust en `src-tauri/src/models.rs`.

---

## 2. Requisitos de Desarrollo

- **Rust**: Canal estable (1.78+ recomendado) con target `x86_64-pc-windows-msvc`.
- **Node.js**: v20 o v22 LTS con gestor `npm`.
- **Compilador C++**: Microsoft C++ Build Tools (incluido en Visual Studio Installer con carga de trabajo de C++).
- **WebView2**: Runtime de Microsoft Edge WebView2 (preinstalado en Windows 10/11).

---

## 3. Flujo de Trabajo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/XChris-Z/omnicheck-pc.git
cd omnicheck-pc

# 2. Instalar dependencias del frontend
npm install

# 3. Iniciar el entorno en modo desarrollo con Hot-Reload (Vite + Tauri dev)
npm run tauri dev
```

---

## 4. Estándares Técnicos y Reglas de Implementación

### 4.1 Invocación de Procesos de Sistema (Rust)
- **Prohibido ventanas emergentes:** Toda invocación a utilidades nativas (`powershell`, `cmd`, `wmic`) **debe** utilizar `crate::utils::new_hidden_command()` para garantizar la bandera `0x08000000 (CREATE_NO_WINDOW)`.
- **Manejo de Errores Silencioso / No Pánico:** Ninguna llamada de sondeo de hardware debe provocar un `panic!`. Toda función debe retornar tipos `Option<T>` o fallbacks razonables en caso de que un sensor de temperatura o contador de rendimiento no esté expuesto por el OEM.
- **Tipado Fuerte:** Cualquier nuevo campo añadido a los modelos en `models.rs` debe ser replicado fielmente en `src/types/diagnostics.ts`.

### 4.2 Integridad del Módulo de Evaluación (`evaluator.rs`)
- La matriz de puntaje suma exactamente **100 puntos** distribuidos en 6 pilares:
  - CPU: 20 pts
  - RAM: 20 pts
  - Almacenamiento & SMART: 20 pts
  - GPU: 15 pts
  - Seguridad & SO: 15 pts
  - Placa Base / BIOS: 10 pts
- Si introduces una nueva penalización, documenta el fundamento técnico y los umbrales de severidad (`Optimal`, `Warning`, `Critical`).

---

## 5. Verificación y Validación antes de Enviar PR

Antes de abrir un Pull Request, ejecuta la batería de validación local:

```bash
# 1. Comprobar tipado y build del frontend
npm run build

# 2. Comprobar compilación del backend Rust
cd src-tauri
cargo check
cargo test
cargo clippy -- -D warnings
cd ..
```

---

## 6. Convención de Commits

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(hardware)`: Nueva telemetría o sensor.
- `fix(evaluator)`: Corrección en cálculos de desgaste o puntuación.
- `perf(memory)`: Optimización en pruebas de rendimiento o sondeo.
- `docs`: Mejoras a la documentación técnica.
