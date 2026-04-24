// cspell:disable
import { Suspense } from "react";
import { PerspectiveCamera, OrbitControls, Text } from "@react-three/drei";
import { ToothMesh } from "./ToothMesh";
import type { ToothData, ToothStatus } from "../../types/odontograma.types";
import {
  UPPER_RIGHT_TEETH,
  UPPER_LEFT_TEETH,
  LOWER_LEFT_TEETH,
  LOWER_RIGHT_TEETH,
} from "../../types/odontograma.types";

interface ToothArcadeProps {
  teethData: Record<number, ToothData>;
  selectedStatus: ToothStatus;
  onToothClick: (toothNumber: number) => void;
  onToothRightClick: (toothNumber: number) => void;
}

export function ToothArcade({
  teethData,
  selectedStatus,
  onToothClick,
  onToothRightClick,
}: ToothArcadeProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 12]} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={25}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />

      <Suspense fallback={null}>
        {UPPER_RIGHT_TEETH.map((num, idx) => {
          const tooth = teethData[num];
          if (!tooth) return null;
          return (
            <ToothMesh
              key={num}
              position={[-7 + idx * 1.2, 2, 2]}
              toothData={tooth}
              selectedStatus={selectedStatus}
              onToothClick={onToothClick}
              onToothRightClick={onToothRightClick}
            />
          );
        })}

        {UPPER_LEFT_TEETH.map((num, idx) => {
          const tooth = teethData[num];
          if (!tooth) return null;
          return (
            <ToothMesh
              key={num}
              position={[0.5 + idx * 1.2, 2, 2]}
              toothData={tooth}
              selectedStatus={selectedStatus}
              onToothClick={onToothClick}
              onToothRightClick={onToothRightClick}
            />
          );
        })}

        {LOWER_LEFT_TEETH.map((num, idx) => {
          const tooth = teethData[num];
          if (!tooth) return null;
          return (
            <ToothMesh
              key={num}
              position={[0.5 + idx * 1.2, -2, 2]}
              toothData={tooth}
              selectedStatus={selectedStatus}
              onToothClick={onToothClick}
              onToothRightClick={onToothRightClick}
            />
          );
        })}

        {LOWER_RIGHT_TEETH.map((num, idx) => {
          const tooth = teethData[num];
          if (!tooth) return null;
          return (
            <ToothMesh
              key={num}
              position={[-7 + idx * 1.2, -2, 2]}
              toothData={tooth}
              selectedStatus={selectedStatus}
              onToothClick={onToothClick}
              onToothRightClick={onToothRightClick}
            />
          );
        })}

        <mesh position={[0, 0, 1.5]} receiveShadow>
          <boxGeometry args={[18, 5, 1]} />
          <meshStandardMaterial color="#ffb3ba" roughness={0.8} />
        </mesh>

        <Text position={[-4, 3.5, 2]} fontSize={0.4} color="#64748b">
          Superior Direito
        </Text>
        <Text position={[4, 3.5, 2]} fontSize={0.4} color="#64748b">
          Superior Esquerdo
        </Text>
        <Text position={[4, -3.5, 2]} fontSize={0.4} color="#64748b">
          Inferior Esquerdo
        </Text>
        <Text position={[-4, -3.5, 2]} fontSize={0.4} color="#64748b">
          Inferior Direito
        </Text>
      </Suspense>

      <gridHelper
        args={[20, 20, "#cccccc", "#eeeeee"]}
        position={[0, -4, 0]}
      />
    </>
  );
}
