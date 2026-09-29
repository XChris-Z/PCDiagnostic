import React from 'react';
import { X, Thermometer, HardDrive, Battery, Cpu, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Leyenda Técnica de Diagnóstico
              </h2>
              <span className="text-xs text-slate-400">Umbrales de salud y normas de taller</span>
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
          {/* Temperatures */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4" />
              Temperaturas de Operación Segura (CPU & GPU)
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong className="text-emerald-400">🟢 Óptimo (30°C - 75°C):</strong> Rango nominal para cargas cotidianas y moderadas.</li>
              <li><strong className="text-amber-400">🟡 Advertencia (76°C - 88°C):</strong> Temperatura aceptable en estrés prolongado, pero aconseja limpieza de disipador.</li>
              <li><strong className="text-red-400">🔴 Crítico (&gt; 89°C):</strong> Riesgo inminente de degradación térmica (Thermal Throttling) o apagado de emergencia. Requiere cambio de pasta térmica.</li>
            </ul>
          </div>

          {/* SMART */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4" />
              Telemetría SMART y Salud de Discos
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong className="text-emerald-400">🟢 Saludable:</strong> Sin sectores reasignados, tiempo de acceso nominal.</li>
              <li><strong className="text-amber-400">🟡 Advertencia:</strong> Sectores pendientes o desgaste de celdas SSD superior al 80%.</li>
              <li><strong className="text-red-400">🔴 No Saludable:</strong> Fallo inminente reportado por el controlador físico. ¡Hacer backup de inmediato!</li>
            </ul>
          </div>

          {/* Battery */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Battery className="w-4 h-4" />
              Desgaste de Batería (% Wear Level)
            </h3>
            <p className="text-slate-300 mb-2">
              Calculado como <code>((Capacidad de Diseño - Capacidad Real Actual) / Capacidad de Diseño) * 100%</code>:
            </p>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong className="text-emerald-400">&lt; 20% Desgaste:</strong> Batería en condiciones excelentes.</li>
              <li><strong className="text-amber-400">20% - 40% Desgaste:</strong> Autonomía reducida pero operativa.</li>
              <li><strong className="text-red-400">&gt; 40% Desgaste:</strong> Celdas degradadas. Reemplazo sugerido.</li>
            </ul>
          </div>

          {/* RAM */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4" />
              Prueba de Consistencia de Memoria RAM
            </h3>
            <p className="text-slate-300">
              OmniCheck PC asigna un búfer de memoria dinámica en RAM y ejecuta barridos de inversión de bits (walking ones y máscaras alternas). Si se detecta una sola mutación de bits, se alerta de inmediato para prevenir corrupción de archivos en disco y pantallazos azules.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
