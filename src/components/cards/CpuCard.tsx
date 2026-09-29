import React from 'react';
import { Cpu, Thermometer, Activity, Zap } from 'lucide-react';
import { CpuInfo, HealthStatus } from '../../types/diagnostics';

interface CpuCardProps {
  cpu: CpuInfo;
}

export const CpuCard: React.FC<CpuCardProps> = ({ cpu }) => {
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

  const getTempColor = (temp: number | null) => {
    if (!temp) return 'text-slate-400';
    if (temp >= 85) return 'text-red-400';
    if (temp >= 75) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Procesador (CPU)</h2>
              <span className="text-[11px] font-mono text-slate-400">{cpu.vendor} • {cpu.architecture}</span>
            </div>
          </div>
          {getBadge(cpu.health)}
        </div>

        {/* Model & Family Clarification */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline text-xs text-slate-400 mb-0.5">
            <span>Modelo Físico (CPUID):</span>
            {cpu.model.includes('4600H') && (
              <span className="text-[10px] text-cyan-400 font-mono">Chasis: Ryzen 5 4000 Series</span>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono line-clamp-2" title={cpu.model}>
            {cpu.model}
          </div>
          {cpu.model.includes('4600H') && (
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Familia Comercial: AMD Ryzen™ 5 4000 Mobile Series (Arquitectura Zen 2 Renoir)
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Núcleos / Hilos
            </span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {cpu.physical_cores} Físicos / {cpu.logical_cores} Hilos
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Frecuencia Reloj
            </span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {cpu.current_clock_mhz > 0 ? `${cpu.current_clock_mhz} MHz` : 'Dinámico'}
            </span>
          </div>
        </div>

        {/* Temperature & Load */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              Temperatura
            </span>
            <span className={`text-base font-mono font-bold ${getTempColor(cpu.temperature_c)}`}>
              {cpu.temperature_c !== null ? `${cpu.temperature_c.toFixed(1)} °C` : 'Nominal (ACPI)'}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Carga Global</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(cpu.total_usage_pct, 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                {cpu.total_usage_pct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Per-Core Load Mini Bars */}
        {cpu.per_core_usage.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex justify-between">
              <span>Carga por Hilo ({cpu.per_core_usage.length} Lógicos)</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              {cpu.per_core_usage.map((usage, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-800 h-9 rounded-sm overflow-hidden flex flex-col justify-end">
                    <div
                      className={`w-full transition-all duration-300 ${
                        usage > 85 ? 'bg-red-400' : usage > 60 ? 'bg-amber-400' : 'bg-cyan-500'
                      }`}
                      style={{ height: `${Math.max(usage, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">#{idx}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
