import React from 'react';
import { Play, FileText, Printer, HelpCircle, Info, RefreshCw } from 'lucide-react';

interface ActionBarProps {
  onStartScan: () => void;
  onExportPdf: () => void;
  onPreviewReport: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  isScanning: boolean;
  hasDiagnostics: boolean;
  scanProgress: number;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onStartScan,
  onExportPdf,
  onPreviewReport,
  onOpenHelp,
  onOpenAbout,
  isScanning,
  hasDiagnostics,
  scanProgress,
}) => {
  return (
    <div className="w-full bg-[#0f172a]/60 border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Main Diagnostic Action and Progress */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
              isScanning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-500/25 active:scale-95 cursor-pointer'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Analizando Hardware ({scanProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{hasDiagnostics ? 'Re-analizar Hardware' : 'Iniciar Diagnóstico'}</span>
              </>
            )}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={!hasDiagnostics || isScanning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border ${
              !hasDiagnostics || isScanning
                ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm cursor-pointer'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Generar Reporte PDF</span>
          </button>

          {/* Quick Print/Preview Button */}
          <button
            onClick={onPreviewReport}
            disabled={!hasDiagnostics || isScanning}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all border ${
              !hasDiagnostics || isScanning
                ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer'
            }`}
            title="Vista previa e impresión directa"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Vista Previa</span>
          </button>
        </div>

        {/* Secondary Info & Help Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Leyenda Técnica</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Acerca de</span>
          </button>
        </div>
      </div>

      {/* Reactive Progress Bar when scanning */}
      {isScanning && (
        <div className="max-w-7xl mx-auto mt-2">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
