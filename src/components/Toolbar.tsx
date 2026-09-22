import { useCallback } from 'react';
import { useEditorStore, ToolMode } from '../core/EditorState';
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
  Save,
  FolderOpen,
  Plus,
  Grid3x3,
  Layout,
  Zap,
} from 'lucide-react';

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
  } = useEditorStore();
  const { theme, toggleTheme } = useTheme();

  const tools: { mode: ToolMode; icon: any; label: string; shortcut: string }[] = [
    { mode: 'select', icon: MousePointer, label: 'Select (Q)', shortcut: 'Q' },
    { mode: 'move', icon: Move, label: 'Move (W)', shortcut: 'W' },
    { mode: 'rotate', icon: RotateCw, label: 'Rotate (E)', shortcut: 'E' },
    { mode: 'scale', icon: Maximize, label: 'Scale (R)', shortcut: 'R' },
  ];

  return (
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
        <span>{instances.size} instances</span>
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
    </div>
  );
}
