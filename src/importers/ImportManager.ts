import { parseRobloxBinary, isRobloxBinary } from './RobloxBinaryParser';
import { parseRobloxXML, isRobloxXML } from './RobloxXmlParser';
import { importGLTF, isGLTF, isGLB } from './GltfImporter';
import { importOBJ, isOBJ } from './ObjImporter';
import { importFBX, isFBX } from './FbxImporter';
import { InstanceData } from '../types/Instance';

export type ImportFormat = 'rbxm' | 'rbxl' | 'rbxmx' | 'rbxlx' | 'glb' | 'gltf' | 'obj' | 'fbx' | 'unknown';

export function detectFormat(fileName: string, buffer: ArrayBuffer): ImportFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'rbxm':
    case 'rbxl':
      return ext as ImportFormat;
    case 'rbxmx':
    case 'rbxlx':
      return ext as ImportFormat;
    case 'glb':
      return 'glb';
    case 'gltf':
      return 'gltf';
    case 'obj':
      return 'obj';
    case 'fbx':
      return 'fbx';
  }

  // Try to detect from content
  if (isRobloxBinary(buffer)) {
    return 'rbxm';
  }
  if (isRobloxXML(buffer)) {
    return 'rbxmx';
  }
  if (isGLB(buffer)) {
    return 'glb';
  }
  if (isGLTF(buffer)) {
    return 'gltf';
  }
  if (isFBX(buffer)) {
    return 'fbx';
  }
  if (isOBJ(buffer)) {
    return 'obj';
  }

  return 'unknown';
}

export interface ImportResult {
  instances: InstanceData[];
  format: ImportFormat;
  fileName: string;
}

export async function importFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const format = detectFormat(file.name, buffer);

  let instances: InstanceData[] = [];

  switch (format) {
    case 'rbxm':
    case 'rbxl':
      instances = parseRobloxBinary(buffer);
      break;
    case 'rbxmx':
    case 'rbxlx': {
      const text = await file.text();
      instances = parseRobloxXML(text);
      break;
    }
    case 'glb':
    case 'gltf':
      instances = await importGLTF(buffer, file.name);
      break;
    case 'obj':
      instances = await importOBJ(buffer, file.name);
      break;
    case 'fbx':
      instances = await importFBX(buffer, file.name);
      break;
    default:
      throw new Error(`Unsupported file format: ${file.name}`);
  }

  return { instances, format, fileName: file.name };
}

export function getFormatLabel(format: ImportFormat): string {
  switch (format) {
    case 'rbxm': return 'Roblox Model';
    case 'rbxl': return 'Roblox Place';
    case 'rbxmx': return 'Roblox XML Model';
    case 'rbxlx': return 'Roblox XML Place';
    case 'glb': return 'GLTF Binary';
    case 'gltf': return 'GLTF';
    case 'obj': return 'Wavefront OBJ';
    case 'fbx': return 'Autodesk FBX';
    default: return 'Unknown';
  }
}
