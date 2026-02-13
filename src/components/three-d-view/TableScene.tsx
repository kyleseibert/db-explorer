import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import type { DatabaseSchema } from '../../types';

import GridFloor from './GridFloor';
import BackgroundParticles from './BackgroundParticles';
import TablePanel from './TablePanel';
import ConnectionLines from './ConnectionLines';

// Table layout: concave arc arrangement
const TABLE_CONFIGS: Record<
  string,
  {
    position: [number, number, number];
    rotation: [number, number, number];
    glassColor: string;
    accentColor: string;
  }
> = {
  artists: {
    position: [-4.5, 0.5, 0],
    rotation: [0, 0.2, 0],
    glassColor: '#3b82f6',
    accentColor: '#60a5fa',
  },
  albums: {
    position: [0, 0, 1.5],
    rotation: [0, 0, 0],
    glassColor: '#8b5cf6',
    accentColor: '#a78bfa',
  },
  songs: {
    position: [5, 0.5, 0],
    rotation: [0, -0.2, 0],
    glassColor: '#22c55e',
    accentColor: '#4ade80',
  },
};

interface TableSceneProps {
  schema: DatabaseSchema;
  selectedTableId: string | null;
  highlightedRows: Map<string, Set<string>>;
  focusedTableId: string | null;
  showConnections: boolean;
  autoRotate: boolean;
  onRowClick: (tableId: string, rowId: string) => void;
  onTableClick: (tableId: string) => void;
}

function CameraController({
  focusedTableId,
  autoRotate,
}: {
  focusedTableId: string | null;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 4, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const controlsRef = useRef<never>(null);

  useEffect(() => {
    if (focusedTableId && TABLE_CONFIGS[focusedTableId]) {
      const config = TABLE_CONFIGS[focusedTableId];
      const [x, y, z] = config.position;
      // Position camera in front of and above the focused table
      targetPos.current.set(x, y + 2.5, z + 5);
      targetLookAt.current.set(x, y, z);
    } else {
      // Default overview position
      targetPos.current.set(0, 4, 10);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [focusedTableId]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.03);

    // Update orbit controls target
    if (controlsRef.current) {
      const controls = controlsRef.current as unknown as {
        target: THREE.Vector3;
        update: () => void;
      };
      controls.target.lerp(targetLookAt.current, 0.03);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2 + 0.3}
    />
  );
}

export default function TableScene({
  schema,
  selectedTableId,
  highlightedRows,
  focusedTableId,
  showConnections,
  autoRotate,
  onRowClick,
  onTableClick,
}: TableSceneProps) {
  const tablePositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const table of schema.tables) {
      const config = TABLE_CONFIGS[table.id];
      if (config) {
        map.set(table.id, config.position);
      }
    }
    return map;
  }, [schema.tables]);

  return (
    <>
      {/* Scene background color set via Canvas gl prop */}
      <color attach="background" args={['#0f172a']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 8, 5]} intensity={0.8} color="#e2e8f0" />
      <pointLight position={[-5, 6, -3]} intensity={0.4} color="#60a5fa" />

      {/* Camera controls */}
      <CameraController
        focusedTableId={focusedTableId}
        autoRotate={autoRotate}
      />

      {/* Environment */}
      <GridFloor />
      <BackgroundParticles />

      {/* Table panels */}
      {schema.tables.map((table) => {
        const config = TABLE_CONFIGS[table.id];
        if (!config) return null;

        return (
          <TablePanel
            key={table.id}
            table={table}
            position={config.position}
            rotation={config.rotation}
            highlightedRows={highlightedRows.get(table.id)}
            isSelected={selectedTableId === table.id}
            glassColor={config.glassColor}
            accentColor={config.accentColor}
            onRowClick={(rowId) => onRowClick(table.id, rowId)}
            onClick={() => onTableClick(table.id)}
          />
        );
      })}

      {/* Connection lines */}
      <ConnectionLines
        relationships={schema.relationships}
        tablePositions={tablePositions}
        highlightedRows={highlightedRows}
        visible={showConnections}
      />
    </>
  );
}
