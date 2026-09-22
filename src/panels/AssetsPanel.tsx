import { Package } from 'lucide-react';

export function AssetsPanel() {
  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <div className="px-2 py-1 border-b border-border-primary">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
          Assets
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package size={24} className="text-text-muted mx-auto mb-2" />
          <div className="text-[12px] text-text-muted">No assets</div>
          <div className="text-[10px] text-text-muted mt-1">
            Drop files here to import
          </div>
        </div>
      </div>
    </div>
  );
}
