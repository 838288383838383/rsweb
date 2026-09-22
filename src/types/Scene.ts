import { InstanceData } from './Instance';

export interface SceneData {
  name: string;
  version: number;
  instances: InstanceData[];
  rootId: string;
  metadata: {
    createdAt: string;
    modifiedAt: string;
    author: string;
    description: string;
  };
}

export function serializeScene(
  instances: Map<string, InstanceData>,
  rootId: string,
  name: string = 'Untitled'
): SceneData {
  return {
    name,
    version: 1,
    instances: Array.from(instances.values()),
    rootId,
    metadata: {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      author: 'RSweb User',
      description: '',
    },
  };
}

export function deserializeScene(data: SceneData): { instances: Map<string, InstanceData>; rootId: string } {
  const instances = new Map<string, InstanceData>();
  for (const inst of data.instances) {
    instances.set(inst.id, inst);
  }
  return { instances, rootId: data.rootId };
}
