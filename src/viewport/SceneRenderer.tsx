import { useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useEditorStore } from '../core/EditorState';
import { InstanceRenderer } from './InstanceRenderer';
import { TransformGizmo } from './TransformGizmo';
import { SelectionHighlight } from './SelectionHighlight';
import * as THREE from 'three';

function CameraController() {
  const controlsRef = useRef<any>(null);
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.1}
      minDistance={1}
      maxDistance={500}
      target={[0, 0, 0]}
    />
  );
}

function ViewportClickHandler() {
  const { deselectAll } = useEditorStore();
  const planeRef = useRef<THREE.Mesh>(null);

  const handleClick = useCallback(
    (e: any) => {
      if (e.object === planeRef.current) {
        deselectAll();
      }
    },
    [deselectAll]
  );

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function FPSCounter() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsRef = useRef(0);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      fpsRef.current = frameCount.current;
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

export function SceneRenderer() {
  const { theme } = useEditorStore();

  return (
    <div className="w-full h-full min-h-0 relative overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [15, 15, 15], fov: 50, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        style={{
          width: '100%',
          height: '100%',
          background: theme === 'dark' ? '#1a1a2e' : '#d4d4d4',
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight
          args={[
            theme === 'dark' ? '#4488ff' : '#ffffff',
            theme === 'dark' ? '#222244' : '#cccccc',
            0.4,
          ]}
        />

        <CameraController />
        <ViewportClickHandler />

        <Grid
          args={[100, 100]}
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={theme === 'dark' ? '#333355' : '#999999'}
          sectionSize={10}
          sectionThickness={1}
          sectionColor={theme === 'dark' ? '#444477' : '#666666'}
          fadeDistance={200}
          fadeStrength={1}
          infiniteGrid
        />

        <InstanceRenderer />
        <TransformGizmo />
        <SelectionHighlight />
        <FPSCounter />
      </Canvas>

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white/60 font-mono">
        RSweb - Roblox Studio Web
      </div>
    </div>
  );
}
