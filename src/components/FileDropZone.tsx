import { useCallback, useState } from 'react';
import { useEditorStore } from '../core/EditorState';
import { importFile, getFormatLabel, type ImportFormat } from '../importers/ImportManager';

export function FileDropZone({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const { addConsoleOutput, importInstances } = useEditorStore();

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

  const processFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        try {
          addConsoleOutput('log', `Importing ${file.name}...`);
          const result = await importFile(file);
          const label = getFormatLabel(result.format);
          addConsoleOutput('log', `Imported ${result.instances.length} instances from ${label}: ${file.name}`);
          importInstances(result.instances, 'workspace');
          addConsoleOutput('log', `Added to Workspace successfully.`);
        } catch (error) {
          addConsoleOutput('error', `Failed to import ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    },
    [addConsoleOutput, importInstances]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
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
              .rbxm .rbxl .rbxmx .rbxlx .glb .gltf .obj .fbx
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
