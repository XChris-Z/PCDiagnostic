import React from 'react';
import { Wrench, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import { HealthStatus, TechnicalRecommendation } from '../../types/diagnostics';

interface RecommendationsCardProps {
  recommendations: TechnicalRecommendation[];
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  const getSeverityIcon = (severity: HealthStatus) => {
    switch (severity) {
      case 'OPTIMAL':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
    }
  };

  const getBorderColor = (severity: HealthStatus) => {
    switch (severity) {
      case 'OPTIMAL':
        return 'border-emerald-500/30 bg-emerald-950/10';
      case 'WARNING':
        return 'border-amber-500/30 bg-amber-950/10';
      case 'CRITICAL':
        return 'border-red-500/40 bg-red-950/20';
    }
  };

  return (
    <div className="col-span-full bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Diagnóstico de Taller & Recomendaciones Técnicas
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Dictamen automatizado para certificación ante el cliente
            </span>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {recommendations.length} Puntos Evaluados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex flex-col justify-between transition ${getBorderColor(rec.severity)}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getSeverityIcon(rec.severity)}
                <span className="text-xs font-bold font-mono uppercase text-slate-300">
                  {rec.component}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                  {rec.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{rec.title}</h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">{rec.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-start gap-1.5 text-xs text-cyan-300 font-mono">
              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Acción Sugerida:</strong> {rec.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
