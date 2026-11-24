import React, { useState } from 'react';
import { Terminal, Play, RotateCcw } from 'lucide-react';
import { apiFetch } from '../api.ts';

interface TerminalSandboxProps {
  suggestedCommand?: string;
  title?: string;
}

interface HistoryEntry {
  command: string;
  output: string;
}

export function TerminalSandbox({
  suggestedCommand = 'help',
  title = 'Practice Sandbox Terminal',
}: TerminalSandboxProps) {
  const [input, setInput] = useState(suggestedCommand);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: 'help',
      output:
        'CyberTech Academy Isolated Sandbox Ready. Try suggested commands or type "help" for available tools.',
    },
  ]);

  async function executeCommand(cmdToRun: string) {
    const trimmed = cmdToRun.trim();
    if (!trimmed || running) return;
    setRunning(true);
    try {
      const res = await apiFetch<{ output: string }>('/api/sandbox/terminal', {
        method: 'POST',
        body: JSON.stringify({ command: trimmed }),
      });
      setHistory((prev) => [...prev, { command: trimmed, output: res.output }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { command: trimmed, output: err instanceof Error ? err.message : 'Execution error.' },
      ]);
    } finally {
      setRunning(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void executeCommand(input);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#050811] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800/90 bg-[#0A101E]">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {suggestedCommand && suggestedCommand !== 'help' && (
            <button
              type="button"
              onClick={() => {
                setInput(suggestedCommand);
                void executeCommand(suggestedCommand);
              }}
              className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-md hover:bg-emerald-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              Run Suggested Command
            </button>
          )}
          <button
            type="button"
            onClick={() => setHistory([])}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0"
            title="Clear terminal history"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="p-4 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto space-y-3 text-slate-300">
        {history.length === 0 && (
          <p className="text-slate-500">Terminal cleared. Type a command below and press Run.</p>
        )}
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <span>student@cybertech:~$</span>
              <span className="text-slate-100 break-all">{entry.command}</span>
            </div>
            <pre className="whitespace-pre-wrap text-slate-300 pl-3 border-l border-slate-800">
              {entry.output}
            </pre>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-800 bg-[#080D19]"
      >
        <span className="font-mono text-xs text-emerald-400 shrink-0">student@cybertech:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command (e.g. help, ls -la, base64 -d ...)"
          aria-label="Sandbox terminal command"
          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={running}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{running ? 'Running...' : 'Run'}</span>
        </button>
      </form>
    </div>
  );
}
