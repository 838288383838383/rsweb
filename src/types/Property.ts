export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Vector3'
  | 'Vector2'
  | 'CFrame'
  | 'Color3'
  | 'UDim'
  | 'UDim2'
  | 'Enum'
  | 'BrickColor'
  | 'NumberRange'
  | 'Rect'
  | 'Ray'
  | 'Instance';

export interface PropertyDefinition {
  name: string;
  type: PropertyType;
  defaultValue: unknown;
  enumValues?: string[];
  group?: string;
}

export interface Vector3Value {
  x: number;
  y: number;
  z: number;
}

export interface Vector2Value {
  x: number;
  y: number;
}

export interface CFrameValue {
  position: Vector3Value;
  orientation: Vector3Value;
}

export interface Color3Value {
  r: number;
  g: number;
  b: number;
}

export interface UDimValue {
  scale: number;
  offset: number;
}

export interface UDim2Value {
  xScale: number;
  xOffset: number;
  yScale: number;
  yOffset: number;
}

export interface NumberRangeValue {
  min: number;
  max: number;
}

export interface RectValue {
  min: Vector2Value;
  max: Vector2Value;
}

export type PropertyValue =
  | string
  | number
  | boolean
  | Vector3Value
  | Vector2Value
  | CFrameValue
  | Color3Value
  | UDimValue
  | UDim2Value
  | NumberRangeValue
  | RectValue
  | null;

export function createVector3(x = 0, y = 0, z = 0): Vector3Value {
  return { x, y, z };
}

export function createCFrame(
  px = 0, py = 0, pz = 0,
  rx = 0, ry = 0, rz = 0
): CFrameValue {
  return {
    position: createVector3(px, py, pz),
    orientation: createVector3(rx, ry, rz),
  };
}

export function createColor3(r = 1, g = 1, b = 1): Color3Value {
  return { r, g, b };
}

export function createUDim2(xs = 0, xo = 0, ys = 0, yo = 0): UDim2Value {
  return { xScale: xs, xOffset: xo, yScale: ys, yOffset: yo };
}
