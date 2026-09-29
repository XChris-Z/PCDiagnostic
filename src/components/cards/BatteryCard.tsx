import React from 'react';
import { BatteryCharging, Battery } from 'lucide-react';
import { BatteryInfo, HealthStatus } from '../../types/diagnostics';

interface BatteryCardProps {
  battery: BatteryInfo;
}

export const BatteryCard: React.FC<BatteryCardProps> = ({ battery }) => {
  const getBadge = (health: HealthStatus) => {
    switch (health) {
      case 'OPTIMAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">SALUDABLE</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">DESGASTE</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">REEMPLAZO</span>;
    }
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/40 text-teal-400 shadow-md shadow-teal-500/20 ring-1 ring-teal-400/30">
              {battery.is_charging ? <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" /> : <Battery className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Batería & Autonomía</h2>
              <span className="text-[11px] font-mono text-slate-400">
                {battery.is_charging ? 'Conectado a CA (Cargando)' : 'En Modo Batería'}
              </span>
            </div>
          </div>
          {getBadge(battery.health)}
        </div>

        {/* Battery Charge */}
        <div className="mb-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-slate-400">Nivel de Carga:</span>
            <span className="font-bold text-teal-400 text-sm">{battery.charge_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(battery.charge_pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Wear & Capacity Grid */}
        <div className="grid grid-cols-2 gap-3 mb-2 font-mono text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Desgaste (% Wear)</span>
            <span className={`text-sm font-bold ${
              (battery.wear_level_pct || 0) > 40 ? 'text-red-400' : (battery.wear_level_pct || 0) > 20 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {battery.wear_level_pct !== null ? `${battery.wear_level_pct.toFixed(1)}%` : '0.0% Nominal'}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Ciclos Registrados</span>
            <span className="text-sm font-bold text-slate-200">
              {battery.cycle_count !== null ? battery.cycle_count : 'N/A (BMS)'}
            </span>
          </div>
        </div>

        {/* Design vs Full Capacity */}
        {(battery.design_capacity_mwh || battery.full_charge_capacity_mwh) && (
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Diseño: {battery.design_capacity_mwh || 'N/A'} mWh</span>
            <span>Actual: {battery.full_charge_capacity_mwh || 'N/A'} mWh</span>
          </div>
        )}
      </div>
    </div>
  );
};
