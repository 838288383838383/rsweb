// IndexedDB-based save/load for RSweb scenes

import { get, set, del, keys } from 'idb-keyval';
import { InstanceData, createDefaultScene } from '../types/Instance';
import { SceneData, serializeScene, deserializeScene } from '../types/Scene';

const STORAGE_PREFIX = 'rsweb_scene_';
const SETTINGS_KEY = 'rsweb_settings';
const AUTOSAVE_KEY = 'rsweb_autosave';

export interface SceneInfo {
  id: string;
  name: string;
  modifiedAt: string;
  instanceCount: number;
}

export interface EditorSettings {
  theme: 'dark' | 'light';
  layoutMode: 'classic-2015' | 'classic-2026' | 'vscode';
  snapEnabled: boolean;
  snapValue: number;
  robloxApiKey: string;
  robloxGameId: string;
}

const defaultSettings: EditorSettings = {
  theme: 'dark',
  layoutMode: 'classic-2026',
  snapEnabled: true,
  snapValue: 1,
  robloxApiKey: '',
  robloxGameId: '',
};

export async function saveScene(
  instances: Map<string, InstanceData>,
  rootId: string,
  name: string,
  sceneId?: string
): Promise<string> {
  const id = sceneId || `scene_${Date.now()}`;
  const scene = serializeScene(instances, rootId, name);
  await set(`${STORAGE_PREFIX}${id}`, scene);
  return id;
}

export async function loadScene(sceneId: string): Promise<{ instances: Map<string, InstanceData>; rootId: string } | null> {
  const scene = await get<SceneData>(`${STORAGE_PREFIX}${sceneId}`);
  if (!scene) return null;
  return deserializeScene(scene);
}

export async function deleteScene(sceneId: string): Promise<void> {
  await del(`${STORAGE_PREFIX}${sceneId}`);
}

export async function listScenes(): Promise<SceneInfo[]> {
  const allKeys = await keys();
  const sceneKeys = allKeys.filter(
    (k) => typeof k === 'string' && k.startsWith(STORAGE_PREFIX)
  );

  const scenes: SceneInfo[] = [];
  for (const key of sceneKeys) {
    const scene = await get<SceneData>(key);
    if (scene) {
      scenes.push({
        id: (key as string).replace(STORAGE_PREFIX, ''),
        name: scene.name,
        modifiedAt: scene.metadata.modifiedAt,
        instanceCount: scene.instances.length,
      });
    }
  }

  return scenes.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
}

export async function autoSave(
  instances: Map<string, InstanceData>,
  rootId: string
): Promise<void> {
  const scene = serializeScene(instances, rootId, 'Autosave');
  await set(AUTOSAVE_KEY, scene);
}

export async function loadAutoSave(): Promise<{ instances: Map<string, InstanceData>; rootId: string } | null> {
  const scene = await get<SceneData>(AUTOSAVE_KEY);
  if (!scene) return null;
  return deserializeScene(scene);
}

export async function saveSettings(settings: Partial<EditorSettings>): Promise<void> {
  const current = await getSettings();
  await set(SETTINGS_KEY, { ...current, ...settings });
}

export async function getSettings(): Promise<EditorSettings> {
  const settings = await get<EditorSettings>(SETTINGS_KEY);
  return { ...defaultSettings, ...settings };
}
