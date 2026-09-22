import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { InstanceData } from '../types/Instance';

// FBX importer
// Converts FBX scenes to RSweb instances

function traverseMesh(
  object: THREE.Object3D,
  parentId: string | null,
  instances: InstanceData[],
  counter: { value: number }
): InstanceData {
  const id = `fbx_${counter.value++}`;

  const position = {
    x: Math.round(object.position.x * 100) / 100,
    y: Math.round(object.position.y * 100) / 100,
    z: Math.round(object.position.z * 100) / 100,
  };

  const rotation = {
    x: Math.round(THREE.MathUtils.radToDeg(object.rotation.x) * 100) / 100,
    y: Math.round(THREE.MathUtils.radToDeg(object.rotation.y) * 100) / 100,
    z: Math.round(THREE.MathUtils.radToDeg(object.rotation.z) * 100) / 100,
  };

  const scale = {
    x: Math.round(object.scale.x * 100) / 100,
    y: Math.round(object.scale.y * 100) / 100,
    z: Math.round(object.scale.z * 100) / 100,
  };

  let className: 'MeshPart' | 'Model' | 'Folder' = 'Folder';
  let properties: Record<string, any> = { Name: object.name || 'Object' };

  if (object instanceof THREE.Mesh) {
    className = 'MeshPart';
    const material = (object as any).material as THREE.MeshStandardMaterial;
    properties = {
      Name: object.name || 'MeshPart',
      Position: position,
      Rotation: rotation,
      Size: scale,
      Color: material?.color
        ? { r: material.color.r, g: material.color.g, b: material.color.b }
        : { r: 0.639, g: 0.635, b: 0.647 },
      Transparency: material?.transparent ? 1 - material.opacity : 0,
      Material: 'Plastic',
      Anchored: true,
      CanCollide: true,
    };
  } else if (object.children.length > 0) {
    className = 'Model';
    properties = {
      Name: object.name || 'Model',
    };
  }

  const children: string[] = [];
  for (const child of object.children) {
    if (child instanceof THREE.Camera) continue;
    const childInstance = traverseMesh(child, id, instances, counter);
    children.push(childInstance.id);
    instances.push(childInstance);
  }

  return {
    id,
    className,
    name: properties.Name,
    properties,
    children,
    parent: parentId,
    locked: false,
    visible: true,
  };
}

export async function importFBX(buffer: ArrayBuffer, fileName: string): Promise<InstanceData[]> {
  const loader = new FBXLoader();

  return new Promise((resolve, reject) => {
    const onLoad = (object: THREE.Group) => {
      const instances: InstanceData[] = [];
      const counter = { value: 1 };
      const root = traverseMesh(object, null, instances, counter);
      resolve([root, ...instances]);
    };

    const onError = (error: Error) => {
      reject(error);
    };

    try {
      const result = loader.parse(buffer, '');
      onLoad(result as any);
    } catch (error) {
      reject(error);
    }
  });
}

export function isFBX(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder('ascii').decode(buffer.slice(0, 27));
  return text.includes('Kaydara FBX Binary');
}
