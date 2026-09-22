import { useCallback, useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../core/EditorState';
import { getClassDefinition } from '../types/RobloxClasses';
import type { ClassDefinition, PropertyDefinition } from '../types/RobloxClasses';
import type { PropertyValue, Vector3Value, Color3Value } from '../types/Property';

function Vector3Input({
  value,
  onChange,
}: {
  value: Vector3Value;
  onChange: (v: Vector3Value) => void;
}) {
  const handleChange = (axis: 'x' | 'y' | 'z', numVal: number) => {
    onChange({ ...value, [axis]: numVal });
  };

  return (
    <div className="flex gap-1">
      {(['x', 'y', 'z'] as const).map((axis) => (
        <div key={axis} className="flex-1 flex items-center gap-1">
          <span className="text-[10px] font-bold text-text-muted w-3">
            {axis.toUpperCase()}
          </span>
          <input
            type="number"
            value={Math.round(value[axis] * 100) / 100}
            onChange={(e) => handleChange(axis, parseFloat(e.target.value) || 0)}
            className="w-full px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent"
          />
        </div>
      ))}
    </div>
  );
}

function Color3Input({
  value,
  onChange,
}: {
  value: Color3Value;
  onChange: (v: Color3Value) => void;
}) {
  const hex = `#${[value.r, value.g, value.b]
    .map((c) => Math.round(c * 255).toString(16).padStart(2, '0'))
    .join('')}`;

  const handleHexChange = (hexStr: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
    if (result) {
      onChange({
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      });
    }
  };

  return (
    <div className="flex gap-1 items-center">
      <input
        type="color"
        value={hex}
        onChange={(e) => handleHexChange(e.target.value)}
        className="w-6 h-6 border border-border-primary rounded cursor-pointer"
      />
      <input
        type="text"
        value={hex}
        onChange={(e) => handleHexChange(e.target.value)}
        className="flex-1 px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent font-mono"
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={Math.round(value * 1000) / 1000}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step || 0.1}
      className="w-full px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent"
    />
  );
}

function StringInput({
  value,
  onChange,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent resize-y font-mono"
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent"
    />
  );
}

function BoolInput({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-accent cursor-pointer"
    />
  );
}

function EnumInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-1 py-[2px] text-[11px] bg-bg-input border border-border-primary rounded text-text-primary outline-none focus:border-accent"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function PropertyRow({
  definition,
  value,
  onChange,
}: {
  definition: PropertyDefinition;
  value: PropertyValue;
  onChange: (v: PropertyValue) => void;
}) {
  const renderInput = () => {
    switch (definition.type) {
      case 'Vector3':
        return (
          <Vector3Input
            value={(value as Vector3Value) || { x: 0, y: 0, z: 0 }}
            onChange={onChange}
          />
        );
      case 'Color3':
        return (
          <Color3Input
            value={(value as Color3Value) || { r: 1, g: 1, b: 1 }}
            onChange={onChange}
          />
        );
      case 'number':
        return (
          <NumberInput
            value={(value as number) || 0}
            onChange={onChange}
          />
        );
      case 'string':
        return (
          <StringInput
            value={(value as string) || ''}
            onChange={onChange}
            multiline={definition.name === 'Source'}
          />
        );
      case 'boolean':
        return (
          <BoolInput
            value={(value as boolean) || false}
            onChange={onChange}
          />
        );
      case 'Enum':
        return (
          <EnumInput
            value={(value as string) || ''}
            options={definition.enumValues || []}
            onChange={onChange}
          />
        );
      default:
        return (
          <span className="text-[11px] text-text-muted italic">
            {String(value)}
          </span>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 py-[3px] px-2 hover:bg-bg-hover">
      <div className="w-[40%] text-[11px] text-text-secondary truncate shrink-0">
        {definition.name}
      </div>
      <div className="flex-1 min-w-0">{renderInput()}</div>
    </div>
  );
}

export function InspectorPanel() {
  const { instances, selectedIds, setProperty, renameInstance } = useEditorStore();
  const selectedInstance = selectedIds.length === 1 ? instances.get(selectedIds[0]) : null;

  if (!selectedInstance) {
    return (
      <div className="h-full min-h-0 flex flex-col bg-bg-secondary overflow-hidden">
        <div className="px-2 py-1 border-b border-border-primary">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            Properties
          </div>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-[12px] text-text-muted">No selection</div>
        </div>
      </div>
    );
  }

  const classDef = getClassDefinition(selectedInstance.className);

  const handleChange = (propName: string, value: PropertyValue) => {
    setProperty(selectedInstance.id, propName, value);
  };

  const handleNameChange = (value: string) => {
    renameInstance(selectedInstance.id, value);
  };

  const groupedProps = new Map<string, PropertyDefinition[]>();
  if (classDef) {
    for (const prop of classDef.properties) {
      const group = prop.group || 'Properties';
      if (!groupedProps.has(group)) groupedProps.set(group, []);
      groupedProps.get(group)!.push(prop);
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-bg-secondary overflow-hidden">
      <div className="px-2 py-1 border-b border-border-primary">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
          Properties
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2 border-b border-border-primary">
          <div className="text-[10px] text-text-muted mb-1">{selectedInstance.className}</div>
          <StringInput
            value={selectedInstance.name}
            onChange={handleNameChange}
          />
        </div>
        {Array.from(groupedProps.entries()).map(([group, props]) => (
          <div key={group}>
            <div className="px-2 py-1 text-[10px] font-semibold text-accent uppercase tracking-wide bg-bg-tertiary">
              {group}
            </div>
            {props.map((prop) => (
              <PropertyRow
                key={prop.name}
                definition={prop}
                value={(selectedInstance.properties[prop.name] ?? prop.defaultValue) as import('../types/Property').PropertyValue}
                onChange={(v) => handleChange(prop.name, v)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
