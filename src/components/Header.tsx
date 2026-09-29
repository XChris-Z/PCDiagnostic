import React from 'react';
import { ShieldCheck, ShieldAlert, Laptop, HardDrive, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { HealthStatus } from '../types/diagnostics';

interface HeaderProps {
  hostname?: string;
  reportId?: string;
  healthScore?: number;
  healthStatus?: HealthStatus;
  isAdmin: boolean;
  isPortable: boolean;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hostname = 'OMNICHECK-PC',
  reportId,
  healthScore = 100,
  healthStatus = 'OPTIMAL',
  isAdmin,
  isPortable,
  isScanning,
}) => {
  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'WARNING':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'CRITICAL':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 88) return '#10B981';
    if (score >= 65) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <header className="w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & System Hostname */}
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <img
              src="/logo.png"
              alt="OmniCheck PC Logo"
              className="w-11 h-11 rounded-xl shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50 object-cover"
            />
            {isScanning && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                OmniCheck <span className="text-cyan-400">PC</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-medium">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span>Host: <strong className="text-slate-200">{hostname}</strong></span>
              {reportId && <span className="text-slate-600">• ID: {reportId}</span>}
            </p>
          </div>
        </div>

        {/* Center: System Execution & Privilege Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {isPortable ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Laptop className="w-3.5 h-3.5" />
              <span>Edición Portable (USB)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instalación Taller</span>
            </div>
          )}

          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Elevado</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30" title="Ejecutar como Administrador para telemetría profunda de TPM y Secure Boot">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo Estándar</span>
            </div>
          )}
        </div>

        {/* Global Health Gauge */}
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Salud del Equipo
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              {healthStatus === 'OPTIMAL' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {healthStatus === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              {healthStatus === 'CRITICAL' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
              <span className={`text-xs font-bold ${getStatusColor(healthStatus).split(' ')[0]}`}>
                {healthStatus === 'OPTIMAL' ? 'ÓPTIMO' : healthStatus === 'WARNING' ? 'ADVERTENCIA' : 'CRÍTICO'}
              </span>
            </div>
          </div>

          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
                stroke={getScoreColor(healthScore)}
                fill="none"
                className="transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">
              {healthScore}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
