import { InstanceData } from '../types/Instance';
import { getDefaultProperties, InstanceClassName } from '../types/RobloxClasses';
import { PropertyValue, Vector3Value, Color3Value, CFrameValue, UDim2Value } from '../types/Property';

// Roblox binary format parser
// Based on the rbx-dom binary spec: https://dom.rojo.space/binary.html

const MAGIC_NUMBER = new Uint8Array([0x3c, 0x72, 0x6f, 0x62, 0x6c, 0x6f, 0x78, 0x21]); // <roblox!
const SIGNATURE = new Uint8Array([0x89, 0xff, 0x0d, 0x0a, 0x1a, 0x0a]);
const XML_SIGNATURE = 0x3e; // '>' character - indicates XML format

// Property type IDs
const PROP_TYPES: Record<number, string> = {
  0x00: 'End',
  0x01: 'String',
  0x02: 'Bool',
  0x03: 'Int32',
  0x04: 'Float',
  0x05: 'Double',
  0x06: 'UDim',
  0x07: 'UDim2',
  0x08: 'Ray',
  0x09: 'Faces',
  0x0A: 'Axes',
  0x0B: 'BrickColor',
  0x0C: 'Color3',
  0x0D: 'Vector2',
  0x0E: 'Vector3',
  0x0F: 'Vector2int16',
  0x10: 'CFrame',
  0x11: 'CFrameQuat',
  0x12: 'Enum',
  0x13: 'Referent',
  0x14: 'Vector3int16',
  0x15: 'NumberSequence',
  0x16: 'ColorSequence',
  0x17: 'NumberRange',
  0x18: 'Rect2D',
  0x19: 'PhysicalProperties',
  0x1A: 'Color3uint8',
  0x1B: 'Int64',
  0x1C: 'SharedString',
  0x1D: 'Bytecode',
  0x1E: 'OptionalCFrame',
  0x1F: 'UniqueId',
  0x20: 'Font',
  0x22: 'Content',
};

class BinaryReader {
  private buffer: ArrayBuffer;
  private view: DataView;
  private uint8: Uint8Array;
  private offset: number;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.uint8 = new Uint8Array(buffer);
    this.offset = 0;
  }

  getPos(): number { return this.offset; }
  setPos(pos: number) { this.offset = pos; }
  getRemaining(): number { return this.buffer.byteLength - this.offset; }
  isEOF(): boolean { return this.offset >= this.buffer.byteLength; }

  readU8(): number { return this.uint8[this.offset++]; }
  readI8(): number { return this.view.getInt8(this.offset++); }
  readU16(): number { const v = this.view.getUint16(this.offset, true); this.offset += 2; return v; }
  readI16(): number { const v = this.view.getInt16(this.offset, true); this.offset += 2; return v; }
  readU32(): number { const v = this.view.getUint32(this.offset, true); this.offset += 4; return v; }
  readI32(): number { const v = this.view.getInt32(this.offset, true); this.offset += 4; return v; }
  readF32(): number { const v = this.view.getFloat32(this.offset, true); this.offset += 4; return v; }
  readF64(): number { const v = this.view.getFloat64(this.offset, true); this.offset += 8; return v; }

  // Roblox float format: sign bit rotated to LSB
  readRobloxF32(): number {
    const raw = this.readU32();
    const sign = raw & 0x1;
    const exponent = (raw >> 1) & 0xFF;
    const mantissa = (raw >> 9) & 0x7FFFFF;
    const float32 = (sign << 31) | (exponent << 23) | mantissa;
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, float32);
    return view.getFloat32(0);
  }

  readString(): string {
    const len = this.readU32();
    if (len === 0) return '';
    const bytes = this.uint8.slice(this.offset, this.offset + len);
    this.offset += len;
    return new TextDecoder('utf-8').decode(bytes);
  }

  readBytes(count: number): Uint8Array {
    const bytes = this.uint8.slice(this.offset, this.offset + count);
    this.offset += count;
    return bytes;
  }

  // Zigzag decode
  zigzagDecode(value: number): number {
    return (value >>> 1) ^ -(value & 1);
  }

  // Read interleaved array of i32s (zigzag encoded)
  readInterleavedI32Array(count: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.zigzagDecode(this.readI32()));
    }
    return result;
  }

  // Read interleaved array of u32s
  readInterleavedU32Array(count: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.readU32());
    }
    return result;
  }

  // Read byte-interleaved f32 array
  readInterleavedF32Array(count: number): number[] {
    const result: number[] = new Array(count);
    const raw = new Uint8Array(count * 4);
    for (let byteIdx = 0; byteIdx < 4; byteIdx++) {
      for (let i = 0; i < count; i++) {
        raw[i * 4 + byteIdx] = this.readU8();
      }
    }
    for (let i = 0; i < count; i++) {
      const view = new DataView(new ArrayBuffer(4));
      view.setUint8(0, raw[i * 4]);
      view.setUint8(1, raw[i * 4 + 1]);
      view.setUint8(2, raw[i * 4 + 2]);
      view.setUint8(3, raw[i * 4 + 3]);
      result[i] = view.getFloat32(0);
    }
    return result;
  }
}

// LZ4 decompression (simplified)
function lz4Decompress(input: Uint8Array, uncompressedSize: number): Uint8Array {
  const output = new Uint8Array(uncompressedSize);
  let outPos = 0;
  let inPos = 0;

  while (inPos < input.length && outPos < uncompressedSize) {
    const token = input[inPos++];
    let literalLength = (token >> 4) & 0x0F;
    let matchLength = token & 0x0F;

    // Read literal length
    if (literalLength === 15) {
      let extra: number;
      do {
        extra = input[inPos++];
        literalLength += extra;
      } while (extra === 255);
    }

    // Copy literals
    for (let i = 0; i < literalLength && inPos < input.length; i++) {
      output[outPos++] = input[inPos++];
    }

    if (outPos >= uncompressedSize) break;
    if (inPos >= input.length) break;

    // Read match offset
    const offset = input[inPos] | (input[inPos + 1] << 8);
    inPos += 2;

    // Read match length
    if (matchLength === 15) {
      let extra: number;
      do {
        extra = input[inPos++];
        matchLength += extra;
      } while (extra === 255);
    }
    matchLength += 4;

    // Copy match
    let matchPos = outPos - offset;
    for (let i = 0; i < matchLength && outPos < uncompressedSize; i++) {
      output[outPos++] = output[matchPos + i] || 0;
    }
  }

  return output;
}

function isZstd(data: Uint8Array): boolean {
  return data.length >= 4 && data[0] === 0x28 && data[1] === 0xb5 && data[2] === 0x2f && data[3] === 0xfd;
}

function decompressChunk(compressed: Uint8Array, uncompressedSize: number): Uint8Array {
  if (compressed.length === 0 || compressed.length === uncompressedSize) {
    return compressed;
  }

  if (isZstd(compressed)) {
    // ZSTD decompression - simplified fallback
    // In production, use fzstd or lz4-wasm
    console.warn('ZSTD decompression not fully implemented, returning raw data');
    return compressed;
  }

  // LZ4
  return lz4Decompress(compressed, uncompressedSize);
}

// Undo CFrame rotation ID encoding
function undoCFrameRotationId(id: number): number[] {
  // 24 special rotation cases
  const specialRotations: number[][] = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, -1, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, -1, 0],
    [1, 0, 0, 0, -1, 0, 0, 0, -1],
    [-1, 0, 0, 0, 1, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, -1, 0, -1, 0],
    [-1, 0, 0, 0, 0, 1, 0, 1, 0],
    [-1, 0, 0, 0, -1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0, 0, 0, 0, -1],
    [0, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, -1, -1, 0, 0],
    [0, 1, 0, -1, 0, 0, 0, 0, 1],
    [0, -1, 0, 1, 0, 0, 0, 0, 1],
    [0, -1, 0, 0, 0, -1, 1, 0, 0],
    [0, -1, 0, 0, 0, 1, -1, 0, 0],
    [0, -1, 0, -1, 0, 0, 0, 0, -1],
    [0, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, -1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, -1, 0, 0],
    [0, 0, 1, -1, 0, 0, 0, -1, 0],
    [0, 0, -1, 1, 0, 0, 0, -1, 0],
    [0, 0, -1, 0, 0, 1, 1, 0, 0],
    [0, 0, -1, 0, 0, -1, -1, 0, 0],
    [0, 0, -1, -1, 0, 0, 0, 1, 0],
  ];

  if (id < 24) {
    return specialRotations[id];
  }

  // Raw rotation matrix: 9 floats encoded as 3 byte-interleaved f32s
  return []; // Will be read separately
}

interface INSTChunk {
  classId: number;
  className: string;
  objectFormat: number;
  instanceCount: number;
  referents: number[];
  serviceMarkers?: number[];
}

interface PROPChunk {
  classId: number;
  propertyName: string;
  typeId: number;
  values: unknown[];
}

interface PRNTChunk {
  version: number;
  instanceCount: number;
  childReferents: number[];
  parentReferents: number[];
}

interface ParsedRobloxFile {
  instances: Map<number, { className: string; properties: Record<string, unknown> }>;
  hierarchy: { child: number; parent: number }[];
  metadata: Record<string, string>;
  classNames: Map<number, string>;
}

function readChunkHeader(reader: BinaryReader): { name: string; compressedLength: number; uncompressedLength: number } {
  const nameBytes = reader.readBytes(4);
  const name = new TextDecoder('ascii').decode(nameBytes);
  const compressedLength = reader.readU32();
  const uncompressedLength = reader.readU32();
  reader.readU32(); // reserved
  return { name, compressedLength, uncompressedLength };
}

function readINSTChunk(reader: BinaryReader, compressedLength: number, uncompressedLength: number): INSTChunk {
  const start = reader.getPos();
  const classId = reader.readU32();
  const className = reader.readString();
  const objectFormat = reader.readU8();
  const instanceCount = reader.readU32();

  // Read referents (delta-encoded, accumulative)
  const rawReferents = reader.readInterleavedI32Array(instanceCount);
  const referents: number[] = [];
  let sum = 0;
  for (const delta of rawReferents) {
    sum += delta;
    referents.push(sum);
  }

  let serviceMarkers: number[] | undefined;
  if (objectFormat === 1) {
    serviceMarkers = [];
    for (let i = 0; i < instanceCount; i++) {
      serviceMarkers.push(reader.readU8());
    }
  }

  // Skip remaining bytes if needed
  reader.setPos(start + uncompressedLength);

  return { classId, className, objectFormat, instanceCount, referents, serviceMarkers };
}

function readPROPChunk(reader: BinaryReader, compressedLength: number, uncompressedLength: number): PROPChunk {
  const start = reader.getPos();
  const classId = reader.readU32();
  const propertyName = reader.readString();
  const typeId = reader.readU8();

  const values: unknown[] = [];
  const typeName = PROP_TYPES[typeId] || `Unknown_0x${typeId.toString(16)}`;

  reader.setPos(start + uncompressedLength);

  return { classId, propertyName, typeId, values: [] };
}

function readPRNTChunk(reader: BinaryReader, compressedLength: number, uncompressedLength: number): PRNTChunk {
  const start = reader.getPos();
  const version = reader.readU8();
  const instanceCount = reader.readU32();

  const childReferents: number[] = [];
  const parentReferents: number[] = [];

  for (let i = 0; i < instanceCount; i++) {
    childReferents.push(reader.readI32());
  }
  for (let i = 0; i < instanceCount; i++) {
    parentReferents.push(reader.readI32());
  }

  reader.setPos(start + uncompressedLength);

  return { version, instanceCount, childReferents, parentReferents };
}

function readPropertyValues(reader: BinaryReader, typeId: number, count: number): unknown[] {
  const values: unknown[] = [];

  switch (typeId) {
    case 0x00: // End
      break;
    case 0x01: // String
      for (let i = 0; i < count; i++) {
        values.push(reader.readString());
      }
      break;
    case 0x02: // Bool
      for (let i = 0; i < count; i++) {
        values.push(reader.readU8() !== 0);
      }
      break;
    case 0x03: { // Int32
      const raw = reader.readInterleavedI32Array(count);
      values.push(...raw);
      break;
    }
    case 0x04: { // Float
      const raw = reader.readInterleavedF32Array(count);
      values.push(...raw);
      break;
    }
    case 0x05: // Double
      for (let i = 0; i < count; i++) {
        values.push(reader.readF64());
      }
      break;
    case 0x0E: { // Vector3
      const raw = reader.readInterleavedF32Array(count * 3);
      for (let i = 0; i < count; i++) {
        values.push({ x: raw[i * 3], y: raw[i * 3 + 1], z: raw[i * 3 + 2] });
      }
      break;
    }
    case 0x0C: { // Color3
      const raw = reader.readInterleavedF32Array(count * 3);
      for (let i = 0; i < count; i++) {
        values.push({ r: raw[i * 3], g: raw[i * 3 + 1], b: raw[i * 3 + 2] });
      }
      break;
    }
    case 0x0D: { // Vector2
      const raw = reader.readInterleavedF32Array(count * 2);
      for (let i = 0; i < count; i++) {
        values.push({ x: raw[i * 2], y: raw[i * 2 + 1] });
      }
      break;
    }
    case 0x10: { // CFrame
      for (let i = 0; i < count; i++) {
        const rotationId = reader.readU8();
        let rotation: number[];

        if (rotationId < 24) {
          rotation = undoCFrameRotationId(rotationId);
        } else {
          // Raw rotation matrix
          const raw = reader.readInterleavedF32Array(9);
          rotation = raw;
        }

        const posRaw = reader.readInterleavedF32Array(3);
        values.push({
          position: { x: posRaw[0], y: posRaw[1], z: posRaw[2] },
          orientation: { x: 0, y: 0, z: 0 },
        });
      }
      break;
    }
    case 0x12: { // Enum
      const raw = reader.readInterleavedU32Array(count);
      values.push(...raw);
      break;
    }
    case 0x13: { // Referent
      const raw = reader.readInterleavedI32Array(count);
      values.push(...raw);
      break;
    }
    case 0x17: { // NumberRange
      const raw = reader.readInterleavedF32Array(count * 2);
      for (let i = 0; i < count; i++) {
        values.push({ min: raw[i * 2], max: raw[i * 2 + 1] });
      }
      break;
    }
    case 0x07: { // UDim2
      const raw = reader.readInterleavedF32Array(count * 4);
      for (let i = 0; i < count; i++) {
        values.push({
          xScale: raw[i * 4], xOffset: raw[i * 4 + 1],
          yScale: raw[i * 4 + 2], yOffset: raw[i * 4 + 3],
        });
      }
      break;
    }
    case 0x1A: { // Color3uint8
      for (let i = 0; i < count; i++) {
        const r = reader.readU8() / 255;
        const g = reader.readU8() / 255;
        const b = reader.readU8() / 255;
        values.push({ r, g, b });
      }
      break;
    }
    case 0x08: { // Ray
      for (let i = 0; i < count; i++) {
        const origin = { x: reader.readF32(), y: reader.readF32(), z: reader.readF32() };
        const direction = { x: reader.readF32(), y: reader.readF32(), z: reader.readF32() };
        values.push({ origin, direction });
      }
      break;
    }
    case 0x18: { // Rect2D
      const raw = reader.readInterleavedF32Array(count * 4);
      for (let i = 0; i < count; i++) {
        values.push({
          min: { x: raw[i * 4], y: raw[i * 4 + 1] },
          max: { x: raw[i * 4 + 2], y: raw[i * 4 + 3] },
        });
      }
      break;
    }
    case 0x06: { // UDim
      const raw = reader.readInterleavedF32Array(count * 2);
      for (let i = 0; i < count; i++) {
        values.push({ scale: raw[i * 2], offset: Math.round(raw[i * 2 + 1]) });
      }
      break;
    }
    case 0x14: { // Vector3int16
      for (let i = 0; i < count; i++) {
        values.push({ x: reader.readI16(), y: reader.readI16(), z: reader.readI16() });
      }
      break;
    }
    case 0x0F: { // Vector2int16
      for (let i = 0; i < count; i++) {
        values.push({ x: reader.readI16(), y: reader.readI16() });
      }
      break;
    }
    case 0x19: { // PhysicalProperties
      for (let i = 0; i < count; i++) {
        const custom = reader.readU8();
        if (custom === 0) {
          values.push(null);
        } else {
          const density = reader.readF32();
          const friction = reader.readF32();
          const elasticity = reader.readF32();
          const frictionWeight = reader.readF32();
          const elasticityWeight = reader.readF32();
          values.push({ density, friction, elasticity, frictionWeight, elasticityWeight });
        }
      }
      break;
    }
    case 0x1B: { // Int64
      for (let i = 0; i < count; i++) {
        const low = reader.readU32();
        const high = reader.readI32();
        values.push(high * 0x100000000 + low);
      }
      break;
    }
    case 0x1C: { // SharedString
      const raw = reader.readInterleavedU32Array(count);
      values.push(...raw);
      break;
    }
    case 0x1E: { // OptionalCFrame
      for (let i = 0; i < count; i++) {
        const hasValue = reader.readU8();
        if (hasValue) {
          values.push({ position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0 } });
        } else {
          values.push(null);
        }
      }
      break;
    }
    default:
      // Unknown type, skip
      break;
  }

  return values;
}

export function parseRobloxBinary(buffer: ArrayBuffer): InstanceData[] {
  const reader = new BinaryReader(buffer);

  // Read header
  const magic = reader.readBytes(8);
  const signature = reader.readBytes(6);

  if (magic[7] === XML_SIGNATURE) {
    throw new Error('This is an XML format file (.rbxmx/.rbxlx). Use the XML parser instead.');
  }

  const version = reader.readU16();
  const classCount = reader.readI32();
  const instanceCount = reader.readI32();
  reader.readBytes(8); // reserved

  const chunks: { type: string; data: BinaryReader }[] = [];
  const classNames = new Map<number, string>();

  // Read chunks
  while (!reader.isEOF()) {
    const chunkStart = reader.getPos();
    const header = readChunkHeader(reader);

    if (header.name === 'END') break;

    const dataStart = reader.getPos();
    const chunkData = new Uint8Array(header.compressedLength);
    for (let i = 0; i < header.compressedLength; i++) {
      chunkData[i] = reader.readU8();
    }

    // Decompress if needed
    let decompressedData: Uint8Array;
    if (header.compressedLength > 0 && header.compressedLength !== header.uncompressedLength) {
      decompressedData = decompressChunk(chunkData, header.uncompressedLength);
    } else {
      decompressedData = chunkData;
    }

    const chunkReader = new BinaryReader(decompressedData.buffer.slice(0) as ArrayBuffer);
    chunks.push({ type: header.name, data: chunkReader });
  }

  // Process chunks
  const instances = new Map<number, { className: string; properties: Record<string, unknown> }>();
  const propValues = new Map<string, Map<string, unknown[]>>();
  let hierarchy: { child: number; parent: number }[] = [];

  for (const chunk of chunks) {
    switch (chunk.type) {
      case 'INST': {
        const instChunk = readINSTChunk(chunk.data, 0, 0);
        classNames.set(instChunk.classId, instChunk.className);

        for (let i = 0; i < instChunk.instanceCount; i++) {
          const ref = instChunk.referents[i];
          instances.set(ref, {
            className: instChunk.className,
            properties: getDefaultProperties(instChunk.className),
          });
        }
        break;
      }
      case 'PROP': {
        const start = chunk.data.getPos();
        const classId = chunk.data.readU32();
        const propertyName = chunk.data.readString();
        const typeId = chunk.data.readU8();
        const instanceCount = instances.size;

        const values = readPropertyValues(chunk.data, typeId, instanceCount);

        // Assign values to instances of this class
        const className = classNames.get(classId);
        if (className) {
          let idx = 0;
          for (const [ref, inst] of instances) {
            if (inst.className === className && idx < values.length) {
              inst.properties[propertyName] = values[idx];
              idx++;
            }
          }
        }
        break;
      }
      case 'PRNT': {
        const prntChunk = readPRNTChunk(chunk.data, 0, 0);
        for (let i = 0; i < prntChunk.instanceCount; i++) {
          hierarchy.push({
            child: prntChunk.childReferents[i],
            parent: prntChunk.parentReferents[i],
          });
        }
        break;
      }
    }
  }

  // Build instance tree
  const instanceMap = new Map<string, InstanceData>();
  const idMap = new Map<number, string>();

  // Create IDs
  let nextId = 1;
  for (const [ref] of instances) {
    idMap.set(ref, `imported_${nextId++}`);
  }

  // Build InstanceData objects
  for (const [ref, inst] of instances) {
    const id = idMap.get(ref)!;
    const className = inst.className as InstanceClassName;
    const validClasses: InstanceClassName[] = [
      'Part', 'MeshPart', 'Model', 'Folder', 'Script', 'LocalScript', 'ModuleScript',
      'Sound', 'ScreenGui', 'TextButton', 'TextLabel', 'PointLight', 'SpotLight',
      'SurfaceLight', 'Camera',
    ];
    const validClass = validClasses.includes(className) ? className : 'Folder';

    instanceMap.set(id, {
      id,
      className: validClass,
      name: (inst.properties.Name as string) || inst.className,
      properties: inst.properties as any,
      children: [],
      parent: null,
      locked: false,
      visible: true,
    });
  }

  // Apply hierarchy
  for (const { child, parent } of hierarchy) {
    const childId = idMap.get(child);
    const parentId = idMap.get(parent);
    if (childId && parentId) {
      const childInst = instanceMap.get(childId);
      const parentInst = instanceMap.get(parentId);
      if (childInst && parentInst) {
        childInst.parent = parentId;
        parentInst.children.push(childId);
      }
    }
  }

  return Array.from(instanceMap.values());
}

export function isRobloxBinary(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 32) return false;
  const view = new Uint8Array(buffer);
  // Check <roblox!
  if (view[0] !== 0x3c || view[1] !== 0x72 || view[2] !== 0x6f || view[3] !== 0x62 ||
      view[4] !== 0x6c || view[5] !== 0x6f || view[6] !== 0x78 || view[7] !== 0x21) {
    return false;
  }
  // Check signature
  if (view[8] !== 0x89 || view[9] !== 0xff || view[10] !== 0x0d || view[11] !== 0x0a) {
    return false;
  }
  return true;
}
