import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, FileText, User, Laptop, Wrench } from 'lucide-react';
import { SystemDiagnostics } from '../../types/diagnostics';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: SystemDiagnostics | null;
  onUpdateDiagnostics: (updated: SystemDiagnostics) => void;
  onExportDisk: () => void;
  isExporting?: boolean;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  onUpdateDiagnostics,
  onExportDisk,
  isExporting = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [pcName, setPcName] = useState(diagnostics?.custom_pc_name || diagnostics?.hostname || '');
  const [clientName, setClientName] = useState(diagnostics?.client_name || '');
  const [techName, setTechName] = useState(diagnostics?.technician_name || 'Técnico Especialista');
  const [serviceNotes, setServiceNotes] = useState(diagnostics?.service_notes || 'Diagnóstico general de hardware y certificación de mantenimiento preventivo.');
  const [showConfig, setShowConfig] = useState(true);

  useEffect(() => {
    if (diagnostics) {
      setPcName(diagnostics.custom_pc_name || diagnostics.hostname || '');
      setClientName(diagnostics.client_name || '');
      setTechName(diagnostics.technician_name || 'Técnico Especialista');
      setServiceNotes(diagnostics.service_notes || 'Diagnóstico general de hardware y certificación de mantenimiento preventivo.');
    }
  }, [diagnostics]);

  if (!isOpen || !diagnostics) return null;

  const handleApplyChanges = () => {
    const updated: SystemDiagnostics = {
      ...diagnostics,
      custom_pc_name: pcName.trim() || diagnostics.hostname,
      client_name: clientName.trim() || null,
      technician_name: techName.trim() || 'Técnico Especialista',
      service_notes: serviceNotes.trim() || null,
    };
    onUpdateDiagnostics(updated);
  };

  const handlePrint = () => {
    handleApplyChanges();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleExportDiskWithSave = () => {
    handleApplyChanges();
    onExportDisk();
  };

  const setNotePreset = (presetText: string) => {
    setServiceNotes(presetText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#0a0d14] gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
                Certificado Técnico de Entrega (PDF)
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {pcName || diagnostics.hostname} • {diagnostics.report_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showConfig ? 'Ocultar Panel de Datos' : 'Editar Datos / Notas de Taller'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              title="Abre el cuadro de diálogo de Windows para guardar directamente como archivo PDF o imprimir en papel"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar como PDF / Imprimir</span>
            </button>

            <button
              onClick={handleExportDiskWithSave}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
              title="Guarda el reporte en tu Escritorio y lo abre de inmediato"
            >
              <Download className="w-4 h-4" />
              <span>Guardar en Escritorio</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Bar */}
        {showConfig && (
          <div className="bg-slate-900/95 border-b border-slate-800 p-4 px-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono mb-3">
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-cyan-400" />
                  Nombre / ID del Equipo:
                </label>
                <input
                  type="text"
                  value={pcName}
                  onChange={(e) => setPcName(e.target.value)}
                  placeholder="Ej: Laptop ASUS ZenBook / Workstation-01"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  Nombre del Cliente:
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Cliente / Empresa ABC"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" />
                  Técnico Responsable:
                </label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="Ej: Técnico Especialista de Taller"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Editable Notes Section with Presets */}
            <div className="text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Notas y Observaciones del Servicio (Personalizable):
                </label>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Plantillas rápidas:</span>
                  <button
                    type="button"
                    onClick={() => setNotePreset('Mantenimiento preventivo integral, limpieza interna de disipadores y prueba de esfuerzo de hardware completada con éxito.')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
                  >
                    Preventivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotePreset('Limpieza de ventiladores, sustitución de pasta térmica por compuesto de alto rendimiento y verificación de temperaturas bajo carga.')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition cursor-pointer"
                  >
                    Pasta Térmica
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotePreset('Certificación técnica post-reparación. Todos los componentes de hardware operan dentro de los parámetros nominales del fabricante.')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
                  >
                    Certificación
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="Escribe aquí las observaciones técnicas del servicio realizado en el taller..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Printable Iframe Content */}
        <div className="flex-1 bg-white p-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={generatePreviewHtml(diagnostics, pcName, clientName, techName, serviceNotes)}
            title="Certificado de Diagnóstico OmniCheck PC"
            className="w-full h-full border-0 rounded"
          />
        </div>
      </div>
    </div>
  );
};

// Client-side instant generator for live reactive updates inside the preview
function generatePreviewHtml(
  diag: SystemDiagnostics,
  customPc: string,
  client: string,
  tech: string,
  notes: string
): string {
  const displayPc = customPc.trim() || diag.hostname;
  const clientLine = client.trim() ? `<strong>Cliente:</strong> ${client}<br>` : '';
  const notesBlock = notes.trim()
    ? `<div class="section">
         <h3>Notas y Observaciones del Servicio</h3>
         <div class="service-notes-box">${notes.replace(/\n/g, '<br>')}</div>
       </div>`
    : '';

  const verdictTitle =
    diag.health_status === 'OPTIMAL'
      ? 'EQUIPO EN ESTADO ÓPTIMO / CONFORMIDAD TOTAL'
      : diag.health_status === 'WARNING'
      ? 'REQUIERE MANTENIMIENTO PREVENTIVO'
      : 'FALLA CRÍTICA DETECTADA / ATENCIÓN URGENTE';

  const bannerBg =
    diag.health_status === 'OPTIMAL' ? '#ecfdf5' : diag.health_status === 'WARNING' ? '#fffbeb' : '#fef2f2';
  const bannerBorder =
    diag.health_status === 'OPTIMAL' ? '#10b981' : diag.health_status === 'WARNING' ? '#f59e0b' : '#ef4444';
  const bannerText =
    diag.health_status === 'OPTIMAL' ? '#065f46' : diag.health_status === 'WARNING' ? '#92400e' : '#991b1b';


  let netRows = '';
  if (diag.network) {
    for (const n of diag.network) {
      netRows += `<tr>
        <td><strong>${n.name}</strong></td>
        <td>${n.ip_address}</td>
        <td>${n.mac_address}</td>
        <td>${n.received_mb.toFixed(1)} MB / ${n.transmitted_mb.toFixed(1)} MB</td>
      </tr>`;
    }
  }

  let gpuRows = '';
  for (const g of diag.gpus) {
    const tempStr = g.temperature_c !== null ? `${g.temperature_c.toFixed(1)}°C` : 'N/A (Normal)';
    gpuRows += `<tr>
      <td><strong>${g.name}</strong> (${g.is_dedicated ? 'Dedicada' : 'Integrada'})</td>
      <td>${g.vram_total_mb} MB</td>
      <td>${g.driver_version}</td>
      <td>${tempStr}</td>
      <td><span class="badge badge-${g.health.toLowerCase()}">${g.health}</span></td>
    </tr>`;
  }

  let diskRows = '';
  for (const d of diag.storage) {
    const tempStr = d.temperature_c !== null ? `${d.temperature_c.toFixed(1)}°C` : 'Nominal';
    diskRows += `<tr>
      <td><strong>${d.name}</strong> (${d.mount_point})</td>
      <td>${d.total_gb.toFixed(1)} GB (${d.free_gb.toFixed(1)} GB Libres)</td>
      <td>${d.media_type} / ${d.bus_type}</td>
      <td>${d.smart_status} | Temp: ${tempStr}</td>
      <td><span class="badge badge-${d.health.toLowerCase()}">${d.health}</span></td>
    </tr>`;
  }

  let recRows = '';
  for (const r of diag.recommendations) {
    recRows += `<div class="recommendation-card border-${r.severity.toLowerCase()}">
      <div class="rec-header">
        <span class="badge badge-${r.severity.toLowerCase()}">${r.severity}</span>
        <strong>${r.component} — ${r.title}</strong>
      </div>
      <p class="rec-desc">${r.description}</p>
      <p class="rec-action"><strong>Acción sugerida:</strong> ${r.action}</p>
    </div>`;
  }

  const batteryBlock = diag.battery
    ? `<div class="section">
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
              <td>${diag.battery.charge_pct}% ${diag.battery.is_charging ? '(Cargando)' : '(Descargando)'}</td>
              <td>${diag.battery.design_capacity_mwh ?? 'N/A'} mWh</td>
              <td>${diag.battery.full_charge_capacity_mwh ?? 'N/A'} mWh</td>
              <td>${diag.battery.wear_level_pct?.toFixed(1) ?? '0.0'}%</td>
              <td>${diag.battery.cycle_count ?? 'N/A'}</td>
              <td><span class="badge badge-${diag.battery.health.toLowerCase()}">${diag.battery.health}</span></td>
            </tr>
          </tbody>
        </table>
      </div>`
    : '';

  const cpuTempStr = diag.cpu.temperature_c !== null ? `${diag.cpu.temperature_c.toFixed(1)}°C` : 'Nominal (ACPI)';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Diagnóstico - OmniCheck PC - ${displayPc}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
    font-size: 10.5pt;
    line-height: 1.35;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #0f172a;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .logo-container h1 {
    margin: 0;
    font-size: 20pt;
    letter-spacing: -0.5px;
    color: #0f172a;
  }
  .logo-container span {
    color: #0284c7;
    font-weight: 700;
  }
  .meta-box {
    text-align: right;
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.4;
  }
  .verdict-banner {
    background: ${bannerBg};
    border-left: 6px solid ${bannerBorder};
    padding: 10px 14px;
    border-radius: 4px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .verdict-title {
    font-size: 12pt;
    font-weight: 800;
    color: ${bannerText};
    margin: 0;
  }
  .verdict-score {
    font-size: 18pt;
    font-weight: 900;
    color: ${bannerBorder};
  }
  .section {
    margin-bottom: 14px;
  }
  h3 {
    font-size: 11pt;
    color: #0f172a;
    margin: 0 0 6px 0;
    padding-bottom: 3px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-bottom: 8px;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
  }
  th {
    background: #f8fafc;
    color: #334155;
    font-weight: 700;
  }
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 12px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge-optimal { background: #d1fae5; color: #065f46; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-critical { background: #fee2e2; color: #991b1b; }
  .recommendation-card {
    background: #f8fafc;
    border-left: 4px solid #cbd5e1;
    padding: 7px 10px;
    margin-bottom: 6px;
    border-radius: 0 4px 4px 0;
  }
  .service-notes-box {
    background: #f1f5f9;
    border-left: 4px solid #0284c7;
    padding: 8px 12px;
    border-radius: 0 4px 4px 0;
    font-size: 9.5pt;
    color: #1e293b;
  }
  .border-critical { border-left-color: #ef4444; }
  .border-warning { border-left-color: #f59e0b; }
  .border-optimal { border-left-color: #10b981; }
  .rec-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
  }
  .rec-desc {
    margin: 0 0 3px 0;
    font-size: 9pt;
    color: #334155;
  }
  .rec-action {
    margin: 0;
    font-size: 8.5pt;
    color: #0369a1;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
    padding-top: 10px;
    border-top: 1px dashed #94a3b8;
  }
  .sign-box {
    width: 45%;
    text-align: center;
  }
  .sign-line {
    margin-top: 35px;
    border-top: 1px solid #334155;
    padding-top: 5px;
    font-size: 8.5pt;
    color: #475569;
  }
  .footer {
    margin-top: 15px;
    text-align: center;
    font-size: 7.5pt;
    color: #94a3b8;
  }
  @media print {
    @page {
      margin: 10mm 12mm;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo-container" style="display: flex; align-items: center; gap: 14px;">
    <img src="/logo.png" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover;" alt="OmniCheck Logo" />
    <div>
      <h1 style="margin: 0; line-height: 1.1;">OmniCheck <span>PC</span></h1>
      <small style="color: #64748b; font-weight: 600;">Certificado de Diagnóstico Técnico de Hardware</small>
    </div>
  </div>
  <div class="meta-box">
    <strong>Reporte ID:</strong> ${diag.report_id}<br>
    <strong>Fecha:</strong> ${diag.timestamp.slice(0, 19).replace('T', ' ')}<br>
    ${clientLine}
    <strong>Equipo:</strong> ${displayPc}<br>
    <strong>S/N Placa:</strong> ${diag.motherboard.serial_number}
  </div>
</div>

<div class="verdict-banner">
  <div>
    <p class="verdict-title">${verdictTitle}</p>
    <small style="color: #64748b;">Certificación técnica y evaluación integral automatizada basada en telemetría de bajo nivel.</small>
  </div>
  <div>
    <span class="badge badge-${diag.health_status.toLowerCase()}" style="font-size: 8.5pt; padding: 4px 10px;">${diag.health_status === 'OPTIMAL' ? 'ESTADO ÓPTIMO' : diag.health_status === 'WARNING' ? 'PRECAUCIÓN' : 'CRÍTICO'}</span>
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
        <td><strong>${diag.cpu.model}</strong></td>
        <td>${diag.cpu.physical_cores} Físicos / ${diag.cpu.logical_cores} Hilos</td>
        <td>${diag.cpu.current_clock_mhz} MHz</td>
        <td>${diag.cpu.total_usage_pct.toFixed(1)}%</td>
        <td>${cpuTempStr}</td>
        <td><span class="badge badge-${diag.cpu.health.toLowerCase()}">${diag.cpu.health}</span></td>
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
        <td><strong>${diag.ram.total_gb.toFixed(1)} GB</strong></td>
        <td>${diag.ram.used_gb.toFixed(1)} GB (${diag.ram.usage_pct.toFixed(1)}%) / ${diag.ram.available_gb.toFixed(1)} GB</td>
        <td>${diag.ram.slots.length} Módulos instalados</td>
        <td>${diag.ram.memory_speed_mb_s.toFixed(1)} MB/s</td>
        <td>${diag.ram.consistency_test_passed ? 'Superada (Sin bit-flips)' : 'FALLO CRÍTICO'}</td>
        <td><span class="badge badge-${diag.ram.health.toLowerCase()}">${diag.ram.health}</span></td>
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
      ${diskRows}
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
      ${gpuRows}
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
        <td>${diag.motherboard.manufacturer} ${diag.motherboard.product}</td>
        <td>${diag.motherboard.bios_version} (${diag.motherboard.bios_date})</td>
        <td>${diag.motherboard.boot_mode}</td>
        <td>${diag.security.os_name} (${diag.security.uptime_formatted})</td>
        <td>${diag.security.antivirus_name}</td>
      </tr>
    </tbody>
  </table>
</div>

${batteryBlock}

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
      ${netRows}
    </tbody>
  </table>
</div>

<div class="section">
  <h3>8. Observaciones Técnicas y Plan de Acción</h3>
  ${recRows}
</div>

${notesBlock}

<div class="signatures">
  <div class="sign-box">
    <div class="sign-line">
      <strong>Firma: ${tech.trim() || 'Técnico Especialista de Taller'}</strong><br>
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
</html>`;
}
