import { InstanceClassName } from './RobloxClasses';
import { PropertyValue } from './Property';

let nextId = 1;

export function generateId(): string {
  return `instance_${nextId++}`;
}

export interface InstanceData {
  id: string;
  className: InstanceClassName;
  name: string;
  properties: Record<string, PropertyValue>;
  children: string[];
  parent: string | null;
  locked: boolean;
  visible: boolean;
}

export function createInstance(
  className: InstanceClassName,
  name?: string,
  parent?: string | null
): InstanceData {
  const id = generateId();
  return {
    id,
    className,
    name: name || className,
    properties: {},
    children: [],
    parent: parent || null,
    locked: false,
    visible: true,
  };
}

export interface InstanceStore {
  instances: Map<string, InstanceData>;
  rootId: string;
}

export function createDefaultScene(): InstanceStore {
  const instances = new Map<string, InstanceData>();

  const dataModel: InstanceData = {
    id: 'datamodel',
    className: 'DataModel',
    name: 'DataModel',
    properties: { Name: 'DataModel' },
    children: ['workspace', 'lighting', 'players', 'replicatedstorage'],
    parent: null,
    locked: true,
    visible: true,
  };

  const workspace: InstanceData = {
    id: 'workspace',
    className: 'Workspace',
    name: 'Workspace',
    properties: {
      Name: 'Workspace',
      Gravity: 196.2,
      CurrentCamera: null,
    },
    children: ['camera'],
    parent: 'datamodel',
    locked: true,
    visible: true,
  };

  const camera: InstanceData = {
    id: 'camera',
    className: 'Camera',
    name: 'Camera',
    properties: {
      Name: 'Camera',
      CFrame: {
        position: { x: 0, y: 20, z: -30 },
        orientation: { x: 0, y: 0, z: 0 },
      },
      FieldOfView: 70,
    },
    children: [],
    parent: 'workspace',
    locked: false,
    visible: true,
  };

  const lighting: InstanceData = {
    id: 'lighting',
    className: 'Folder',
    name: 'Lighting',
    properties: { Name: 'Lighting' },
    children: [],
    parent: 'datamodel',
    locked: true,
    visible: true,
  };

  const players: InstanceData = {
    id: 'players',
    className: 'Folder',
    name: 'Players',
    properties: { Name: 'Players' },
    children: [],
    parent: 'datamodel',
    locked: true,
    visible: true,
  };

  const replicatedStorage: InstanceData = {
    id: 'replicatedstorage',
    className: 'Folder',
    name: 'ReplicatedStorage',
    properties: { Name: 'ReplicatedStorage' },
    children: [],
    parent: 'datamodel',
    locked: true,
    visible: true,
  };

  instances.set('datamodel', dataModel);
  instances.set('workspace', workspace);
  instances.set('camera', camera);
  instances.set('lighting', lighting);
  instances.set('players', players);
  instances.set('replicatedstorage', replicatedStorage);

  return { instances, rootId: 'datamodel' };
}

export function getInstancePath(instances: Map<string, InstanceData>, id: string): string[] {
  const path: string[] = [];
  let current = instances.get(id);
  while (current) {
    path.unshift(current.name);
    current = current.parent ? instances.get(current.parent) : undefined;
  }
  return path;
}

export function getDescendants(instances: Map<string, InstanceData>, id: string): string[] {
  const result: string[] = [];
  const instance = instances.get(id);
  if (!instance) return result;
  for (const childId of instance.children) {
    result.push(childId);
    result.push(...getDescendants(instances, childId));
  }
  return result;
}

export function getAncestors(instances: Map<string, InstanceData>, id: string): string[] {
  const result: string[] = [];
  let current = instances.get(id);
  while (current?.parent) {
    result.push(current.parent);
    current = instances.get(current.parent);
  }
  return result;
}
