use crate::models::{HealthStatus, SystemDiagnostics};
use std::fs;
use std::path::PathBuf;

pub fn generate_html_report(diag: &SystemDiagnostics) -> String {
    let (banner_bg, banner_border, banner_text, verdict_title, verdict_badge_class, verdict_badge_text) = match diag.health_status {
        HealthStatus::Optimal => (
            "#ecfdf5",
            "#10b981",
            "#065f46",
            "EQUIPO EN ESTADO ÓPTIMO / CONFORMIDAD TOTAL",
            "optimal",
            "ESTADO ÓPTIMO",
        ),
        HealthStatus::Warning => (
            "#fffbeb",
            "#f59e0b",
            "#92400e",
            "REQUIERE MANTENIMIENTO PREVENTIVO",
            "warning",
            "PRECAUCIÓN",
        ),
        HealthStatus::Critical => (
            "#fef2f2",
            "#ef4444",
            "#991b1b",
            "FALLA CRÍTICA DETECTADA / ATENCIÓN URGENTE",
            "critical",
            "CRÍTICO",
        ),
    };

    let display_pc = diag
        .custom_pc_name
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or(&diag.hostname);

    let client_line = diag
        .client_name
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .map(|c| format!("<strong>Cliente:</strong> {}<br>", c))
        .unwrap_or_default();

    let technician_name = diag
        .technician_name
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or("Técnico Especialista de Taller");

    let notes_block = diag
        .service_notes
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .map(|notes| {
            format!(
                r#"<div class="section">
                    <h3>Notas y Observaciones del Servicio de Taller</h3>
                    <div class="service-notes-box">
                        {}
                    </div>
                </div>"#,
                notes.replace('\n', "<br>")
            )
        })
        .unwrap_or_default();


    let mut gpu_rows = String::new();
    for g in &diag.gpus {
        let temp_str = g
            .temperature_c
            .map(|t| format!("{:.1}°C", t))
            .unwrap_or_else(|| "N/A (Normal)".to_string());
        gpu_rows.push_str(&format!(
            r#"<tr>
                <td><strong>{}</strong> ({})</td>
                <td>{} MB</td>
                <td>{}</td>
                <td>{}</td>
                <td><span class="badge badge-{}">{:?}</span></td>
            </tr>"#,
            g.name,
            if g.is_dedicated { "Dedicada" } else { "Integrada" },
            g.vram_total_mb,
            g.driver_version,
            temp_str,
            format!("{:?}", g.health).to_lowercase(),
            g.health
        ));
    }

    let mut disk_rows = String::new();
    for d in &diag.storage {
        let temp_str = d
            .temperature_c
            .map(|t| format!("{:.1}°C", t))
            .unwrap_or_else(|| "Nominal".to_string());
        disk_rows.push_str(&format!(
            r#"<tr>
                <td><strong>{}</strong> ({})</td>
                <td>{:.1} GB ({:.1} GB Libres)</td>
                <td>{} / {}</td>
                <td>{} | Temp: {}</td>
                <td><span class="badge badge-{}">{:?}</span></td>
            </tr>"#,
            d.name,
            d.mount_point,
            d.total_gb,
            d.free_gb,
            d.media_type,
            d.bus_type,
            d.smart_status,
            temp_str,
            format!("{:?}", d.health).to_lowercase(),
            d.health
        ));
    }

    let mut net_rows = String::new();
    for n in &diag.network {
        net_rows.push_str(&format!(
            r#"<tr>
                <td><strong>{}</strong></td>
                <td>{}</td>
                <td>{}</td>
                <td>{:.1} MB / {:.1} MB</td>
            </tr>"#,
            n.name, n.ip_address, n.mac_address, n.received_mb, n.transmitted_mb
        ));
    }

    let mut rec_rows = String::new();
    for r in &diag.recommendations {
        rec_rows.push_str(&format!(
            r#"<div class="recommendation-card border-{}">
                <div class="rec-header">
                    <span class="badge badge-{}">{:?}</span>
                    <strong>{} — {}</strong>
                </div>
                <p class="rec-desc">{}</p>
                <p class="rec-action"><strong>Acción sugerida:</strong> {}</p>
            </div>"#,
            format!("{:?}", r.severity).to_lowercase(),
            format!("{:?}", r.severity).to_lowercase(),
            r.severity,
            r.component,
            r.title,
            r.description,
            r.action
        ));
    }

    let battery_block = if let Some(ref b) = diag.battery {
        format!(
            r#"<div class="section">
                <h3>6. Batería y Autonomía (Equipo Portátil)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nivel de Carga</th>
                            <th>Capacidad de Diseño</th>
                            <th>Capacidad Real Actual</th>
                            <th>Desgaste (% Wear Level)</th>
                            <th>Ciclos Estimados</th>
                            <th>Diagnóstico</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{}% {}</td>
                            <td>{} mWh</td>
                            <td>{} mWh</td>
                            <td>{}%</td>
                            <td>{}</td>
                            <td><span class="badge badge-{}">{:?}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>"#,
            b.charge_pct,
            if b.is_charging { "(Cargando)" } else { "(Descargando)" },
            b.design_capacity_mwh.map(|v| v.to_string()).unwrap_or_else(|| "N/A".to_string()),
            b.full_charge_capacity_mwh.map(|v| v.to_string()).unwrap_or_else(|| "N/A".to_string()),
            b.wear_level_pct.map(|v| format!("{:.1}", v)).unwrap_or_else(|| "0.0".to_string()),
            b.cycle_count.map(|v| v.to_string()).unwrap_or_else(|| "N/A".to_string()),
            format!("{:?}", b.health).to_lowercase(),
            b.health
        )
    } else {
        r#"<!-- Batería omitida automáticamente: PC de Escritorio (Desktop) -->"#.to_string()
    };

    let cpu_temp_str = diag
        .cpu
        .temperature_c
        .map(|t| format!("{:.1}°C", t))
        .unwrap_or_else(|| "Nominal (Sensores ACPI)".to_string());

    format!(
        r#"<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Diagnóstico - OmniCheck PC - {display_pc}</title>
<style>
    @page {{
        size: A4 portrait;
        margin: 10mm 12mm;
    }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 0;
        font-size: 10pt;
        line-height: 1.35;
    }}
    .header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #0f172a;
        padding-bottom: 10px;
        margin-bottom: 12px;
    }}
    .logo-container h1 {{
        margin: 0;
        font-size: 20pt;
        letter-spacing: -0.5px;
        color: #0f172a;
    }}
    .logo-container span {{
        color: #0284c7;
        font-weight: 700;
    }}
    .meta-box {{
        text-align: right;
        font-size: 8.5pt;
        color: #475569;
        line-height: 1.4;
    }}
    .verdict-banner {{
        background: {banner_bg};
        border-left: 6px solid {banner_border};
        padding: 10px 14px;
        border-radius: 4px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }}
    .verdict-title {{
        font-size: 12pt;
        font-weight: 800;
        color: {banner_text};
        margin: 0;
    }}
    .verdict-score {{
        font-size: 18pt;
        font-weight: 900;
        color: {banner_border};
    }}
    .section {{
        margin-bottom: 12px;
    }}
    h3 {{
        font-size: 10.5pt;
        color: #0f172a;
        margin: 0 0 5px 0;
        padding-bottom: 2px;
        border-bottom: 1px solid #e2e8f0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5pt;
        margin-bottom: 8px;
    }}
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 4px 6px;
        text-align: left;
    }}
    th {{
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
    }}
    .badge {{
        display: inline-block;
        padding: 1.5px 6px;
        border-radius: 10px;
        font-size: 7pt;
        font-weight: 700;
        text-transform: uppercase;
    }}
    .badge-optimal {{ background: #d1fae5; color: #065f46; }}
    .badge-warning {{ background: #fef3c7; color: #92400e; }}
    .badge-critical {{ background: #fee2e2; color: #991b1b; }}
    .recommendation-card {{
        background: #f8fafc;
        border-left: 4px solid #cbd5e1;
        padding: 6px 9px;
        margin-bottom: 5px;
        border-radius: 0 4px 4px 0;
    }}
    .service-notes-box {{
        background: #f1f5f9;
        border-left: 4px solid #0284c7;
        padding: 7px 11px;
        border-radius: 0 4px 4px 0;
        font-size: 9pt;
        color: #1e293b;
    }}
    .border-critical {{ border-left-color: #ef4444; }}
    .border-warning {{ border-left-color: #f59e0b; }}
    .border-optimal {{ border-left-color: #10b981; }}
    .rec-header {{
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }}
    .rec-desc {{
        margin: 0 0 2px 0;
        font-size: 8.5pt;
        color: #334155;
    }}
    .rec-action {{
        margin: 0;
        font-size: 8pt;
        color: #0369a1;
    }}
    .signatures {{
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px dashed #94a3b8;
    }}
    .sign-box {{
        width: 45%;
        text-align: center;
    }}
    .sign-line {{
        margin-top: 30px;
        border-top: 1px solid #334155;
        padding-top: 4px;
        font-size: 8pt;
        color: #475569;
    }}
    .footer {{
        margin-top: 12px;
        text-align: center;
        font-size: 7pt;
        color: #94a3b8;
    }}
    @media print {{
        @page {{
            margin: 10mm 12mm;
        }}
        body {{
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}
        .no-print {{
            display: none !important;
        }}
    }}
</style>
</head>
<body>

<div class="header">
    <div class="logo-container">
        <h1>OmniCheck <span>PC</span></h1>
        <small style="color: #64748b; font-weight: 600;">Certificado de Diagnóstico Técnico de Hardware</small>
    </div>
    <div class="meta-box">
        <strong>Reporte ID:</strong> {report_id}<br>
        <strong>Fecha:</strong> {timestamp}<br>
        {client_line}
        <strong>Equipo:</strong> {display_pc}<br>
        <strong>S/N Placa:</strong> {serial}
    </div>
</div>

<div class="verdict-banner">
    <div>
        <p class="verdict-title">{verdict_title}</p>
        <small style="color: #64748b;">Certificación técnica y evaluación integral automatizada basada en telemetría de bajo nivel.</small>
    </div>
    <div>
        <span class="badge badge-{verdict_badge_class}" style="font-size: 8.5pt; padding: 4px 10px;">{verdict_badge_text}</span>
    </div>
</div>

<div class="section">
    <h3>1. Procesador Central (CPU)</h3>
    <table>
        <thead>
            <tr>
                <th>Modelo</th>
                <th>Núcleos / Hilos</th>
                <th>Frecuencia Reloj</th>
                <th>Carga Instantánea</th>
                <th>Temperatura</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>{cpu_model}</strong></td>
                <td>{cpu_phys} Físicos / {cpu_log} Hilos</td>
                <td>{cpu_clock} MHz</td>
                <td>{cpu_usage:.1}%</td>
                <td>{cpu_temp_str}</td>
                <td><span class="badge badge-{cpu_health_lower}">{cpu_health:?}</span></td>
            </tr>
        </tbody>
    </table>
</div>

<div class="section">
    <h3>2. Memoria RAM & Integridad</h3>
    <table>
        <thead>
            <tr>
                <th>Capacidad Total</th>
                <th>En Uso / Libre</th>
                <th>Bancos DIMM</th>
                <th>Ancho de Banda</th>
                <th>Prueba de Consistencia</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>{ram_total:.1} GB</strong></td>
                <td>{ram_used:.1} GB ({ram_usage:.1}%) / {ram_avail:.1} GB</td>
                <td>{ram_slots} Módulos instalados</td>
                <td>{ram_speed:.1} MB/s</td>
                <td>{ram_test_str}</td>
                <td><span class="badge badge-{ram_health_lower}">{ram_health:?}</span></td>
            </tr>
        </tbody>
    </table>
</div>

<div class="section">
    <h3>3. Almacenamiento & Telemetría SMART</h3>
    <table>
        <thead>
            <tr>
                <th>Unidad</th>
                <th>Capacidad</th>
                <th>Tipo / Bus</th>
                <th>Estado SMART & Temp</th>
                <th>Diagnóstico</th>
            </tr>
        </thead>
        <tbody>
            {disk_rows}
        </tbody>
    </table>
</div>

<div class="section">
    <h3>4. Tarjetas Gráficas (GPU)</h3>
    <table>
        <thead>
            <tr>
                <th>Controlador</th>
                <th>VRAM</th>
                <th>Driver</th>
                <th>Temperatura</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {gpu_rows}
        </tbody>
    </table>
</div>

<div class="section">
    <h3>5. Placa Base, BIOS y Sistema Operativo</h3>
    <table>
        <thead>
            <tr>
                <th>Fabricante & Modelo Placa</th>
                <th>Versión & Fecha BIOS</th>
                <th>Modo de Arranque</th>
                <th>Sistema Operativo & Uptime</th>
                <th>Antivirus / Seguridad</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{mb_manuf} {mb_prod}</td>
                <td>{bios_ver} ({bios_date})</td>
                <td>{boot_mode}</td>
                <td>{os_name} ({uptime})</td>
                <td>{av_name}</td>
            </tr>
        </tbody>
    </table>
</div>

{battery_block}

<div class="section">
    <h3>7. Conectividad y Adaptadores de Red</h3>
    <table>
        <thead>
            <tr>
                <th>Adaptador</th>
                <th>Dirección IP Local</th>
                <th>Dirección MAC</th>
                <th>Tráfico (Descarga / Subida)</th>
            </tr>
        </thead>
        <tbody>
            {net_rows}
        </tbody>
    </table>
</div>

<div class="section">
    <h3>8. Observaciones Técnicas y Plan de Acción</h3>
    {rec_rows}
</div>

{notes_block}

<div class="signatures">
    <div class="sign-box">
        <div class="sign-line">
            <strong>Firma: {technician_name}</strong><br>
            Taller Certificado de Soporte de Hardware
        </div>
    </div>
    <div class="sign-box">
        <div class="sign-line">
            <strong>Firma / Conformidad del Cliente</strong><br>
            Aceptación de Estado y Recomendaciones
        </div>
    </div>
</div>

<div class="footer">
    Documento emitido por OmniCheck PC Suite v1.0.0. Certificación técnica de hardware inmutable.
</div>

</body>
</html>
"#,
        display_pc = display_pc,
        report_id = diag.report_id,
        timestamp = &diag.timestamp[0..19].replace('T', " "),
        client_line = client_line,
        serial = diag.motherboard.serial_number,
        verdict_title = verdict_title,
        verdict_badge_class = verdict_badge_class,
        verdict_badge_text = verdict_badge_text,
        cpu_model = diag.cpu.model,
        cpu_phys = diag.cpu.physical_cores,
        cpu_log = diag.cpu.logical_cores,
        cpu_clock = diag.cpu.current_clock_mhz,
        cpu_usage = diag.cpu.total_usage_pct,
        cpu_temp_str = cpu_temp_str,
        cpu_health_lower = format!("{:?}", diag.cpu.health).to_lowercase(),
        cpu_health = diag.cpu.health,
        ram_total = diag.ram.total_gb,
        ram_used = diag.ram.used_gb,
        ram_usage = diag.ram.usage_pct,
        ram_avail = diag.ram.available_gb,
        ram_slots = diag.ram.slots.len(),
        ram_speed = diag.ram.memory_speed_mb_s,
        ram_test_str = if diag.ram.consistency_test_passed { "Superada (Sin bit-flips)" } else { "FALLO CRÍTICO" },
        ram_health_lower = format!("{:?}", diag.ram.health).to_lowercase(),
        ram_health = diag.ram.health,
        disk_rows = disk_rows,
        gpu_rows = gpu_rows,
        mb_manuf = diag.motherboard.manufacturer,
        mb_prod = diag.motherboard.product,
        bios_ver = diag.motherboard.bios_version,
        bios_date = diag.motherboard.bios_date,
        boot_mode = diag.motherboard.boot_mode,
        os_name = diag.security.os_name,
        uptime = diag.security.uptime_formatted,
        av_name = diag.security.antivirus_name,
        battery_block = battery_block,
        net_rows = net_rows,
        rec_rows = rec_rows,
        notes_block = notes_block,
        technician_name = technician_name
    )
}

pub fn get_desktop_directory() -> PathBuf {
    // 1. Try Windows Registry (accurately finds OneDrive\Desktop or local Desktop)
    if let Ok(reg_output) = crate::utils::new_hidden_command("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "[Environment]::GetFolderPath('Desktop')",
        ])
        .output()
    {
        if reg_output.status.success() {
            let p_str = String::from_utf8_lossy(&reg_output.stdout).trim().to_string();
            let p = PathBuf::from(&p_str);
            if p.exists() {
                return p;
            }
        }
    }

    // 2. Try OneDrive Desktop fallback
    if let Ok(userprofile) = std::env::var("USERPROFILE") {
        let onedrive_desktop = PathBuf::from(&userprofile).join("OneDrive").join("Desktop");
        if onedrive_desktop.exists() {
            return onedrive_desktop;
        }

        let regular_desktop = PathBuf::from(&userprofile).join("Desktop");
        if regular_desktop.exists() {
            return regular_desktop;
        }
    }

    PathBuf::from(".")
}

pub fn save_report_to_disk(diag: &SystemDiagnostics) -> Result<String, String> {
    let html_content = generate_html_report(diag);
    let raw_name = diag
        .custom_pc_name
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or(&diag.hostname);

    // Sanitize filename
    let clean_name: String = raw_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let filename = format!("Reporte_OmniCheck_{}_{}.html", clean_name, diag.report_id);

    let mut path = get_desktop_directory();
    path.push(&filename);

    fs::write(&path, &html_content).map_err(|e| format!("Error al escribir reporte: {}", e))?;

    let path_str = path.to_string_lossy().to_string();

    // Automatically open in Windows default viewer / browser without console window
    let _ = crate::utils::new_hidden_command("cmd")
        .args(["/C", "start", "", &path_str])
        .spawn();

    Ok(path_str)
}
