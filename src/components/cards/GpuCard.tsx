import React from 'react';
import { Monitor, Thermometer, Activity } from 'lucide-react';
import { GpuInfo, HealthStatus } from '../../types/diagnostics';

interface GpuCardProps {
  gpus: GpuInfo[];
}

export const GpuCard: React.FC<GpuCardProps> = ({ gpus }) => {
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

  const hasDedicated = gpus.some(g => g.is_dedicated);

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/40 text-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-400/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Acelerador Gráfico (GPU)</h2>
              <span className="text-[11px] font-mono text-slate-400">
                {hasDedicated ? 'GPU Dedicada + Gráficos' : 'Gráficos Integrados'}
              </span>
            </div>
          </div>
          {getBadge(gpus.some(g => g.health === 'CRITICAL') ? 'CRITICAL' : gpus.some(g => g.health === 'WARNING') ? 'WARNING' : 'OPTIMAL')}
        </div>

        {/* GPU List */}
        <div className="space-y-3">
          {gpus.map((gpu, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition ${
                gpu.is_dedicated
                  ? 'bg-slate-900/90 border-cyan-500/30 shadow-sm shadow-cyan-950/20'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              {/* Name & Tag */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {gpu.is_dedicated ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        DEDICADA
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                        INTEGRADA
                      </span>
                    )}
                    <span className="text-xs font-bold text-white truncate" title={gpu.name}>
                      {gpu.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Driver: {gpu.driver_version}
                  </div>
                </div>
                {getBadge(gpu.health)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">VRAM Total</span>
                  <span className="font-bold text-cyan-400">
                    {gpu.vram_total_mb > 0 ? `${(gpu.vram_total_mb / 1024).toFixed(1)} GB` : 'Compartida'}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-emerald-400" />
                    Temperatura
                  </span>
                  <span className="font-bold text-slate-200">
                    {gpu.temperature_c !== null ? `${gpu.temperature_c.toFixed(0)} °C` : 'Nominal'}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2 rounded border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-amber-400" />
                    Carga Activa
                  </span>
                  <span className="font-bold text-slate-200">
                    {gpu.utilization_pct !== null ? `${gpu.utilization_pct.toFixed(0)}%` : 'Baja'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
