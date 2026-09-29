import React from 'react';
import { HardDrive, Disc, Usb, Thermometer } from 'lucide-react';
import { DiskInfo, HealthStatus } from '../../types/diagnostics';

interface StorageCardProps {
  storage: DiskInfo[];
}

export const StorageCard: React.FC<StorageCardProps> = ({ storage }) => {
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

  const getDiskIcon = (mediaType: string, isRemovable: boolean) => {
    if (isRemovable) return <Usb className="w-4 h-4 text-purple-400" />;
    if (mediaType.toLowerCase().includes('ssd') || mediaType.toLowerCase().includes('nvme')) {
      return <Disc className="w-4 h-4 text-cyan-400" />;
    }
    return <HardDrive className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Almacenamiento & SMART</h2>
              <span className="text-[11px] font-mono text-slate-400">{storage.length} Unidades Enlazadas</span>
            </div>
          </div>
          {getBadge(storage.some(d => d.health === 'CRITICAL') ? 'CRITICAL' : storage.some(d => d.health === 'WARNING') ? 'WARNING' : 'OPTIMAL')}
        </div>

        {/* Disk Items */}
        <div className="space-y-3">
          {storage.map((disk, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getDiskIcon(disk.media_type, disk.is_removable)}
                  <span className="font-semibold text-xs text-slate-100 truncate" title={disk.name}>
                    {disk.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                    {disk.mount_point}
                  </span>
                </div>
                {getBadge(disk.health)}
              </div>

              {/* Progress and Space */}
              <div className="mb-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1">
                  <span>{disk.total_gb.toFixed(0)} GB ({disk.free_gb.toFixed(0)} GB Libres)</span>
                  <span className="font-bold text-slate-200">{disk.used_pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      disk.used_pct > 90 ? 'bg-red-400' : disk.used_pct > 80 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(disk.used_pct, 100)}%` }}
                  />
                </div>
              </div>

              {/* SMART Status & Telemetry */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1 border-t border-slate-800/60">
                <span className="text-slate-300">
                  {disk.smart_status}
                </span>

                <div className="flex items-center gap-2">
                  {disk.wear_level_pct !== null && (
                    <span className="text-emerald-400">
                      Vida Útil: {disk.wear_level_pct.toFixed(0)}%
                    </span>
                  )}
                  {disk.temperature_c !== null && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      {disk.temperature_c.toFixed(0)}°C
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    {disk.bus_type}
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
