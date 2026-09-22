import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../core/EditorState';
import { saveSettings, getSettings, type EditorSettings } from '../core/SaveManager';
import { Settings, Key, Gamepad2, Save, X } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [settings, setSettingsState] = useState<EditorSettings>({
    theme: 'dark',
    layoutMode: 'classic-2026',
    snapEnabled: true,
    snapValue: 1,
    robloxApiKey: '',
    robloxGameId: '',
  });
  const [saved, setSaved] = useState(false);
  const { setTheme, setLayoutMode, toggleSnap, setSnapValue } = useEditorStore();

  useEffect(() => {
    if (open) {
      getSettings().then(setSettingsState);
    }
  }, [open]);

  const handleSave = useCallback(async () => {
    await saveSettings(settings);
    setTheme(settings.theme);
    setLayoutMode(settings.layoutMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings, setTheme, setLayoutMode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-text-secondary" />
            <span className="text-[14px] font-semibold text-text-primary">Settings</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-bg-hover rounded">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Theme */}
          <div>
            <label className="text-[12px] font-semibold text-text-secondary block mb-2">Theme</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSettingsState((s) => ({ ...s, theme }))}
                  className={`px-4 py-2 rounded text-[12px] border ${
                    settings.theme === theme
                      ? 'border-accent bg-accent text-white'
                      : 'border-border-primary text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="text-[12px] font-semibold text-text-secondary block mb-2">Layout</label>
            <div className="flex gap-2">
              {([
                { value: 'classic-2015', label: 'Classic 2015' },
                { value: 'classic-2026', label: 'Classic 2026' },
                { value: 'vscode', label: 'VS Code' },
              ] as const).map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setSettingsState((s) => ({ ...s, layoutMode: layout.value }))}
                  className={`px-3 py-2 rounded text-[11px] border ${
                    settings.layoutMode === layout.value
                      ? 'border-accent bg-accent text-white'
                      : 'border-border-primary text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          {/* Snap */}
          <div>
            <label className="text-[12px] font-semibold text-text-secondary block mb-2">Grid Snap</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.snapEnabled}
                onChange={(e) => setSettingsState((s) => ({ ...s, snapEnabled: e.target.checked }))}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-[12px] text-text-primary">Enabled</span>
              <input
                type="number"
                value={settings.snapValue}
                onChange={(e) => setSettingsState((s) => ({ ...s, snapValue: parseFloat(e.target.value) || 1 }))}
                min={0.1}
                max={100}
                step={0.5}
                className="w-20 px-2 py-1 text-[12px] bg-bg-input border border-border-primary rounded text-text-primary"
              />
            </div>
          </div>

          {/* Roblox API */}
          <div className="border-t border-border-primary pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Key size={14} className="text-text-secondary" />
              <span className="text-[12px] font-semibold text-text-secondary">Roblox Open Cloud API</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">API Key</label>
                <input
                  type="password"
                  value={settings.robloxApiKey}
                  onChange={(e) => setSettingsState((s) => ({ ...s, robloxApiKey: e.target.value }))}
                  placeholder="Your Roblox Open Cloud API key"
                  className="w-full px-2 py-1 text-[12px] bg-bg-input border border-border-primary rounded text-text-primary placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Game ID (Universe ID)</label>
                <input
                  type="text"
                  value={settings.robloxGameId}
                  onChange={(e) => setSettingsState((s) => ({ ...s, robloxGameId: e.target.value }))}
                  placeholder="e.g. 123456789"
                  className="w-full px-2 py-1 text-[12px] bg-bg-input border border-border-primary rounded text-text-primary placeholder:text-text-muted"
                />
              </div>
              <p className="text-[10px] text-text-muted">
                API key is stored locally in your browser. Never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border-primary">
          {saved && (
            <span className="text-[11px] text-green-400 mr-2">Saved!</span>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] border border-border-primary rounded hover:bg-bg-hover text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-[12px] bg-accent text-white rounded hover:bg-accent-hover flex items-center gap-1"
          >
            <Save size={12} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
