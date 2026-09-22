import type { Command } from '../core/CommandHistory';
import type { InstanceData, InstanceStore } from '../types/Instance';
import { getDefaultProperties } from '../types/RobloxClasses';
import type { InstanceClassName } from '../types/RobloxClasses';
import type { PropertyValue } from '../types/Property';

export class AddInstanceCommand implements Command {
  description: string;
  private instance: InstanceData;
  private store: InstanceStore;
  private parentId: string;

  constructor(store: InstanceStore, className: InstanceClassName, parentId: string, name?: string) {
    this.store = store;
    this.parentId = parentId;
    this.instance = {
      id: `instance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      className,
      name: name || className,
    properties: getDefaultProperties(className),
    children: [],
    parent: parentId,
    locked: false,
    visible: true,
  };
    this.description = `Add ${className}`;
  }

  execute(): void {
    this.store.instances.set(this.instance.id, { ...this.instance });
    const parent = this.store.instances.get(this.parentId);
    if (parent) {
      parent.children = [...parent.children, this.instance.id];
    }
  }

  undo(): void {
    this.store.instances.delete(this.instance.id);
    const parent = this.store.instances.get(this.parentId);
    if (parent) {
      parent.children = parent.children.filter(id => id !== this.instance.id);
    }
  }
}

export class RemoveInstanceCommand implements Command {
  description: string;
  private instance: InstanceData;
  private store: InstanceStore;
  private parentChildren: string[];

  constructor(store: InstanceStore, instanceId: string) {
    this.store = store;
    const inst = store.instances.get(instanceId);
    if (!inst) throw new Error(`Instance ${instanceId} not found`);
    this.instance = { ...inst };
    const parent = inst.parent ? store.instances.get(inst.parent) : undefined;
    this.parentChildren = parent ? [...parent.children] : [];
    this.description = `Remove ${inst.className}`;
  }

  execute(): void {
    this.store.instances.delete(this.instance.id);
    const parent = this.instance.parent ? this.store.instances.get(this.instance.parent) : undefined;
    if (parent) {
      parent.children = parent.children.filter(id => id !== this.instance.id);
    }
  }

  undo(): void {
    this.store.instances.set(this.instance.id, { ...this.instance });
    const parent = this.instance.parent ? this.store.instances.get(this.instance.parent) : undefined;
    if (parent) {
      parent.children = this.parentChildren;
    }
  }
}

export class SetPropertyCommand implements Command {
  description: string;
  private store: InstanceStore;
  private instanceId: string;
  private propertyName: string;
  private oldValue: PropertyValue | null;
  private newValue: PropertyValue;

  constructor(store: InstanceStore, instanceId: string, propertyName: string, newValue: PropertyValue) {
    this.store = store;
    this.instanceId = instanceId;
    this.propertyName = propertyName;
    this.newValue = newValue;
    const inst = store.instances.get(instanceId);
    this.oldValue = inst?.properties[propertyName] ?? null;
    this.description = `Set ${propertyName}`;
  }

  execute(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (inst) {
      inst.properties = { ...inst.properties, [this.propertyName]: this.newValue };
    }
  }

  undo(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (inst) {
      inst.properties = { ...inst.properties, [this.propertyName]: this.oldValue };
    }
  }
}

export class RenameInstanceCommand implements Command {
  description: string;
  private store: InstanceStore;
  private instanceId: string;
  private oldName: string;
  private newName: string;

  constructor(store: InstanceStore, instanceId: string, newName: string) {
    this.store = store;
    this.instanceId = instanceId;
    this.newName = newName;
    const inst = store.instances.get(instanceId);
    this.oldName = inst?.name || '';
    this.description = `Rename to "${newName}"`;
  }

  execute(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (inst) {
      inst.name = this.newName;
      inst.properties = { ...inst.properties, Name: this.newName };
    }
  }

  undo(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (inst) {
      inst.name = this.oldName;
      inst.properties = { ...inst.properties, Name: this.oldName };
    }
  }
}

export class ReparentInstanceCommand implements Command {
  description: string;
  private store: InstanceStore;
  private instanceId: string;
  private oldParentId: string | null;
  private newParentId: string | null;
  private oldParentChildren: string[];
  private newParentChildren: string[];

  constructor(store: InstanceStore, instanceId: string, newParentId: string | null) {
    this.store = store;
    this.instanceId = instanceId;
    this.newParentId = newParentId;
    const inst = store.instances.get(instanceId);
    this.oldParentId = inst?.parent || null;
    const oldParent = this.oldParentId ? store.instances.get(this.oldParentId) : undefined;
    this.oldParentChildren = oldParent ? [...oldParent.children] : [];
    const newParent = newParentId ? store.instances.get(newParentId) : undefined;
    this.newParentChildren = newParent ? [...newParent.children] : [];
    this.description = `Reparent`;
  }

  execute(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (!inst) return;

    const oldParent = this.oldParentId ? this.store.instances.get(this.oldParentId) : undefined;
    if (oldParent) {
      oldParent.children = oldParent.children.filter(id => id !== this.instanceId);
    }

    inst.parent = this.newParentId;

    const newParent = this.newParentId ? this.store.instances.get(this.newParentId) : undefined;
    if (newParent) {
      newParent.children = [...newParent.children, this.instanceId];
    }
  }

  undo(): void {
    const inst = this.store.instances.get(this.instanceId);
    if (!inst) return;

    const newParent = this.newParentId ? this.store.instances.get(this.newParentId) : undefined;
    if (newParent) {
      newParent.children = newParent.children.filter(id => id !== this.instanceId);
    }

    inst.parent = this.oldParentId;

    const oldParent = this.oldParentId ? this.store.instances.get(this.oldParentId) : undefined;
    if (oldParent) {
      oldParent.children = this.oldParentChildren;
    }
  }
}
