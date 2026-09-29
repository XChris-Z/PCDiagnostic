import React from 'react';
import { ShieldCheck, Clock, Lock } from 'lucide-react';
import { OsSecurityInfo } from '../../types/diagnostics';

interface SecurityCardProps {
  security: OsSecurityInfo;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({ security }) => {
  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Sistema Operativo & Seguridad</h2>
              <span className="text-[11px] font-mono text-slate-400">{security.os_name}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            PROTEGIDO
          </span>
        </div>

        {/* Security Details */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Compilación / Kernel:</span>
            <span className="text-slate-200 font-bold truncate max-w-[200px]" title={security.build_number}>
              Build {security.build_number} ({security.architecture})
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Tiempo de Encendido:
            </span>
            <span className="text-cyan-300 font-bold">{security.uptime_formatted}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Antivirus Residente:
            </span>
            <span className="text-emerald-400 font-bold text-right pl-2" title={security.antivirus_name}>
              {security.antivirus_name}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Firewall de Red:</span>
            <span className="text-emerald-400 font-bold">Activo & Filtrando</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Módulo TPM:
            </span>
            <span className="text-emerald-400 font-semibold text-xs text-right pl-2" title={security.tpm_status}>
              {security.tpm_status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
