import React from 'react';
import { Award, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { ScoreBreakdown, HealthStatus } from '../../types/diagnostics';

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ breakdown }) => {
  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
    }
  };

  const getPillarBadge = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ÓPTIMO</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">ADVERTENCIA</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">CRÍTICO</span>;
    }
  };

  return (
    <div className="col-span-full bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Desglose y Justificación del Índice de Salud ({breakdown.total_score} / 100 Puntos)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluación matemática transparente dividida en 6 subsistemas técnicos de hardware
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300">
            Total: {breakdown.total_score}/100 Pts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {breakdown.categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-slate-200 truncate" title={cat.name}>
                  {cat.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {getStatusIcon(cat.status)}
                  {getPillarBadge(cat.status)}
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-slate-800/60 font-mono">
                <span className="text-base font-bold text-white">
                  {cat.score} <span className="text-xs text-slate-400">/ {cat.max_points} pts</span>
                </span>
                <span className={`text-xs font-bold ${cat.deduction > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {cat.deduction > 0 ? `-${cat.deduction} pts` : '0 deducción'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                {cat.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
