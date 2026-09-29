import React from 'react';
import { Layers, CheckCircle2, XCircle, Gauge, Cpu } from 'lucide-react';
import { HealthStatus, RamInfo } from '../../types/diagnostics';

interface MemoryCardProps {
  ram: RamInfo;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ ram }) => {
  const getBadge = (health: HealthStatus) => {
    switch (health) {
      case 'OPTIMAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ÓPTIMO</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">ADVERTENCIA</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">CRÍTICO</span>;
    }
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Memoria RAM</h2>
              <span className="text-[11px] font-mono text-slate-400">Total: {ram.total_gb.toFixed(1)} GB</span>
            </div>
          </div>
          {getBadge(ram.health)}
        </div>

        {/* Usage Bar */}
        <div className="mb-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-slate-400">Uso: <strong className="text-emerald-400">{ram.used_gb.toFixed(1)} GB</strong></span>
            <span className="text-slate-400">Libre: <strong className="text-slate-200">{ram.available_gb.toFixed(1)} GB</strong></span>
            <span className="font-bold text-white">{ram.usage_pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ram.usage_pct > 90 ? 'bg-red-400' : ram.usage_pct > 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(ram.usage_pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Consistency & Bandwidth */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Test de Integridad
            </span>
            <div className="flex items-center gap-1.5">
              {ram.consistency_test_passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400">Sin Bit-Flips</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-mono font-bold text-red-400">FALLO DETECTADO</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Ancho de Banda Real
            </span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {ram.memory_speed_mb_s.toFixed(0)} MB/s
            </span>
          </div>
        </div>

        {/* Qualitative Health Summary */}
        <div className="mb-4 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Estado Operativo:</span>
          <span className={`font-bold flex items-center gap-1.5 ${ram.consistency_test_passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {ram.consistency_test_passed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Módulos Saludables (100% Funcional)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                Módulo Defectuoso Detectado
              </>
            )}
          </span>
        </div>

        {/* DIMM Slots */}
        <div>
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>Bancos Físicos ({ram.slots.length} Módulos Detectados):</span>
          </div>

          {ram.slots.length > 0 ? (
            <div className="space-y-2">
              {ram.slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold text-[10px]">
                      {slot.locator}
                    </span>
                    <span className="text-slate-200">{slot.manufacturer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{slot.capacity_gb.toFixed(0)} GB</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] border border-emerald-800/50">
                      {slot.memory_type} @ {slot.speed_mhz} MHz
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono italic">
              Telemetría de slots DIMM delegada al bus del sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
