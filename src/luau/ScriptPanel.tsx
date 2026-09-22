import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '../core/EditorState';
import { ScriptEditor } from './ScriptEditor';
import { Play, Square, RotateCcw, FileCode, Plus, Trash2, Copy } from 'lucide-react';

const DEFAULT_SCRIPT = `-- RSweb Luau Script
-- Write your Roblox-style Lua code here!

print("Hello from RSweb!")

-- Create a Part in Workspace
local part = Instance.new("Part")
part.Name = "MyPart"
part.Size = Vector3.new(4, 1, 2)
part.Position = Vector3.new(0, 5, 0)
part.Color = Color3.fromRGB(255, 0, 0)
part.Anchored = true
part.Parent = workspace

print("Created part: " .. part.Name)
print("Part position: " .. tostring(part.Position))
`;

interface ScriptEntry {
  id: string;
  name: string;
  source: string;
  type: 'Script' | 'LocalScript' | 'ModuleScript';
}

export function ScriptPanel() {
  const [scripts, setScripts] = useState<ScriptEntry[]>([
    { id: 'default', name: 'Script', source: DEFAULT_SCRIPT, type: 'Script' },
  ]);
  const [activeScriptId, setActiveScriptId] = useState('default');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<Array<{ type: 'log' | 'warn' | 'error'; message: string }>>([]);
  const workerRef = useRef<Worker | null>(null);
  const { addConsoleOutput } = useEditorStore();

  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0];

  const handleSourceChange = useCallback((source: string) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === activeScriptId ? { ...s, source } : s))
    );
  }, [activeScriptId]);

  const executeScript = useCallback(async () => {
    if (isRunning) {
      // Stop
      workerRef.current?.terminate();
      workerRef.current = null;
      setIsRunning(false);
      addConsoleOutput('log', 'Script stopped.');
      return;
    }

    setIsRunning(true);
    setOutput([]);
    addConsoleOutput('log', `Running ${activeScript.name}...`);

    try {
      const worker = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const msg = e.data;
        switch (msg.type) {
          case 'ready':
            // Send shim code first
            import('./RobloxShim').then(({ buildRobloxShimCode }) => {
              worker.postMessage({
                type: 'execute',
                code: buildRobloxShimCode() + '\n' + activeScript.source,
                name: activeScript.name,
              });
            });
            break;
          case 'print':
            setOutput((prev) => [...prev, { type: 'log', message: msg.message }]);
            addConsoleOutput('log', msg.message);
            break;
          case 'result':
            setIsRunning(false);
            if (msg.error) {
              setOutput((prev) => [...prev, { type: 'error', message: msg.error }]);
              addConsoleOutput('error', msg.error);
            } else {
              addConsoleOutput('log', 'Script finished.');
            }
            worker.terminate();
            workerRef.current = null;
            break;
          case 'error':
            setIsRunning(false);
            setOutput((prev) => [...prev, { type: 'error', message: msg.error }]);
            addConsoleOutput('error', msg.error);
            worker.terminate();
            workerRef.current = null;
            break;
        }
      };

      worker.onerror = (e) => {
        setIsRunning(false);
        setOutput((prev) => [...prev, { type: 'error', message: e.message }]);
        addConsoleOutput('error', e.message);
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ type: 'init' });
    } catch (error) {
      setIsRunning(false);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setOutput((prev) => [...prev, { type: 'error', message: msg }]);
      addConsoleOutput('error', msg);
    }
  }, [activeScript, isRunning, addConsoleOutput]);

  const addScript = useCallback(() => {
    const id = `script_${Date.now()}`;
    const newScript: ScriptEntry = {
      id,
      name: `Script${scripts.length + 1}`,
      source: '-- New script\nprint("Hello!")\n',
      type: 'Script',
    };
    setScripts((prev) => [...prev, newScript]);
    setActiveScriptId(id);
  }, [scripts.length]);

  const deleteScript = useCallback((id: string) => {
    if (scripts.length <= 1) return;
    setScripts((prev) => prev.filter((s) => s.id !== id));
    if (activeScriptId === id) {
      setActiveScriptId(scripts.find((s) => s.id !== id)?.id || scripts[0].id);
    }
  }, [scripts, activeScriptId]);

  const duplicateScript = useCallback(() => {
    const id = `script_${Date.now()}`;
    const newScript: ScriptEntry = {
      id,
      name: `${activeScript.name} (Copy)`,
      source: activeScript.source,
      type: activeScript.type,
    };
    setScripts((prev) => [...prev, newScript]);
    setActiveScriptId(id);
  }, [activeScript]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return (
    <div className="h-full min-h-0 flex flex-col bg-bg-secondary overflow-hidden">
      <div className="px-2 py-1 border-b border-border-primary flex items-center gap-2">
        <FileCode size={12} className="text-text-secondary" />
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
          Scripts
        </span>
        <div className="flex-1" />
        <button
          onClick={addScript}
          className="p-1 hover:bg-bg-hover rounded"
          title="New script"
        >
          <Plus size={12} className="text-text-muted" />
        </button>
      </div>

      {/* Script tabs */}
      <div className="flex border-b border-border-primary overflow-x-auto">
        {scripts.map((script) => (
          <button
            key={script.id}
            onClick={() => setActiveScriptId(script.id)}
            className={`px-3 py-1 text-[11px] border-r border-border-primary whitespace-nowrap ${
              script.id === activeScriptId
                ? 'bg-bg-active text-text-primary'
                : 'text-text-secondary hover:bg-bg-hover'
            }`}
          >
            {script.name}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border-primary flex-shrink-0">
        <button
          onClick={executeScript}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] ${
            isRunning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isRunning ? <Square size={10} /> : <Play size={10} />}
          {isRunning ? 'Stop' : 'Run'}
        </button>
        <button
          onClick={duplicateScript}
          className="p-1 hover:bg-bg-hover rounded"
          title="Duplicate script"
        >
          <Copy size={12} className="text-text-muted" />
        </button>
        {scripts.length > 1 && (
          <button
            onClick={() => deleteScript(activeScriptId)}
            className="p-1 hover:bg-bg-hover rounded"
            title="Delete script"
          >
            <Trash2 size={12} className="text-text-muted" />
          </button>
        )}
        <div className="flex-1" />
        <span className="text-[10px] text-text-muted">{activeScript.type}</span>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScriptEditor
          value={activeScript.source}
          onChange={handleSourceChange}
        />
      </div>

      {/* Output */}
      <div className="h-[100px] flex-shrink-0 border-t border-border-primary overflow-y-auto font-mono text-[11px]">
        {output.length === 0 ? (
          <div className="p-2 text-text-muted">Output appears here when you run the script</div>
        ) : (
          output.map((entry, i) => (
            <div
              key={i}
              className={`px-2 py-[2px] ${
                entry.type === 'error' ? 'text-red-400' : 'text-text-primary'
              }`}
            >
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
