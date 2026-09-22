import { useCallback, useState } from 'react';
import { useEditorStore } from '../core/EditorState';

export function FileDropZone({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const { addConsoleOutput } = useEditorStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['rbxm', 'rbxl', 'rbxmx', 'rbxlx', 'glb', 'gltf', 'obj', 'fbx'].includes(ext || '')) {
          addConsoleOutput('log', `Imported: ${file.name}`);
        } else {
          addConsoleOutput('warn', `Unsupported file type: .${ext}`);
        }
      }
    },
    [addConsoleOutput]
  );

  return (
    <div
      className="w-full h-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 bg-accent/10 border-2 border-dashed border-accent rounded z-50 flex items-center justify-center">
          <div className="bg-bg-secondary px-6 py-4 rounded-lg shadow-xl text-center">
            <div className="text-[14px] font-semibold text-text-primary mb-1">
              Drop files to import
            </div>
            <div className="text-[11px] text-text-muted">
              Supports .rbxm, .rbxl, .glb, .gltf, .obj, .fbx
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
