import * as THREE from 'three';

/** A simple grid floor using a GridHelper instead of drei's Grid (more compatible). */
export default function GridFloor() {
  return (
    <group position={[0, -1.5, 0]}>
      <gridHelper
        args={[30, 60, '#475569', '#334155']}
        rotation={[0, 0, 0]}
      />
      {/* Transparent ground plane to catch light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#0f172a"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
