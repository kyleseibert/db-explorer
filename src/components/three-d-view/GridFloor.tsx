import { Grid } from '@react-three/drei';

export default function GridFloor() {
  return (
    <Grid
      position={[0, -1.5, 0]}
      args={[30, 30]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#334155"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#475569"
      fadeDistance={20}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
