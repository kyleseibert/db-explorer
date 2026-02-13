import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

import type { ForeignKeyRelationship } from '../../types';

interface ConnectionLinesProps {
  relationships: ForeignKeyRelationship[];
  tablePositions: Map<string, [number, number, number]>;
  highlightedRows: Map<string, Set<string>>;
  visible: boolean;
}

// Color mapping for relationships
const REL_COLORS: Record<string, string> = {
  'rel-artist-album': '#60a5fa', // blue
  'rel-album-song': '#a78bfa', // purple
};

interface AnimatedLineProps {
  start: THREE.Vector3;
  mid: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  isActive: boolean;
}

function AnimatedLine({ start, mid, end, color, isActive }: AnimatedLineProps) {
  const lineRef = useRef<{ dashOffset: number }>(null);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.dashOffset -= isActive ? 0.03 : 0.008;
    }
  });

  return (
    <QuadraticBezierLine
      ref={lineRef as React.RefObject<never>}
      start={start}
      mid={mid}
      end={end}
      color={color}
      lineWidth={isActive ? 3 : 1.5}
      dashed
      dashSize={isActive ? 0.3 : 0.2}
      gapSize={0.15}
      opacity={isActive ? 0.9 : 0.4}
      transparent
    />
  );
}

interface TravelingParticleProps {
  start: THREE.Vector3;
  mid: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

function TravelingParticle({ start, mid, end, color }: TravelingParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    progressRef.current = (progressRef.current + delta * 0.4) % 1;
    const t = progressRef.current;

    // Quadratic bezier interpolation
    const x =
      (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * mid.x + t * t * end.x;
    const y =
      (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * mid.y + t * t * end.y;
    const z =
      (1 - t) * (1 - t) * start.z + 2 * (1 - t) * t * mid.z + t * t * end.z;

    meshRef.current.position.set(x, y, z);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={0.5} distance={2} />
    </mesh>
  );
}

export default function ConnectionLines({
  relationships,
  tablePositions,
  highlightedRows,
  visible,
}: ConnectionLinesProps) {
  const lines = useMemo(() => {
    return relationships.map((rel) => {
      const sourcePos = tablePositions.get(rel.sourceTableId);
      const targetPos = tablePositions.get(rel.targetTableId);
      if (!sourcePos || !targetPos) return null;

      const start = new THREE.Vector3(...sourcePos);
      const end = new THREE.Vector3(...targetPos);

      // Midpoint arcs upward for a nice curve
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 1.8,
        (start.z + end.z) / 2
      );

      const color = REL_COLORS[rel.id] ?? '#60a5fa';

      return { rel, start, mid, end, color };
    });
  }, [relationships, tablePositions]);

  if (!visible) return null;

  // Determine if any highlighted relationship is active
  const hasHighlights = highlightedRows.size > 0;

  return (
    <group>
      {lines.map((line) => {
        if (!line) return null;

        // A line is "active" if both its source and target tables have highlighted rows
        const isActive =
          hasHighlights &&
          (highlightedRows.has(line.rel.sourceTableId) ||
            highlightedRows.has(line.rel.targetTableId));

        return (
          <group key={line.rel.id}>
            <AnimatedLine
              start={line.start}
              mid={line.mid}
              end={line.end}
              color={line.color}
              isActive={isActive}
            />
            {isActive && (
              <TravelingParticle
                start={line.start}
                mid={line.mid}
                end={line.end}
                color={line.color}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
