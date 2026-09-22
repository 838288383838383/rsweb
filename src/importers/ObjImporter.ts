import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { InstanceData } from '../types/Instance';

// OBJ importer
// Converts OBJ meshes to RSweb instances

function traverseMesh(
  object: THREE.Object3D,
  parentId: string | null,
  instances: InstanceData[],
  counter: { value: number }
): InstanceData {
  const id = `obj_${counter.value++}`;

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
    const material = object.material as THREE.MeshStandardMaterial;
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

export async function importOBJ(buffer: ArrayBuffer, fileName: string): Promise<InstanceData[]> {
  const loader = new OBJLoader();
  const text = new TextDecoder('utf-8').decode(buffer);

  return new Promise((resolve, reject) => {
    try {
      const object = loader.parse(text);
      const instances: InstanceData[] = [];
      const counter = { value: 1 };
      const root = traverseMesh(object, null, instances, counter);
      resolve([root, ...instances]);
    } catch (error) {
      reject(error);
    }
  });
}

export function isOBJ(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder('utf-8').decode(buffer.slice(0, 500));
  return text.startsWith('# OBJ') || text.startsWith('v ') || text.startsWith('o ') || text.startsWith('g ');
}
