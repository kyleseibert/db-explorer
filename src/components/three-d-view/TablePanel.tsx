import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';

import type { Table } from '../../types';

interface TablePanelProps {
  table: Table;
  position: [number, number, number];
  rotation?: [number, number, number];
  highlightedRows?: Set<string>;
  isSelected: boolean;
  glassColor: string;
  accentColor: string;
  onRowClick: (rowId: string) => void;
  onClick: () => void;
}

export default function TablePanel({
  table,
  position,
  rotation = [0, 0, 0],
  highlightedRows,
  isSelected,
  glassColor,
  accentColor,
  onRowClick,
  onClick,
}: TablePanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate panel dimensions based on content
  const panelWidth = Math.max(3.2, table.columns.length * 0.9);
  const panelHeight = Math.max(2.5, 0.6 + table.rows.length * 0.32);

  // Subtle hover animation
  useFrame(() => {
    if (!meshRef.current) return;
    const target = hovered || isSelected ? 0.08 : 0;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      isSelected ? 0.15 : target,
      0.08
    );
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Glass panel background */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={isSelected ? 0.35 : 0.2}
          side={THREE.DoubleSide}
          emissive={glassColor}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Glowing border */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[panelWidth + 0.06, panelHeight + 0.06]} />
        <meshBasicMaterial
          color={isSelected ? accentColor : '#475569'}
          transparent
          opacity={isSelected ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Table name (3D text via troika — always crisp) */}
      <Text
        position={[0, panelHeight / 2 + 0.25, 0.01]}
        fontSize={0.22}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
      >
        {table.name}
      </Text>

      {/*
        HTML table content — screen-space overlay anchored to 3D position.
        By NOT using `transform`, the Html is rendered at full browser resolution
        (no pixelation) and follows the 3D point like a tooltip/label.
        `center` places the anchor in the middle of the element.
      */}
      <Html
        position={[0, 0, 0.02]}
        center
        style={{ pointerEvents: 'auto', userSelect: 'none' }}
      >
        <div
          style={{
            width: '220px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            border: `1px solid ${isSelected ? accentColor + '60' : 'rgba(71,85,105,0.5)'}`,
            overflow: 'hidden',
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            boxShadow: isSelected
              ? `0 0 20px ${accentColor}20`
              : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '5px 8px',
              borderBottom: '1px solid rgba(71, 85, 105, 0.4)',
              background: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            {table.columns.map((col) => (
              <div
                key={col.id}
                style={{
                  flex: 1,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: col.isPrimaryKey
                    ? '#fbbf24'
                    : col.isForeignKey
                      ? '#60a5fa'
                      : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  padding: '1px 2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {col.isPrimaryKey ? '🔑 ' : col.isForeignKey ? '🔗 ' : ''}
                {col.name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {table.rows.map((row) => {
            const isHighlighted = highlightedRows?.has(row.id);
            return (
              <div
                key={row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(row.id);
                }}
                style={{
                  display: 'flex',
                  gap: '2px',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  background: isHighlighted
                    ? `${accentColor}20`
                    : 'transparent',
                  boxShadow: isHighlighted
                    ? `inset 0 0 0 1px ${accentColor}60`
                    : 'none',
                  borderRadius: '3px',
                  margin: '1px 3px',
                }}
                onMouseEnter={(e) => {
                  if (!isHighlighted) {
                    (e.currentTarget as HTMLElement).style.background =
                      'rgba(71, 85, 105, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHighlighted) {
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                  }
                }}
              >
                {table.columns.map((col) => (
                  <div
                    key={col.id}
                    style={{
                      flex: 1,
                      fontSize: '10px',
                      color: isHighlighted ? '#e2e8f0' : '#cbd5e1',
                      padding: '1px 2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.4',
                    }}
                  >
                    {String(row.cells[col.name] ?? 'NULL')}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Html>
    </group>
  );
}
