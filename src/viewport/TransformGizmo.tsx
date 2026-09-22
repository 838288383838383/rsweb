import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../core/EditorState';

export function TransformGizmo() {
  const { selectedIds, instances, activeTool, transformSpace, snapEnabled, snapValue, setProperty } =
    useEditorStore();
  const { camera, gl } = useThree();
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedInstance = selectedId ? instances.get(selectedId) : null;

  const objectRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useEffect(() => {
    if (!selectedInstance) return;
    const pos = selectedInstance.properties.Position as any;
    const rot = selectedInstance.properties.Rotation as any;
    if (pos) {
      objectRef.current.position.set(pos.x, pos.y, pos.z);
    }
    if (rot) {
      objectRef.current.rotation.set(
        THREE.MathUtils.degToRad(rot.x),
        THREE.MathUtils.degToRad(rot.y),
        THREE.MathUtils.degToRad(rot.z)
      );
    }
  }, [selectedInstance, selectedId]);

  const mode = activeTool === 'select' ? null : activeTool === 'move' ? 'translate' : activeTool;

  const handleObjectChange = useCallback(() => {
    if (!selectedId || !objectRef.current) return;
    const pos = objectRef.current.position;
    const rot = objectRef.current.rotation;

    setProperty(selectedId, 'Position', {
      x: Math.round(pos.x * 100) / 100,
      y: Math.round(pos.y * 100) / 100,
      z: Math.round(pos.z * 100) / 100,
    });
    setProperty(selectedId, 'Rotation', {
      x: Math.round(THREE.MathUtils.radToDeg(rot.x) * 100) / 100,
      y: Math.round(THREE.MathUtils.radToDeg(rot.y) * 100) / 100,
      z: Math.round(THREE.MathUtils.radToDeg(rot.z) * 100) / 100,
    });
  }, [selectedId, setProperty]);

  if (!selectedInstance || !mode || selectedInstance.className === 'Camera') {
    return null;
  }

  return (
    <TransformControls
      object={objectRef.current}
      mode={mode}
      space={transformSpace}
      size={0.75}
      translationSnap={snapEnabled ? snapValue : null}
      rotationSnap={snapEnabled ? THREE.MathUtils.degToRad(15) : null}
      scaleSnap={snapEnabled ? snapValue : null}
      onObjectChange={handleObjectChange}
      onMouseUp={() => {}}
    />
  );
}
