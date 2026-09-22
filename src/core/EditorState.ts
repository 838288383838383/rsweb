import { create } from 'zustand';
import type { InstanceData } from '../types/Instance';
import { InstanceStore, createDefaultScene } from '../types/Instance';
import { CommandHistory } from './CommandHistory';
import type { InstanceClassName } from '../types/RobloxClasses';
import {
  AddInstanceCommand,
  RemoveInstanceCommand,
  SetPropertyCommand,
  RenameInstanceCommand,
} from '../commands/Commands';

export type ToolMode = 'select' | 'move' | 'rotate' | 'scale';
export type TransformSpace = 'world' | 'local';
export type LayoutMode = 'classic-2015' | 'classic-2026' | 'vscode';
export type ThemeMode = 'dark' | 'light';
export type ScriptMode = 'play' | 'live';

interface EditorState {
  instances: Map<string, InstanceData>;
  rootId: string;
  selectedIds: string[];
  hoveredId: string | null;
  activeTool: ToolMode;
  transformSpace: TransformSpace;
  snapEnabled: boolean;
  snapValue: number;
  layoutMode: LayoutMode;
  theme: ThemeMode;
  scriptMode: ScriptMode;
  isPlaying: boolean;
  consoleOutput: Array<{ type: 'log' | 'warn' | 'error'; message: string; timestamp: number }>;
  commandHistory: CommandHistory;

  select: (id: string | null, additive?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  deselectAll: () => void;
  setHovered: (id: string | null) => void;
  setTool: (tool: ToolMode) => void;
  setTransformSpace: (space: TransformSpace) => void;
  toggleSnap: () => void;
  setSnapValue: (value: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setScriptMode: (mode: ScriptMode) => void;
  addInstance: (className: InstanceClassName, parentId: string, name?: string) => string | null;
  removeInstance: (id: string) => void;
  importInstances: (instances: InstanceData[], parentId: string) => void;
  setProperty: (instanceId: string, propertyName: string, value: import('../types/Property').PropertyValue) => void;
  renameInstance: (id: string, newName: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addConsoleOutput: (type: 'log' | 'warn' | 'error', message: string) => void;
  clearConsole: () => void;
  togglePlay: () => void;
  findFirstChild: (parentId: string, name: string) => InstanceData | undefined;
  getChildren: (id: string) => InstanceData[];
  getInstance: (id: string) => InstanceData | undefined;
}

let pendingInstanceId: string | null = null;

export const useEditorStore = create<EditorState>((set, get) => {
  const defaultScene = createDefaultScene();
  const history = new CommandHistory(200);

  return {
    instances: defaultScene.instances,
    rootId: defaultScene.rootId,
    selectedIds: [],
    hoveredId: null,
    activeTool: 'select',
    transformSpace: 'world',
    snapEnabled: true,
    snapValue: 1,
    layoutMode: 'classic-2026',
    theme: 'dark',
    scriptMode: 'play',
    isPlaying: false,
    consoleOutput: [],
    commandHistory: history,

    select: (id, additive = false) => {
      set((state) => {
        if (additive) {
          if (id === null) return { selectedIds: [] };
          const exists = state.selectedIds.includes(id);
          return {
            selectedIds: exists
              ? state.selectedIds.filter((i) => i !== id)
              : [...state.selectedIds, id],
          };
        }
        return { selectedIds: id ? [id] : [] };
      });
    },

    selectMultiple: (ids) => set({ selectedIds: ids }),

    deselectAll: () => set({ selectedIds: [] }),

    setHovered: (id) => set({ hoveredId: id }),

    setTool: (tool) => set({ activeTool: tool }),

    setTransformSpace: (space) => set({ transformSpace: space }),

    toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

    setSnapValue: (value) => set({ snapValue: value }),

    setLayoutMode: (mode) => set({ layoutMode: mode }),

    setTheme: (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    },

    setScriptMode: (mode) => set({ scriptMode: mode }),

    addInstance: (className, parentId, name) => {
      const state = get();
      const parent = state.instances.get(parentId);
      if (!parent) return null;

      const cmd = new AddInstanceCommand(
        { instances: state.instances, rootId: state.rootId },
        className,
        parentId,
        name
      );
      pendingInstanceId = null;
      history.execute(cmd);
      const newInstance = Array.from(state.instances.values()).find(
        (i) => i.parent === parentId && i.className === className && !state.instances.has(i.id)
      );
      set({ instances: new Map(state.instances) });
      return pendingInstanceId;
    },

    removeInstance: (id) => {
      const state = get();
      if (id === state.rootId || id === 'workspace' || id === 'camera' || id === 'datamodel') return;
      const cmd = new RemoveInstanceCommand(
        { instances: state.instances, rootId: state.rootId },
        id
      );
      history.execute(cmd);
      set((s) => ({
        instances: new Map(s.instances),
        selectedIds: s.selectedIds.filter((i) => i !== id),
      }));
    },

    importInstances: (importedInstances, parentId) => {
      const state = get();
      const newInstances = new Map(state.instances);

      // Find root instances (no parent in the imported set)
      const importedIds = new Set(importedInstances.map(i => i.id));
      const rootInstances = importedInstances.filter(i => !i.parent || !importedIds.has(i.parent));

      for (const inst of importedInstances) {
        // Update parent references if parent is in the imported set
        if (inst.parent && importedIds.has(inst.parent)) {
          // Parent is in imported set, keep as-is
        } else if (inst.parent === null) {
          // Root instance, parent to target
          inst.parent = parentId;
        }

        newInstances.set(inst.id, inst);
      }

      // Add root instances to parent's children
      const parent = newInstances.get(parentId);
      if (parent) {
        for (const root of rootInstances) {
          if (!parent.children.includes(root.id)) {
            parent.children = [...parent.children, root.id];
          }
        }
      }

      set({ instances: newInstances });
    },

    setProperty: (instanceId, propertyName, value: import('../types/Property').PropertyValue) => {
      const state = get();
      const cmd = new SetPropertyCommand(
        { instances: state.instances, rootId: state.rootId },
        instanceId,
        propertyName,
        value
      );
      history.execute(cmd);
      set({ instances: new Map(state.instances) });
    },

    renameInstance: (id, newName) => {
      const state = get();
      const cmd = new RenameInstanceCommand(
        { instances: state.instances, rootId: state.rootId },
        id,
        newName
      );
      history.execute(cmd);
      set({ instances: new Map(state.instances) });
    },

    undo: () => {
      history.undo();
      set((s) => ({ instances: new Map(s.instances) }));
    },

    redo: () => {
      history.redo();
      set((s) => ({ instances: new Map(s.instances) }));
    },

    canUndo: () => history.canUndo(),

    canRedo: () => history.canRedo(),

    addConsoleOutput: (type, message) => {
      set((s) => ({
        consoleOutput: [
          ...s.consoleOutput,
          { type, message, timestamp: Date.now() },
        ].slice(-500),
      }));
    },

    clearConsole: () => set({ consoleOutput: [] }),

    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

    findFirstChild: (parentId, name) => {
      const state = get();
      const parent = state.instances.get(parentId);
      if (!parent) return undefined;
      for (const childId of parent.children) {
        const child = state.instances.get(childId);
        if (child && child.name === name) return child;
      }
      return undefined;
    },

    getChildren: (id) => {
      const state = get();
      const inst = state.instances.get(id);
      if (!inst) return [];
      return inst.children
        .map((childId) => state.instances.get(childId))
        .filter((c): c is InstanceData => c !== undefined);
    },

    getInstance: (id) => {
      return get().instances.get(id);
    },
  };
});

export function generateInstanceId(): string {
  return `instance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
