import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../core/EditorState';
import { HierarchyPanel } from './HierarchyPanel';
import { InspectorPanel } from './InspectorPanel';
import { ConsolePanel } from './ConsolePanel';
import { AssetsPanel } from './AssetsPanel';
import { SceneRenderer } from '../viewport/SceneRenderer';
import { Toolbar } from '../components/Toolbar';
import { FileDropZone } from '../components/FileDropZone';
import { ScriptPanel } from '../luau/ScriptPanel';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

function StatusBar() {
  const { instances, selectedIds, activeTool, snapEnabled, isPlaying } = useEditorStore();

  return (
    <div className="h-6 flex items-center px-2 gap-3 bg-bg-secondary border-t border-border-primary text-[11px] text-text-muted">
      <span>{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}</span>
      <span>|</span>
      <span>{instances.size} objects</span>
      {selectedIds.length > 0 && (
        <>
          <span>|</span>
          <span>{selectedIds.length} selected</span>
        </>
      )}
      <span>|</span>
      <span>Snap: {snapEnabled ? 'ON' : 'OFF'}</span>
      {isPlaying && (
        <>
          <span>|</span>
          <span className="text-green-400">PLAYING</span>
        </>
      )}
      <div className="flex-1" />
      <span>RSweb v0.1.0</span>
    </div>
  );
}

export function EditorLayout() {
  const { layoutMode, undo, redo, setTool } = useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'q':
          setTool('select');
          break;
        case 'w':
          setTool('move');
          break;
        case 'e':
          setTool('rotate');
          break;
        case 'r':
          setTool('scale');
          break;
      }
    },
    [undo, redo, setTool]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (layoutMode === 'classic-2015') {
    return (
      <div className="w-full h-full flex flex-col min-h-0">
        <Toolbar />
        <FileDropZone>
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="w-[250px] border-r border-border-primary flex-shrink-0 overflow-hidden">
              <HierarchyPanel />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <SceneRenderer />
            </div>
            <div className="w-[280px] border-l border-border-primary flex-shrink-0 overflow-hidden">
              <InspectorPanel />
            </div>
          </div>
        </FileDropZone>
        <StatusBar />
      </div>
    );
  }

  if (layoutMode === 'classic-2026') {
    return (
      <div className="w-full h-full flex flex-col min-h-0">
        <Toolbar />
        <FileDropZone>
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="w-[240px] border-r border-border-primary flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <HierarchyPanel />
              </div>
              <div className="h-[200px] border-t border-border-primary flex-shrink-0 overflow-hidden">
                <AssetsPanel />
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <SceneRenderer />
              </div>
              <div className="h-[300px] border-t border-border-primary flex flex-shrink-0 overflow-hidden">
                <div className="flex-1 min-w-0 border-r border-border-primary overflow-hidden">
                  <ScriptPanel />
                </div>
                <div className="w-[300px] flex-shrink-0 overflow-hidden">
                  <ConsolePanel />
                </div>
              </div>
            </div>
            <div className="w-[280px] border-l border-border-primary flex-shrink-0 overflow-hidden">
              <InspectorPanel />
            </div>
          </div>
        </FileDropZone>
        <StatusBar />
      </div>
    );
  }

  // VS Code layout
  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <Toolbar />
      <FileDropZone>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Allotment>
            <Allotment.Pane minSize={200}>
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <HierarchyPanel />
                </div>
                <div className="h-[200px] border-t border-border-primary flex-shrink-0 overflow-hidden">
                  <AssetsPanel />
                </div>
              </div>
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <SceneRenderer />
                </div>
                <div className="h-[300px] border-t border-border-primary flex flex-shrink-0 overflow-hidden">
                  <div className="flex-1 min-w-0 border-r border-border-primary overflow-hidden">
                    <ScriptPanel />
                  </div>
                  <div className="w-[300px] flex-shrink-0 overflow-hidden">
                    <ConsolePanel />
                  </div>
                </div>
              </div>
            </Allotment.Pane>
            <Allotment.Pane minSize={200}>
              <InspectorPanel />
            </Allotment.Pane>
          </Allotment>
        </div>
      </FileDropZone>
      <StatusBar />
    </div>
  );
}
