import { useRef, useEffect } from 'react';
import { useEditorStore } from '../core/EditorState';
import { Terminal, Trash2 } from 'lucide-react';

export function ConsolePanel() {
  const { consoleOutput, clearConsole } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const typeColor = {
    log: 'text-text-primary',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <div className="px-2 py-1 border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Terminal size={12} className="text-text-secondary" />
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            Output
          </span>
        </div>
        <button
          onClick={clearConsole}
          className="p-1 hover:bg-bg-hover rounded"
          title="Clear console"
        >
          <Trash2 size={12} className="text-text-muted" />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[11px]">
        {consoleOutput.length === 0 ? (
          <div className="p-2 text-text-muted">No output</div>
        ) : (
          consoleOutput.map((entry, i) => (
            <div
              key={i}
              className={`px-2 py-[2px] hover:bg-bg-hover ${typeColor[entry.type]}`}
            >
              <span className="text-text-muted mr-2">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
