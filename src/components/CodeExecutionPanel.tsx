import { useState } from 'react';
import { Play, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface CodeExecutionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface OutputLine {
  type: 'stdout' | 'stderr' | 'info';
  text: string;
}

const SIMULATED_OUTPUTS: Record<string, OutputLine[]> = {
  javascript: [
    { type: 'stdout', text: 'Fibonacci sequence: [ 0, 1, 1, 2, 3, 5, 8, 13, 21, 34 ]' },
    { type: 'stdout', text: 'Sum: 88' },
    { type: 'info', text: 'Process exited with code 0' },
    { type: 'info', text: 'Execution time: 12ms' },
  ],
  python: [
    { type: 'stdout', text: "Original: [64, 34, 25, 12, 22, 11, 90]" },
    { type: 'stdout', text: 'Sorted: [11, 12, 22, 25, 34, 64, 90]' },
    { type: 'stdout', text: 'Index of 22: 2' },
    { type: 'info', text: 'Process exited with code 0' },
    { type: 'info', text: 'Execution time: 8ms' },
  ],
  cpp: [
    { type: 'stdout', text: 'Indices: [0, 1]' },
    { type: 'stdout', text: 'Reversed: !dlroW ,olleH' },
    { type: 'info', text: 'Process exited with code 0' },
    { type: 'info', text: 'Execution time: 5ms' },
    { type: 'info', text: 'Compiled with g++ 11.2.0' },
  ],
};

export function CodeExecutionPanel({ isOpen, onToggle }: CodeExecutionPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput([]);
    setHasRun(true);

    // Simulate compilation and execution
    setTimeout(() => {
      setOutput([
        { type: 'info', text: 'Compiling...' },
        { type: 'info', text: 'Running...' },
      ]);
    }, 800);

    setTimeout(() => {
      const lang = 'javascript';
      const results = SIMULATED_OUTPUTS[lang] || SIMULATED_OUTPUTS.javascript;
      setOutput(results);
      setIsRunning(false);
    }, 2000);
  };

  const handleClear = () => {
    setOutput([]);
    setHasRun(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        Run Code
      </button>
    );
  }

  return (
    <div className="bg-slate-950/95 backdrop-blur-xl border-t border-white/10 flex flex-col" style={{ height: '200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Output</h3>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Running...
            </span>
          )}
          {!isRunning && hasRun && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Clear output"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {output.length === 0 && !isRunning && (
          <div className="text-center py-4">
            <p className="text-slate-600 text-sm">Click "Run Code" to execute</p>
            <p className="text-slate-700 text-xs mt-1">Output will appear here</p>
          </div>
        )}
        {output.map((line, i) => (
          <div key={i} className={`flex items-start gap-2 mb-1 ${
            line.type === 'stderr' ? 'text-red-400' :
            line.type === 'info' ? 'text-slate-500' :
            'text-green-400'
          }`}>
            <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
            <span className="break-all">{line.text}</span>
          </div>
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="animate-pulse">Compiling and executing...</span>
          </div>
        )}
      </div>

      {/* Run Button */}
      <div className="px-4 py-2 border-t border-white/10">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
    </div>
  );
}
