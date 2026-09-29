import React from 'react';
import { X, Cpu, Zap, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                OmniCheck <span className="text-cyan-400">PC Suite</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">Versión 1.0.0 Pro Taller</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            <strong>OmniCheck PC</strong> es una suite técnica de diagnóstico de hardware y certificación de mantenimiento de computadoras desarrollada con arquitectura nativa en <strong>Rust</strong> y el framework de alto rendimiento <strong>Tauri v2</strong>.
          </p>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
              <Zap className="w-4 h-4" />
              <span>Especificaciones de Arquitectura:</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-300">
              <li>• <strong>Backend:</strong> Rust nativo (<code>sysinfo</code>, <code>windows-sys</code>, <code>CIM/WMI</code>)</li>
              <li>• <strong>Frontend:</strong> TypeScript + React 19 + Tailwind CSS + Vite</li>
              <li>• <strong>Tiempo de Arranque:</strong> &lt; 500 ms (sin sobrecarga de Electron/Python)</li>
              <li>• <strong>Huella en Disco:</strong> &lt; 15 MB ejecutable autosuficiente portable</li>
              <li>• <strong>Reportes:</strong> Generación nativa con certificación técnica para clientes</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
            Diseñada especialmente para talleres de reparación de hardware, técnicos de servicio en campo y entusiastas que requieren diagnósticos precisos e irrefutables antes y después de cada servicio.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> para técnicos de élite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
