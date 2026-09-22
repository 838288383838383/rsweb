import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../core/EditorState';
import { useTheme } from '../themes/ThemeContext';
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize,
  Undo2,
  Redo2,
  Play,
  Square,
  Sun,
  Moon,
  Upload,
  Grid3x3,
  Layout,
  Zap,
  Settings,
  Save,
  FolderOpen,
  Download,
} from 'lucide-react';
import { importFile, getFormatLabel } from '../importers/ImportManager';
import { saveScene, loadScene, listScenes, autoSave, type SceneInfo } from '../core/SaveManager';
import { downloadGLTF } from '../core/GltfExporter';
import { SettingsPanel } from './SettingsPanel';

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon size={16} />
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-border-primary mx-1" />;
}

export function Toolbar() {
  const {
    activeTool,
    setTool,
    undo,
    redo,
    canUndo,
    canRedo,
    snapEnabled,
    toggleSnap,
    isPlaying,
    togglePlay,
    layoutMode,
    setLayoutMode,
    instances,
    rootId,
    importInstances,
    addConsoleOutput,
  } = useEditorStore();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sceneName, setSceneName] = useState('Untitled');
  const [scenes, setScenes] = useState<SceneInfo[]>([]);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave(instances, rootId);
    }, 30000);
    return () => clearInterval(interval);
  }, [instances, rootId]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        addConsoleOutput('log', `Importing ${file.name}...`);
        const result = await importFile(file);
        const label = getFormatLabel(result.format);
        addConsoleOutput('log', `Imported ${result.instances.length} instances from ${label}`);
        importInstances(result.instances, 'workspace');
      } catch (error) {
        addConsoleOutput('error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    e.target.value = '';
  }, [addConsoleOutput, importInstances]);

  const handleSave = useCallback(async () => {
    try {
      const id = await saveScene(instances, rootId, sceneName);
      addConsoleOutput('log', `Scene saved: ${sceneName}`);
    } catch (error) {
      addConsoleOutput('error', `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [instances, rootId, sceneName, addConsoleOutput]);

  const handleLoad = useCallback(async (sceneId: string) => {
    try {
      const result = await loadScene(sceneId);
      if (result) {
        const store = useEditorStore.getState();
        // Clear existing and load
        for (const [id] of result.instances) {
          if (id !== 'datamodel' && id !== 'workspace' && id !== 'camera') {
            store.instances.delete(id);
          }
        }
        for (const [id, inst] of result.instances) {
          store.instances.set(id, inst);
        }
        useEditorStore.setState({
          instances: new Map(store.instances),
          rootId: result.rootId,
        });
        addConsoleOutput('log', `Scene loaded: ${sceneId}`);
        setShowLoadDialog(false);
      }
    } catch (error) {
      addConsoleOutput('error', `Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addConsoleOutput]);

  const handleExportGLTF = useCallback(async () => {
    try {
      await downloadGLTF(instances, rootId, sceneName);
      addConsoleOutput('log', 'Exported to GLTF');
    } catch (error) {
      addConsoleOutput('error', `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [instances, rootId, sceneName, addConsoleOutput]);

  const openLoadDialog = useCallback(async () => {
    const sceneList = await listScenes();
    setScenes(sceneList);
    setShowLoadDialog(true);
  }, []);

  const tools: { mode: typeof activeTool; icon: any; label: string }[] = [
    { mode: 'select', icon: MousePointer, label: 'Select (Q)' },
    { mode: 'move', icon: Move, label: 'Move (W)' },
    { mode: 'rotate', icon: RotateCw, label: 'Rotate (E)' },
    { mode: 'scale', icon: Maximize, label: 'Scale (R)' },
  ];

  return (
    <>
      <div className="h-9 flex items-center px-2 gap-0.5 bg-bg-secondary border-b border-border-primary select-none">
        <div className="flex items-center gap-1 mr-2">
          <Zap size={16} className="text-accent" />
          <span className="text-[13px] font-bold text-text-primary">RSweb</span>
        </div>

        <Separator />

        {tools.map((tool) => (
          <ToolButton
            key={tool.mode}
            icon={tool.icon}
            label={tool.label}
            active={activeTool === tool.mode}
            onClick={() => setTool(tool.mode)}
          />
        ))}

        <Separator />

        <ToolButton
          icon={Grid3x3}
          label={`Snap ${snapEnabled ? 'ON' : 'OFF'}`}
          active={snapEnabled}
          onClick={toggleSnap}
        />

        <Separator />

        <ToolButton icon={Upload} label="Import File" onClick={() => fileInputRef.current?.click()} />
        <ToolButton icon={Save} label="Save (Ctrl+S)" onClick={handleSave} />
        <ToolButton icon={FolderOpen} label="Load Scene" onClick={openLoadDialog} />
        <ToolButton icon={Download} label="Export GLTF" onClick={handleExportGLTF} />

        <Separator />

        <ToolButton
          icon={Undo2}
          label="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo()}
        />
        <ToolButton
          icon={Redo2}
          label="Redo (Ctrl+Shift+Z)"
          onClick={redo}
          disabled={!canRedo()}
        />

        <Separator />

        <ToolButton
          icon={isPlaying ? Square : Play}
          label={isPlaying ? 'Stop' : 'Play'}
          active={isPlaying}
          onClick={togglePlay}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1 text-[11px] text-text-muted mr-2">
          <span>{instances.size} objects</span>
        </div>

        <ToolButton
          icon={Layout}
          label={`Layout: ${layoutMode}`}
          onClick={() => {
            const modes = ['classic-2015', 'classic-2026', 'vscode'] as const;
            const idx = modes.indexOf(layoutMode);
            setLayoutMode(modes[(idx + 1) % modes.length]);
          }}
        />

        <ToolButton
          icon={theme === 'dark' ? Moon : Sun}
          label={`Theme: ${theme}`}
          onClick={toggleTheme}
        />

        <ToolButton
          icon={Settings}
          label="Settings"
          onClick={() => setSettingsOpen(true)}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".rbxm,.rbxl,.rbxmx,.rbxlx,.glb,.gltf,.obj,.fbx"
          onChange={handleImport}
        />
      </div>

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-[400px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
              <span className="text-[14px] font-semibold text-text-primary">Load Scene</span>
              <button onClick={() => setShowLoadDialog(false)} className="p-1 hover:bg-bg-hover rounded">
                <span className="text-text-muted">X</span>
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {scenes.length === 0 ? (
                <div className="text-center text-[12px] text-text-muted py-8">No saved scenes</div>
              ) : (
                scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleLoad(scene.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-bg-hover text-left mb-1"
                  >
                    <div>
                      <div className="text-[12px] text-text-primary">{scene.name}</div>
                      <div className="text-[10px] text-text-muted">{scene.instanceCount} instances</div>
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {new Date(scene.modifiedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
