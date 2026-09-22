import { useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../core/EditorState';
import { InstanceData } from '../types/Instance';
import { Vector3Value, Color3Value } from '../types/Property';

function vector3ToThree(v: Vector3Value): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

function color3ToThree(c: Color3Value): THREE.Color {
  return new THREE.Color(c.r, c.g, c.b);
}

interface PartMeshProps {
  instance: InstanceData;
}

function PartMesh({ instance }: PartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { select, selectedIds, hoveredId, setHovered } = useEditorStore();
  const isSelected = selectedIds.includes(instance.id);
  const isHovered = hoveredId === instance.id;

  const position = useMemo(() => {
    const pos = instance.properties.Position as Vector3Value;
    return pos ? vector3ToThree(pos) : new THREE.Vector3();
  }, [instance.properties.Position]);

  const size = useMemo(() => {
    const s = instance.properties.Size as Vector3Value;
    return s ? vector3ToThree(s) : new THREE.Vector3(4, 1, 2);
  }, [instance.properties.Size]);

  const rotation = useMemo(() => {
    const rot = instance.properties.Rotation as Vector3Value;
    if (!rot) return new THREE.Euler();
    return new THREE.Euler(
      THREE.MathUtils.degToRad(rot.x),
      THREE.MathUtils.degToRad(rot.y),
      THREE.MathUtils.degToRad(rot.z)
    );
  }, [instance.properties.Rotation]);

  const color = useMemo(() => {
    const c = instance.properties.Color as Color3Value;
    return c ? color3ToThree(c) : new THREE.Color(0.639, 0.635, 0.647);
  }, [instance.properties.Color]);

  const transparency = (instance.properties.Transparency as number) || 0;
  const anchored = instance.properties.Anchored !== false;

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      select(instance.id, e.ctrlKey || e.metaKey);
    },
    [instance.id, select]
  );

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      setHovered(instance.id);
      document.body.style.cursor = 'pointer';
    },
    [instance.id, setHovered]
  );

  const handlePointerOut = useCallback(() => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  }, [setHovered]);

  const geometry = useMemo(() => {
    const shape = instance.properties.Shape as string;
    switch (shape) {
      case 'Ball':
        return new THREE.SphereGeometry(1, 32, 16);
      case 'Cylinder':
        return new THREE.CylinderGeometry(1, 1, 1, 32);
      case 'Wedge':
        return new THREE.ConeGeometry(1, 1, 4);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [instance.properties.Shape]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={size}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        transparent={transparency > 0}
        opacity={1 - transparency}
        roughness={0.7}
        metalness={0.1}
      />
      {(isSelected || isHovered) && (
        <mesh scale={[1.001, 1.001, 1.001]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={isSelected ? '#00aaff' : '#ffaa00'}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </mesh>
  );
}

interface LightProps {
  instance: InstanceData;
}

function PointLightMesh({ instance }: LightProps) {
  const position = useMemo(() => {
    const pos = instance.properties.Position as Vector3Value;
    return pos ? vector3ToThree(pos) : new THREE.Vector3();
  }, [instance.properties.Position]);

  const color = useMemo(() => {
    const c = instance.properties.Color as Color3Value;
    return c ? color3ToThree(c) : new THREE.Color(1, 1, 1);
  }, [instance.properties.Color]);

  const brightness = (instance.properties.Brightness as number) || 1;
  const range = (instance.properties.Range as number) || 60;

  return (
    <group position={position}>
      <pointLight color={color} intensity={brightness} distance={range} castShadow />
      <mesh>
        <sphereGeometry args={[0.3, 16, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function SpotLightMesh({ instance }: LightProps) {
  const position = useMemo(() => {
    const pos = instance.properties.Position as Vector3Value;
    return pos ? vector3ToThree(pos) : new THREE.Vector3();
  }, [instance.properties.Position]);

  const color = useMemo(() => {
    const c = instance.properties.Color as Color3Value;
    return c ? color3ToThree(c) : new THREE.Color(1, 1, 1);
  }, [instance.properties.Color]);

  const brightness = (instance.properties.Brightness as number) || 1;
  const range = (instance.properties.Range as number) || 60;
  const angle = THREE.MathUtils.degToRad((instance.properties.Angle as number) || 90);

  return (
    <group position={position}>
      <spotLight color={color} intensity={brightness} distance={range} angle={angle / 2} castShadow />
      <mesh>
        <coneGeometry args={[0.2, 0.5, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function SurfaceLightMesh({ instance }: LightProps) {
  const position = useMemo(() => {
    const pos = instance.properties.Position as Vector3Value;
    return pos ? vector3ToThree(pos) : new THREE.Vector3();
  }, [instance.properties.Position]);

  const color = useMemo(() => {
    const c = instance.properties.Color as Color3Value;
    return c ? color3ToThree(c) : new THREE.Color(1, 1, 1);
  }, [instance.properties.Color]);

  const brightness = (instance.properties.Brightness as number) || 1;

  return (
    <group position={position}>
      <rectAreaLight color={color} intensity={brightness} width={2} height={2} />
      <mesh>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function InstanceNode({ instance }: { instance: InstanceData }) {
  const { instances } = useEditorStore();

  const renderComponent = () => {
    switch (instance.className) {
      case 'Part':
      case 'MeshPart':
        return <PartMesh instance={instance} />;
      case 'PointLight':
        return <PointLightMesh instance={instance} />;
      case 'SpotLight':
        return <SpotLightMesh instance={instance} />;
      case 'SurfaceLight':
        return <SurfaceLightMesh instance={instance} />;
      default:
        return null;
    }
  };

  return (
    <group>
      {renderComponent()}
      {instance.children.map((childId) => {
        const child = instances.get(childId);
        if (!child) return null;
        return <InstanceNode key={childId} instance={child} />;
      })}
    </group>
  );
}

export function InstanceRenderer() {
  const { instances, rootId } = useEditorStore();
  const rootInstance = instances.get('workspace');

  if (!rootInstance) return null;

  return (
    <group>
      {rootInstance.children.map((childId) => {
        const child = instances.get(childId);
        if (!child) return null;
        return <InstanceNode key={childId} instance={child} />;
      })}
    </group>
  );
}
