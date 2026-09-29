import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { LogEntry } from '../types/diagnostics';

interface TerminalConsoleProps {
  logs: LogEntry[];
  isScanning: boolean;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, isScanning }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'SUCCESS':
        return 'text-emerald-400';
      case 'WARN':
      case 'WARNING':
        return 'text-amber-400';
      case 'ERROR':
      case 'CRITICAL':
        return 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="w-full bg-[#07090e] border-t border-slate-800/90 transition-all duration-300">
      {/* Terminal Title Bar */}
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer hover:text-white"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Terminal Telemetry Stream</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            {logs.length} eventos
          </span>
          {isScanning && (
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              sondeando sensores...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
            title="Copiar log al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="max-w-7xl mx-auto px-6 pb-3 max-h-36 overflow-y-auto font-mono text-xs space-y-1 select-text"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-2">
              Esperando inicio de escaneo... Presione "Iniciar Diagnóstico" para comenzar.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-tight">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span className={`font-bold select-none text-[11px] ${getLevelColor(log.level)}`}>
                  [{log.level}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
