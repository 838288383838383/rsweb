import { useCallback, useState, useEffect } from 'react';
import { useEditorStore } from '../core/EditorState';

interface ContextMenuItem {
  label: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export function ContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const handler = () => setMenu(null);
    window.addEventListener('click', handler);
    window.addEventListener('contextmenu', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('contextmenu', handler);
    };
  }, []);

  if (!menu) return null;

  return (
    <div
      className="fixed z-[9999] bg-bg-secondary border border-border-primary rounded shadow-lg py-1 min-w-[160px]"
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-border-primary my-1" />
        ) : (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              item.action();
              setMenu(null);
            }}
            disabled={item.disabled}
            className={`w-full px-3 py-1 text-[12px] text-left hover:bg-accent hover:text-white ${
              item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${item.danger ? 'text-red-400' : 'text-text-primary'}`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

export function useContextMenu() {
  const { selectedIds, instances, removeInstance, addInstance } = useEditorStore();

  const showContextMenu = useCallback(
    (e: React.MouseEvent, items?: ContextMenuItem[]) => {
      e.preventDefault();
      e.stopPropagation();

      const targetId = selectedIds[0];
      const target = targetId ? instances.get(targetId) : null;

      const defaultItems: ContextMenuItem[] = [
        ...(target
          ? [
              { label: `Add to ${target.name}`, action: () => {}, separator: true },
              { label: 'Add Part', action: () => addInstance('Part', target.id) },
              { label: 'Add Model', action: () => addInstance('Model', target.id) },
              { label: 'Add Folder', action: () => addInstance('Folder', target.id) },
              { label: 'Add Script', action: () => addInstance('Script', target.id) },
              { separator: true, label: '', action: () => {} },
              { label: 'Delete', action: () => removeInstance(target.id), danger: true },
            ]
          : []),
      ];

      const menuItems = items || defaultItems;

      const menu: ContextMenuState = {
        x: e.clientX,
        y: e.clientY,
        items: menuItems.filter((i) => !i.separator || i.label !== ''),
      };

      setMenu(menu);
    },
    [selectedIds, instances, removeInstance, addInstance]
  );

  const setMenu = useState<ContextMenuState | null>(null)[1];

  return { showContextMenu };
}
