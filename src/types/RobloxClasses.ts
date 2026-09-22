import type { PropertyDefinition, PropertyValue } from './Property';

export type { PropertyDefinition } from './Property';

export type InstanceClassName =
  | 'DataModel'
  | 'Workspace'
  | 'Model'
  | 'Folder'
  | 'Part'
  | 'MeshPart'
  | 'Sound'
  | 'ScreenGui'
  | 'TextButton'
  | 'TextLabel'
  | 'Script'
  | 'LocalScript'
  | 'ModuleScript'
  | 'PointLight'
  | 'SpotLight'
  | 'SurfaceLight'
  | 'Camera';

export interface ClassDefinition {
  className: InstanceClassName;
  displayName: string;
  icon: string;
  inherits: string[];
  properties: PropertyDefinition[];
  canHaveChildren: boolean;
  isService: boolean;
  description: string;
}

export const CLASS_DEFINITIONS: Record<InstanceClassName, ClassDefinition> = {
  DataModel: {
    className: 'DataModel',
    displayName: 'DataModel',
    icon: 'Database',
    inherits: ['Instance'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'DataModel' },
    ],
    canHaveChildren: true,
    isService: true,
    description: 'Root of the instance hierarchy',
  },
  Workspace: {
    className: 'Workspace',
    displayName: 'Workspace',
    icon: 'Box',
    inherits: ['DataModel'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Workspace' },
      { name: 'CurrentCamera', type: 'Instance', defaultValue: null },
      { name: 'Gravity', type: 'number', defaultValue: 196.2 },
      { name: 'DistributedGameTime', type: 'number', defaultValue: 0 },
    ],
    canHaveChildren: true,
    isService: true,
    description: '3D world containing all physical objects',
  },
  Model: {
    className: 'Model',
    displayName: 'Model',
    icon: 'Boxes',
    inherits: ['Instance'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Model' },
      { name: 'LevelOfDetail', type: 'Enum', defaultValue: 'Automatic', enumValues: ['Automatic', 'Manual', 'Disabled'] },
    ],
    canHaveChildren: true,
    isService: false,
    description: 'Groups instances together',
  },
  Folder: {
    className: 'Folder',
    displayName: 'Folder',
    icon: 'Folder',
    inherits: ['Instance'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Folder' },
    ],
    canHaveChildren: true,
    isService: false,
    description: 'Organizational container with no behavior',
  },
  Part: {
    className: 'Part',
    displayName: 'Part',
    icon: 'Box',
    inherits: ['PVInstance', 'BasePart'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Part' },
      { name: 'Position', type: 'Vector3', defaultValue: { x: 0, y: 0, z: 0 } },
      { name: 'Size', type: 'Vector3', defaultValue: { x: 4, y: 1, z: 2 } },
      { name: 'Rotation', type: 'Vector3', defaultValue: { x: 0, y: 0, z: 0 } },
      { name: 'Color', type: 'Color3', defaultValue: { r: 0.639, g: 0.635, b: 0.647 } },
      { name: 'Material', type: 'Enum', defaultValue: 'Plastic', enumValues: ['Plastic', 'Wood', 'Slate', 'Concrete', 'CorrodedMetal', 'DiamondPlate', 'Foil', 'Grass', 'Ice', 'Marble', 'Granite', 'Brick', 'Sand', 'Fabric', 'SmoothPlastic', 'Metal', 'WoodPlanks', 'Cobblestone', 'Air', 'Water', 'LeafyGrass', 'Ground', 'Asphalt', 'Basalt', 'Clay', 'Rock', 'Salt', 'Limestone', 'Pebble', 'Plaster', 'MetalMesh', 'WoodOldPlanks', 'MetalPlate', 'Rust', 'Mud', 'Ground', 'Snow'] },
      { name: 'Transparency', type: 'number', defaultValue: 0, group: 'Appearance' },
      { name: 'Reflectance', type: 'number', defaultValue: 0, group: 'Appearance' },
      { name: 'Anchored', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'CanCollide', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'CanTouch', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'CanQuery', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'CastShadow', type: 'boolean', defaultValue: true, group: 'Appearance' },
      { name: 'Shape', type: 'Enum', defaultValue: 'Block', enumValues: ['Block', 'Ball', 'Cylinder', 'Wedge', 'CornerWedge'] },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Basic 3D primitive block',
  },
  MeshPart: {
    className: 'MeshPart',
    displayName: 'MeshPart',
    icon: 'Box',
    inherits: ['PVInstance', 'BasePart'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'MeshPart' },
      { name: 'Position', type: 'Vector3', defaultValue: { x: 0, y: 0, z: 0 } },
      { name: 'Size', type: 'Vector3', defaultValue: { x: 4, y: 4, z: 4 } },
      { name: 'Rotation', type: 'Vector3', defaultValue: { x: 0, y: 0, z: 0 } },
      { name: 'Color', type: 'Color3', defaultValue: { r: 0.639, g: 0.635, b: 0.647 } },
      { name: 'Material', type: 'Enum', defaultValue: 'Plastic', enumValues: ['Plastic', 'Wood', 'Slate', 'Concrete', 'CorrodedMetal', 'DiamondPlate', 'Foil', 'Grass', 'Ice', 'Marble', 'Granite', 'Brick', 'Sand', 'Fabric', 'SmoothPlastic', 'Metal', 'WoodPlanks', 'Cobblestone'] },
      { name: 'Transparency', type: 'number', defaultValue: 0, group: 'Appearance' },
      { name: 'Reflectance', type: 'number', defaultValue: 0, group: 'Appearance' },
      { name: 'Anchored', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'CanCollide', type: 'boolean', defaultValue: true, group: 'Behavior' },
      { name: 'MeshId', type: 'string', defaultValue: '' },
      { name: 'TextureID', type: 'string', defaultValue: '' },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Part with custom mesh geometry',
  },
  Sound: {
    className: 'Sound',
    displayName: 'Sound',
    icon: 'Volume2',
    inherits: ['Instance'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Sound' },
      { name: 'SoundId', type: 'string', defaultValue: '' },
      { name: 'Volume', type: 'number', defaultValue: 0.5 },
      { name: 'Pitch', type: 'number', defaultValue: 1 },
      { name: 'Looped', type: 'boolean', defaultValue: false },
      { name: 'Playing', type: 'boolean', defaultValue: false },
      { name: 'PlayOnRemove', type: 'boolean', defaultValue: false },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Plays audio',
  },
  ScreenGui: {
    className: 'ScreenGui',
    displayName: 'ScreenGui',
    icon: 'Monitor',
    inherits: ['LayerCollector'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'ScreenGui' },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'IgnoreGuiInset', type: 'boolean', defaultValue: false },
      { name: 'DisplayOrder', type: 'number', defaultValue: 0 },
      { name: 'ResetOnSpawn', type: 'boolean', defaultValue: true },
      { name: 'ZIndexBehavior', type: 'Enum', defaultValue: 'Sibling', enumValues: ['Sibling', 'Overlay'] },
    ],
    canHaveChildren: true,
    isService: false,
    description: '2D UI container for Screen GUIs',
  },
  TextButton: {
    className: 'TextButton',
    displayName: 'TextButton',
    icon: 'MousePointer',
    inherits: ['GuiButton', 'GuiObject'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'TextButton' },
      { name: 'Text', type: 'string', defaultValue: 'Button' },
      { name: 'TextColor3', type: 'Color3', defaultValue: { r: 0.102, g: 0.102, b: 0.102 } },
      { name: 'TextSize', type: 'number', defaultValue: 14 },
      { name: 'TextScaled', type: 'boolean', defaultValue: false },
      { name: 'Font', type: 'Enum', defaultValue: 'SourceSans', enumValues: ['Legacy', 'SourceSans', 'SourceSansBold', 'SourceSansLight', 'SourceSansSemibold', 'Gotham', 'GothamBold', 'GothamSemibold', 'GothamBlack'] },
      { name: 'BackgroundColor3', type: 'Color3', defaultValue: { r: 0.85, g: 0.85, b: 0.85 } },
      { name: 'BackgroundTransparency', type: 'number', defaultValue: 0 },
      { name: 'Position', type: 'UDim2', defaultValue: { xScale: 0, xOffset: 0, yScale: 0, yOffset: 0 } },
      { name: 'Size', type: 'UDim2', defaultValue: { xScale: 0, xOffset: 140, yScale: 0, yOffset: 50 } },
      { name: 'AnchorPoint', type: 'Vector2', defaultValue: { x: 0, y: 0 } },
      { name: 'BorderSizePixel', type: 'number', defaultValue: 1 },
      { name: 'BorderColor3', type: 'Color3', defaultValue: { r: 0.102, g: 0.102, b: 0.102 } },
      { name: 'AutoButtonColor', type: 'boolean', defaultValue: true },
      { name: 'Modal', type: 'boolean', defaultValue: false },
      { name: 'Style', type: 'Enum', defaultValue: 'Custom', enumValues: ['Custom', 'System'] },
    ],
    canHaveChildren: true,
    isService: false,
    description: 'Clickable button with text',
  },
  TextLabel: {
    className: 'TextLabel',
    displayName: 'TextLabel',
    icon: 'Type',
    inherits: ['GuiLabel', 'GuiObject'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'TextLabel' },
      { name: 'Text', type: 'string', defaultValue: 'Label' },
      { name: 'TextColor3', type: 'Color3', defaultValue: { r: 0.102, g: 0.102, b: 0.102 } },
      { name: 'TextSize', type: 'number', defaultValue: 14 },
      { name: 'TextScaled', type: 'boolean', defaultValue: false },
      { name: 'Font', type: 'Enum', defaultValue: 'SourceSans', enumValues: ['Legacy', 'SourceSans', 'SourceSansBold', 'SourceSansLight', 'SourceSansSemibold', 'Gotham', 'GothamBold', 'GothamSemibold'] },
      { name: 'BackgroundColor3', type: 'Color3', defaultValue: { r: 0.85, g: 0.85, b: 0.85 } },
      { name: 'BackgroundTransparency', type: 'number', defaultValue: 1 },
      { name: 'Position', type: 'UDim2', defaultValue: { xScale: 0, xOffset: 0, yScale: 0, yOffset: 0 } },
      { name: 'Size', type: 'UDim2', defaultValue: { xScale: 0, xOffset: 200, yScale: 0, yOffset: 50 } },
      { name: 'AnchorPoint', type: 'Vector2', defaultValue: { x: 0, y: 0 } },
      { name: 'TextWrapped', type: 'boolean', defaultValue: false },
      { name: 'TextXAlignment', type: 'Enum', defaultValue: 'Center', enumValues: ['Left', 'Center', 'Right'] },
      { name: 'TextYAlignment', type: 'Enum', defaultValue: 'Center', enumValues: ['Top', 'Center', 'Bottom'] },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Non-interactive text display',
  },
  Script: {
    className: 'Script',
    displayName: 'Script',
    icon: 'FileCode',
    inherits: ['BaseScript'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Script' },
      { name: 'Source', type: 'string', defaultValue: '' },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'RunContext', type: 'Enum', defaultValue: 'Legacy', enumValues: ['Legacy', 'Disabled', 'Plugin', 'Server', 'Client'] },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Server-side Lua script',
  },
  LocalScript: {
    className: 'LocalScript',
    displayName: 'LocalScript',
    icon: 'FileCode',
    inherits: ['BaseScript'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'LocalScript' },
      { name: 'Source', type: 'string', defaultValue: '' },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'RunContext', type: 'Enum', defaultValue: 'Legacy', enumValues: ['Legacy', 'Disabled', 'Plugin', 'Server', 'Client'] },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Client-side Lua script',
  },
  ModuleScript: {
    className: 'ModuleScript',
    displayName: 'ModuleScript',
    icon: 'FileCode',
    inherits: ['LuaSourceContainer'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'ModuleScript' },
      { name: 'Source', type: 'string', defaultValue: '' },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Reusable Lua module',
  },
  PointLight: {
    className: 'PointLight',
    displayName: 'PointLight',
    icon: 'Lightbulb',
    inherits: ['Light'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'PointLight' },
      { name: 'Brightness', type: 'number', defaultValue: 1 },
      { name: 'Color', type: 'Color3', defaultValue: { r: 1, g: 1, b: 1 } },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'Range', type: 'number', defaultValue: 60 },
      { name: 'Shadows', type: 'boolean', defaultValue: false },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Omnidirectional light source',
  },
  SpotLight: {
    className: 'SpotLight',
    displayName: 'SpotLight',
    icon: 'Lightbulb',
    inherits: ['Light'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'SpotLight' },
      { name: 'Brightness', type: 'number', defaultValue: 1 },
      { name: 'Color', type: 'Color3', defaultValue: { r: 1, g: 1, b: 1 } },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'Range', type: 'number', defaultValue: 60 },
      { name: 'Angle', type: 'number', defaultValue: 90 },
      { name: 'Face', type: 'Enum', defaultValue: 'Front', enumValues: ['Front', 'Back', 'Top', 'Bottom', 'Right', 'Left'] },
      { name: 'Shadows', type: 'boolean', defaultValue: false },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Cone-shaped light source',
  },
  SurfaceLight: {
    className: 'SurfaceLight',
    displayName: 'SurfaceLight',
    icon: 'Lightbulb',
    inherits: ['Light'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'SurfaceLight' },
      { name: 'Brightness', type: 'number', defaultValue: 1 },
      { name: 'Color', type: 'Color3', defaultValue: { r: 1, g: 1, b: 1 } },
      { name: 'Enabled', type: 'boolean', defaultValue: true },
      { name: 'Range', type: 'number', defaultValue: 60 },
      { name: 'Angle', type: 'number', defaultValue: 90 },
      { name: 'Face', type: 'Enum', defaultValue: 'Front', enumValues: ['Front', 'Back', 'Top', 'Bottom', 'Right', 'Left'] },
      { name: 'Shadows', type: 'boolean', defaultValue: false },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Surface-mounted light source',
  },
  Camera: {
    className: 'Camera',
    displayName: 'Camera',
    icon: 'Camera',
    inherits: ['PVInstance'],
    properties: [
      { name: 'Name', type: 'string', defaultValue: 'Camera' },
      { name: 'CFrame', type: 'CFrame', defaultValue: { position: { x: 0, y: 20, z: -30 }, orientation: { x: 0, y: 0, z: 0 } } },
      { name: 'FieldOfView', type: 'number', defaultValue: 70 },
      { name: 'FieldOfViewMode', type: 'Enum', defaultValue: 'Vertical', enumValues: ['Vertical', 'Horizontal', 'Diagonal'] },
      { name: 'NearPlaneZ', type: 'number', defaultValue: 0.5 },
      { name: 'FarPlaneZ', type: 'number', defaultValue: 1000 },
      { name: 'HeadScale', type: 'number', defaultValue: 1 },
    ],
    canHaveChildren: false,
    isService: false,
    description: 'Camera for viewing the 3D world',
  },
};

export function getClassDefinition(className: string): ClassDefinition | undefined {
  return CLASS_DEFINITIONS[className as InstanceClassName];
}

export function getDefaultProperties(className: string): Record<string, PropertyValue> {
  const def = getClassDefinition(className);
  if (!def) return {};
  const props: Record<string, PropertyValue> = {};
  for (const prop of def.properties) {
    props[prop.name] = JSON.parse(JSON.stringify(prop.defaultValue));
  }
  return props;
}

export function getIconForClass(className: string): string {
  return getClassDefinition(className)?.icon || 'Circle';
}

export const SERVICE_CLASSES: InstanceClassName[] = [
  'DataModel',
  'Workspace',
];

export const CONTAINER_CLASSES: InstanceClassName[] = [
  'Model',
  'Folder',
  'ScreenGui',
];

export const PART_CLASSES: InstanceClassName[] = [
  'Part',
  'MeshPart',
];
