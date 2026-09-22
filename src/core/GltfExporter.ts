// GLTF Exporter - exports RSweb scene to GLTF format

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { InstanceData } from '../types/Instance';
import { Vector3Value, Color3Value } from '../types/Property';

function createThreeObject(inst: InstanceData): THREE.Object3D | null {
  switch (inst.className) {
    case 'Part':
    case 'MeshPart': {
      const pos = inst.properties.Position as Vector3Value;
      const rot = inst.properties.Rotation as Vector3Value;
      const size = inst.properties.Size as Vector3Value;
      const color = inst.properties.Color as Color3Value;

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color.r, color.g, color.b) : new THREE.Color(0.639, 0.635, 0.647),
        roughness: 0.7,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = inst.name;

      if (pos) mesh.position.set(pos.x, pos.y, pos.z);
      if (rot) {
        mesh.rotation.set(
          THREE.MathUtils.degToRad(rot.x),
          THREE.MathUtils.degToRad(rot.y),
          THREE.MathUtils.degToRad(rot.z)
        );
      }
      if (size) mesh.scale.set(size.x, size.y, size.z);

      return mesh;
    }
    case 'Model':
    case 'Folder': {
      const group = new THREE.Group();
      group.name = inst.name;
      return group;
    }
    case 'PointLight': {
      const pos = inst.properties.Position as Vector3Value;
      const color = inst.properties.Color as Color3Value;
      const light = new THREE.PointLight(
        color ? new THREE.Color(color.r, color.g, color.b) : new THREE.Color(1, 1, 1),
        (inst.properties.Brightness as number) || 1,
        (inst.properties.Range as number) || 60
      );
      light.name = inst.name;
      if (pos) light.position.set(pos.x, pos.y, pos.z);
      return light;
    }
    case 'SpotLight': {
      const pos = inst.properties.Position as Vector3Value;
      const color = inst.properties.Color as Color3Value;
      const light = new THREE.SpotLight(
        color ? new THREE.Color(color.r, color.g, color.b) : new THREE.Color(1, 1, 1),
        (inst.properties.Brightness as number) || 1
      );
      light.name = inst.name;
      if (pos) light.position.set(pos.x, pos.y, pos.z);
      return light;
    }
    default:
      return null;
  }
}

function buildSceneGraph(
  instances: Map<string, InstanceData>,
  id: string
): THREE.Object3D | null {
  const inst = instances.get(id);
  if (!inst) return null;

  const obj = createThreeObject(inst);
  if (!obj) return null;

  for (const childId of inst.children) {
    const child = buildSceneGraph(instances, childId);
    if (child) obj.add(child);
  }

  return obj;
}

export async function exportToGLTF(
  instances: Map<string, InstanceData>,
  rootId: string,
  binary: boolean = false
): Promise<ArrayBuffer | object> {
  // Build Three.js scene from instance tree
  const scene = new THREE.Scene();
  scene.name = 'RSweb Scene';

  // Add all workspace children
  const workspace = instances.get('workspace');
  if (workspace) {
    for (const childId of workspace.children) {
      const obj = buildSceneGraph(instances, childId);
      if (obj) scene.add(obj);
    }
  }

  // Add ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Add directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => resolve(result),
      (error) => reject(error),
      { binary }
    );
  });
}

export async function downloadGLTF(
  instances: Map<string, InstanceData>,
  rootId: string,
  fileName: string = 'scene'
): Promise<void> {
  try {
    const result = await exportToGLTF(instances, rootId, true);
    const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.glb`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('GLTF export failed:', error);
    throw error;
  }
}
