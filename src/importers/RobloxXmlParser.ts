import { InstanceData } from '../types/Instance';
import { getDefaultProperties, InstanceClassName } from '../types/RobloxClasses';

// Roblox XML format parser
// Handles .rbxmx and .rbxlx files

interface XMLProp {
  name: string;
  type: string;
  values: string[];
}

interface XMLInstance {
  class: string;
  referent: string;
  properties: XMLProp[];
  children: XMLInstance[];
}

function parseXMLProperties(propElement: Element): XMLProp {
  const name = propElement.getAttribute('name') || '';
  const type = propElement.getAttribute('type') || propElement.tagName;

  const values: string[] = [];
  for (const child of Array.from(propElement.children)) {
    if (child.tagName === 'Item') {
      values.push(child.textContent || '');
    } else {
      values.push(child.textContent || '');
    }
  }

  return { name, type, values };
}

function parseXMLInstance(instElement: Element): XMLInstance {
  const className = instElement.getAttribute('class') || 'Folder';
  const referent = instElement.getAttribute('referent') || '';

  const properties: XMLProp[] = [];
  const children: XMLInstance[] = [];

  for (const child of Array.from(instElement.children)) {
    if (child.tagName === 'Item') {
      children.push(parseXMLInstance(child));
    } else if (child.tagName !== 'meta') {
      properties.push(parseXMLProperties(child));
    }
  }

  return { class: className, referent, properties, children };
}

function parseRobloxXMLString(xmlString: string): XMLInstance[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Failed to parse XML: ' + errorNode.textContent);
  }

  const roblox = doc.querySelector('roblox');
  if (!roblox) {
    throw new Error('Invalid Roblox XML: missing <roblox> root element');
  }

  const instances: XMLInstance[] = [];
  for (const child of Array.from(roblox.children)) {
    if (child.tagName === 'Item') {
      instances.push(parseXMLInstance(child));
    }
  }

  return instances;
}

function xmlInstanceToInstanceData(
  xmlInst: XMLInstance,
  parent: string | null,
  map: Map<string, InstanceData>
): InstanceData {
  const id = xmlInst.referent || `xml_${Math.random().toString(36).slice(2, 10)}`;
  const className = xmlInst.class as InstanceClassName;

  const validClasses: InstanceClassName[] = [
    'Part', 'MeshPart', 'Model', 'Folder', 'Script', 'LocalScript', 'ModuleScript',
    'Sound', 'ScreenGui', 'TextButton', 'TextLabel', 'PointLight', 'SpotLight',
    'SurfaceLight', 'Camera',
  ];
  const validClass = validClasses.includes(className) ? className : 'Folder';

  const properties: Record<string, any> = getDefaultProperties(validClass);

  // Parse properties from XML
  for (const prop of xmlInst.properties) {
    if (prop.name === 'Name') {
      properties.Name = prop.values[0] || validClass;
    } else {
      // Store as string, conversion will happen when rendering
      properties[prop.name] = prop.values.length === 1 ? prop.values[0] : prop.values;
    }
  }

  const childIds: string[] = [];
  for (const childXml of xmlInst.children) {
    const childData = xmlInstanceToInstanceData(childXml, id, map);
    childIds.push(childData.id);
    map.set(childData.id, childData);
  }

  const instanceData: InstanceData = {
    id,
    className: validClass,
    name: properties.Name || validClass,
    properties,
    children: childIds,
    parent,
    locked: false,
    visible: true,
  };

  return instanceData;
}

export function parseRobloxXML(xmlString: string): InstanceData[] {
  const xmlInstances = parseRobloxXMLString(xmlString);
  const map = new Map<string, InstanceData>();

  const results: InstanceData[] = [];
  for (const xmlInst of xmlInstances) {
    const instanceData = xmlInstanceToInstanceData(xmlInst, null, map);
    results.push(instanceData);
    for (const [id, inst] of map) {
      if (!results.find(r => r.id === id)) {
        results.push(inst);
      }
    }
  }

  // Add all from map
  for (const [id, inst] of map) {
    if (!results.find(r => r.id === id)) {
      results.push(inst);
    }
  }

  return results.length > 0 ? results : Array.from(map.values());
}

export function isRobloxXML(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 32) return false;
  const view = new Uint8Array(buffer);
  // Check for XML declaration or <roblox> tag
  const text = new TextDecoder('utf-8').decode(buffer.slice(0, 200));
  return text.includes('<?xml') || text.includes('<roblox');
}
