import React from 'react';
import { CircuitBoard, CheckCircle } from 'lucide-react';
import { MotherboardInfo } from '../../types/diagnostics';

interface MotherboardCardProps {
  motherboard: MotherboardInfo;
}

export const MotherboardCard: React.FC<MotherboardCardProps> = ({ motherboard }) => {
  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/40 text-indigo-400 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/30">
              <CircuitBoard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Placa Base & BIOS</h2>
              <span className="text-[11px] font-mono text-slate-400">{motherboard.manufacturer}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            NOMINAL
          </span>
        </div>

        {/* Board Details */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Modelo Placa:</span>
            <span className="text-slate-100 font-bold truncate max-w-[200px]" title={motherboard.product}>
              {motherboard.product}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Nº Serie / UUID:</span>
            <span className="text-slate-300 truncate max-w-[200px]" title={motherboard.serial_number}>
              {motherboard.serial_number}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Versión BIOS:</span>
            <span className="text-cyan-400 font-bold">
              {motherboard.bios_vendor} {motherboard.bios_version}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Fecha Lanzamiento:</span>
            <span className="text-slate-200">{motherboard.bios_date}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Modo de Arranque:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {motherboard.boot_mode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
