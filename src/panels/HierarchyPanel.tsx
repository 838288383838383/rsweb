import { useState, useCallback } from 'react';
import { useEditorStore } from '../core/EditorState';
import { InstanceData } from '../types/Instance';
import { getIconForClass } from '../types/RobloxClasses';
import {
  ChevronRight,
  ChevronDown,
  Box,
  Folder,
  Database,
  Lightbulb,
  Camera,
  Monitor,
  FileCode,
  Type,
  MousePointer,
  Volume2,
  Boxes,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Database: <Database size={14} />,
  Box: <Box size={14} />,
  Folder: <Folder size={14} />,
  Lightbulb: <Lightbulb size={14} />,
  Camera: <Camera size={14} />,
  Monitor: <Monitor size={14} />,
  FileCode: <FileCode size={14} />,
  Type: <Type size={14} />,
  MousePointer: <MousePointer size={14} />,
  Volume2: <Volume2 size={14} />,
  Boxes: <Boxes size={14} />,
};

interface TreeNodeProps {
  instance: InstanceData;
  depth: number;
  instances: Map<string, InstanceData>;
}

function TreeNode({ instance, depth, instances }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const { selectedIds, select, hoveredId, setHovered } = useEditorStore();
  const isSelected = selectedIds.includes(instance.id);
  const isHovered = hoveredId === instance.id;
  const hasChildren = instance.children.length > 0;
  const icon = getIconForClass(instance.className);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    select(instance.id, e.ctrlKey || e.metaKey);
  }, [instance.id, select]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setExpanded(!expanded);
  }, [hasChildren, expanded]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    select(instance.id);
  }, [instance.id, select]);

  return (
    <div>
      <div
        className="flex items-center gap-1 py-[2px] pr-2 cursor-pointer select-none group"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(instance.id)}
        onMouseLeave={() => setHovered(null)}
        data-selected={isSelected}
        data-hovered={isHovered}
      >
        <button
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={12} className="text-text-muted" />
            ) : (
              <ChevronRight size={12} className="text-text-muted" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>
        <span className="text-text-secondary shrink-0">
          {ICON_MAP[icon] || <Box size={14} />}
        </span>
        <span className="text-[12px] truncate">{instance.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {instance.children.map((childId) => {
            const child = instances.get(childId);
            if (!child) return null;
            return (
              <TreeNode
                key={childId}
                instance={child}
                depth={depth + 1}
                instances={instances}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HierarchyPanel() {
  const { instances, rootId, selectedIds, select } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const rootInstance = instances.get(rootId);

  const handleBackgroundClick = useCallback(() => {
    select(null);
  }, [select]);

  const filteredInstances = searchQuery
    ? Array.from(instances.values()).filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="h-full min-h-0 flex flex-col bg-bg-secondary overflow-hidden">
      <div className="px-2 py-1 border-b border-border-primary">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
          Explorer
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-[12px] bg-bg-input border border-border-primary rounded text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
        />
      </div>
      <div className="flex-1 overflow-y-auto" onClick={handleBackgroundClick}>
        {filteredInstances ? (
          filteredInstances.map((inst) => (
            <TreeNode
              key={inst.id}
              instance={inst}
              depth={0}
              instances={instances}
            />
          ))
        ) : (
          rootInstance && (
            <TreeNode instance={rootInstance} depth={0} instances={instances} />
          )
        )}
      </div>
      <div className="px-2 py-1 border-t border-border-primary text-[11px] text-text-muted flex-shrink-0">
        {instances.size} instances
      </div>
    </div>
  );
}
