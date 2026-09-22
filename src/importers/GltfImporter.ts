import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { InstanceData } from '../types/Instance';

// GLTF/GLB importer
// Converts Three.js scene graph to RSweb instances

function traverseMesh(
  object: THREE.Object3D,
  parentId: string | null,
  instances: InstanceData[],
  counter: { value: number }
): InstanceData {
  const id = `gltf_${counter.value++}`;

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

  let className: 'MeshPart' | 'Folder' | 'Model' = 'Folder';
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
  } else if (object instanceof THREE.Light) {
    if (object instanceof THREE.PointLight) {
      className = 'Folder';
      properties = {
        Name: object.name || 'PointLight',
        Position: position,
      };
    }
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

  const instance: InstanceData = {
    id,
    className,
    name: properties.Name,
    properties,
    children,
    parent: parentId,
    locked: false,
    visible: true,
  };

  return instance;
}

export async function importGLTF(buffer: ArrayBuffer, fileName: string): Promise<InstanceData[]> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    const onLoad = (gltf: GLTF) => {
      const instances: InstanceData[] = [];
      const counter = { value: 1 };

      const root = traverseMesh(gltf.scene, null, instances, counter);

      // Add all instances
      const allInstances = [root, ...instances];
      resolve(allInstances);
    };

    const onError = (event: any) => {
      reject(new Error(event.message || 'GLTF load failed'));
    };

    loader.parse(buffer, '', onLoad, onError);
  });
}

export function isGLTF(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder('utf-8').decode(buffer.slice(0, 200));
  if (text.includes('glTF')) return true;
  try {
    const json = JSON.parse(new TextDecoder('utf-8').decode(buffer.slice(0, 1000)));
    return json.asset?.generator?.includes('glTF') || json.gltfVersion !== undefined;
  } catch {
    return false;
  }
}

export function isGLB(buffer: ArrayBuffer): boolean {
  const view = new Uint8Array(buffer);
  // GLB magic: 0x46546C67 ("glTF")
  return view[0] === 0x67 && view[1] === 0x6C && view[2] === 0x54 && view[3] === 0x46;
}
