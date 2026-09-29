import React from 'react';
import { Wifi, ArrowDown, ArrowUp } from 'lucide-react';
import { NetworkInterface } from '../../types/diagnostics';

interface NetworkCardProps {
  network: NetworkInterface[];
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ network }) => {
  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Conectividad & Red</h2>
              <span className="text-[11px] font-mono text-slate-400">{network.length} Interfaces Activas</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ENLACE OK
          </span>
        </div>

        {/* Interfaces List */}
        <div className="space-y-2.5 font-mono text-xs">
          {network.slice(0, 3).map((iface, idx) => (
            <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-200 font-bold mb-1">
                <span className="truncate max-w-[200px]" title={iface.name}>{iface.name}</span>
                <span className="text-[10px] text-emerald-400">Activo</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>IP: <strong className="text-cyan-400">{iface.ip_address}</strong></span>
                <span>MAC: {iface.mac_address}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5 text-cyan-400">
                  <ArrowDown className="w-3 h-3" /> {iface.received_mb.toFixed(1)} MB Recibidos
                </span>
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <ArrowUp className="w-3 h-3" /> {iface.transmitted_mb.toFixed(1)} MB Enviados
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
