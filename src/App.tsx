import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Header } from './components/Header';
import { ActionBar } from './components/ActionBar';
import { TerminalConsole } from './components/TerminalConsole';
import { ScoreBreakdownCard } from './components/cards/ScoreBreakdownCard';
import { CpuCard } from './components/cards/CpuCard';
import { MemoryCard } from './components/cards/MemoryCard';
import { StorageCard } from './components/cards/StorageCard';
import { GpuCard } from './components/cards/GpuCard';
import { MotherboardCard } from './components/cards/MotherboardCard';
import { BatteryCard } from './components/cards/BatteryCard';
import { SecurityCard } from './components/cards/SecurityCard';
import { NetworkCard } from './components/cards/NetworkCard';
import { RecommendationsCard } from './components/cards/RecommendationsCard';
import { HelpModal } from './components/modals/HelpModal';
import { AboutModal } from './components/modals/AboutModal';
import { ReportPreviewModal } from './components/modals/ReportPreviewModal';
import { SystemDiagnostics, LogEntry } from './types/diagnostics';
import { CheckCircle2, AlertCircle, Play, ShieldAlert, Cpu, HardDrive, Layers, Monitor } from 'lucide-react';

export function App() {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'OmniCheck PC Suite inicializada en modo seguro. Esperando inicio de diagnóstico...',
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const runDiagnostics = async () => {
    setIsScanning(true);
    setScanProgress(15);
    setErrorMessage(null);

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Sondeando registros del kernel de Windows, tablas SMBIOS y telemetría de hardware...',
    };
    setLogs(prev => [initialLog, ...prev]);

    // Simulated progress ticks while Rust backend is polling
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 85) return prev;
        return prev + 15;
      });
    }, 300);

    try {
      const data = await invoke<SystemDiagnostics>('get_system_diagnostics');
      clearInterval(interval);
      setScanProgress(100);

      setDiagnostics(data);
      setLogs(data.diagnostic_log);

      showToast(`Diagnóstico finalizado con éxito. Equipo: ${data.hostname} (${data.health_score}/100)`);
    } catch (err) {
      clearInterval(interval);
      const errMsg = String(err);
      console.error('Error al ejecutar diagnóstico nativo:', err);
      setErrorMessage(errMsg);
      showToast(`Error de comunicación IPC: ${errMsg}`, 'error');
      setLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'ERROR',
          message: `Fallo en sondeo nativo: ${errMsg}. Asegúrese de ejecutar la suite dentro de Tauri.`,
        },
        ...prev,
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenPdfModal = () => {
    if (!diagnostics) return;
    setShowPreviewModal(true);
  };

  const handleExportToDisk = async (targetDiag?: SystemDiagnostics) => {
    const diagToExport = targetDiag || diagnostics;
    if (!diagToExport) return;

    try {
      const savedPath = await invoke<string>('export_pdf_report', { diagnostics: diagToExport });
      showToast(`Reporte guardado con éxito en: ${savedPath}`);
    } catch (err) {
      console.error(err);
      showToast('Error al exportar reporte a disco: ' + String(err), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-slate-100 shadow-2xl backdrop-blur-md animate-fadeIn">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-mono font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        hostname={diagnostics?.custom_pc_name || diagnostics?.hostname || 'Equipo Local'}
        reportId={diagnostics?.report_id}
        healthScore={diagnostics?.health_score ?? 100}
        healthStatus={diagnostics?.health_status ?? 'OPTIMAL'}
        isAdmin={diagnostics?.is_admin ?? false}
        isPortable={diagnostics?.is_portable ?? true}
        isScanning={isScanning}
      />

      {/* Action Bar */}
      <ActionBar
        onStartScan={runDiagnostics}
        onExportPdf={handleOpenPdfModal}
        onPreviewReport={handleOpenPdfModal}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        isScanning={isScanning}
        hasDiagnostics={diagnostics !== null}
        scanProgress={scanProgress}
      />

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold">Error al comunicar con los sensores de bajo nivel:</strong>
              <p className="text-xs font-mono text-red-300 mt-1">{errorMessage}</p>
              <button
                onClick={runDiagnostics}
                className="mt-2 px-3 py-1 bg-red-800/60 hover:bg-red-700/60 rounded text-xs font-mono transition cursor-pointer"
              >
                Reintentar Escaneo
              </button>
            </div>
          </div>
        )}

        {diagnostics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {/* 0. Score Breakdown Transparent Card */}
            <ScoreBreakdownCard breakdown={diagnostics.score_breakdown} />

            {/* 1. CPU Card */}
            <CpuCard cpu={diagnostics.cpu} />

            {/* 2. RAM Card */}
            <MemoryCard ram={diagnostics.ram} />

            {/* 3. Storage & SMART Card */}
            <StorageCard storage={diagnostics.storage} />

            {/* 4. GPU Card (Dedicated vs Integrated) */}
            <GpuCard gpus={diagnostics.gpus} />

            {/* 5. Motherboard & BIOS Card */}
            <MotherboardCard motherboard={diagnostics.motherboard} />

            {/* 6. Battery Card (Conditional: omitted automatically on Desktops) */}
            {diagnostics.battery && <BatteryCard battery={diagnostics.battery} />}

            {/* 7. OS & Security Card */}
            <SecurityCard security={diagnostics.security} />

            {/* 8. Network Interfaces Card */}
            <NetworkCard network={diagnostics.network} />

            {/* 9. Full Width Technical Recommendations Card */}
            <RecommendationsCard recommendations={diagnostics.recommendations} />
          </div>
        ) : (
          /* Standby Welcome Board (Waits for user to click Scan) */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-3xl mx-auto animate-fadeIn">
            <div className="relative mb-6">
              <img
                src="/logo.png"
                alt="OmniCheck PC Logo"
                className="w-24 h-24 rounded-2xl shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-400/60 object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              OmniCheck <span className="text-cyan-400">PC Suite</span>
            </h2>
            <p className="text-sm text-slate-400 font-mono max-w-xl mb-6 leading-relaxed">
              Herramienta técnica de diagnóstico de hardware en tiempo real. Presione el botón a continuación para sondear los componentes físicos reales instalados en este equipo.
            </p>

            <button
              onClick={runDiagnostics}
              disabled={isScanning}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer mb-10"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Diagnóstico de Hardware</span>
            </button>

            {/* Standby Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-left font-mono text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <Cpu className="w-4 h-4 text-cyan-400 mb-1.5" />
                <strong className="text-slate-200 block text-xs">CPU & Frecuencia</strong>
                <span className="text-slate-500 text-[11px]">Núcleos y temperaturas</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <Layers className="w-4 h-4 text-emerald-400 mb-1.5" />
                <strong className="text-slate-200 block text-xs">RAM & Integridad</strong>
                <span className="text-slate-500 text-[11px]">Test de 0 bit-flips</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <HardDrive className="w-4 h-4 text-blue-400 mb-1.5" />
                <strong className="text-slate-200 block text-xs">Discos & SMART</strong>
                <span className="text-slate-500 text-[11px]">Salud y desgaste SSD</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <Monitor className="w-4 h-4 text-purple-400 mb-1.5" />
                <strong className="text-slate-200 block text-xs">GPU Dedicada</strong>
                <span className="text-slate-500 text-[11px]">VRAM y telemetría en vivo</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Terminal Console */}
      <TerminalConsole logs={logs} isScanning={isScanning} />

      {/* Modals */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
      <ReportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        diagnostics={diagnostics}
        onUpdateDiagnostics={(updated) => setDiagnostics(updated)}
        onExportDisk={() => handleExportToDisk(diagnostics!)}
      />
    </div>
  );
}

export default App;
