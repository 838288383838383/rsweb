import { useEditorStore } from '../core/EditorState';
import { Package, Box, Folder, FileCode, Lightbulb, Volume2 } from 'lucide-react';

const CLASS_ICONS: Record<string, any> = {
  Part: Box,
  MeshPart: Box,
  Model: Package,
  Folder: Folder,
  Script: FileCode,
  LocalScript: FileCode,
  ModuleScript: FileCode,
  PointLight: Lightbulb,
  SpotLight: Lightbulb,
  SurfaceLight: Lightbulb,
  Sound: Volume2,
};

export function AssetsPanel() {
  const { instances, select } = useEditorStore();

  // Show instances from Workspace that aren't the workspace itself or camera
  const workspace = instances.get('workspace');
  const assets = workspace
    ? workspace.children
        .map((id) => instances.get(id))
        .filter((i) => i && i.id !== 'camera')
    : [];

  return (
    <div className="h-full min-h-0 flex flex-col bg-bg-secondary overflow-hidden">
      <div className="px-2 py-1 border-b border-border-primary">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
          Assets
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {assets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package size={24} className="text-text-muted mx-auto mb-2" />
              <div className="text-[12px] text-text-muted">No assets</div>
              <div className="text-[10px] text-text-muted mt-1">
                Drop files or click Import
              </div>
            </div>
          </div>
        ) : (
          <div className="p-1">
            {assets.map((inst) => {
              if (!inst) return null;
              const Icon = CLASS_ICONS[inst.className] || Box;
              return (
                <button
                  key={inst.id}
                  onClick={() => select(inst.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-hover text-left"
                >
                  <Icon size={14} className="text-text-secondary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-text-primary truncate">{inst.name}</div>
                    <div className="text-[9px] text-text-muted">{inst.className}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="px-2 py-1 border-t border-border-primary text-[10px] text-text-muted flex-shrink-0">
        {assets.length} assets
      </div>
    </div>
  );
}
