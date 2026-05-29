// cspell:disable
import { useRef, useState } from "react";

import { Text } from "@react-three/drei";
import type { ToothData, ToothStatus } from "../../types/odontograma.types";
import { TOOTH_STATUS_COLORS } from "../../types/odontograma.types";

interface ToothMeshProps {
  position: [number, number, number];
  toothData: ToothData;
  selectedStatus: ToothStatus;
  onToothClick: (toothNumber: number) => void;
  onToothRightClick: (toothNumber: number) => void;
}

export function ToothMesh({
  position,
  toothData,
  selectedStatus,
  onToothClick,
  onToothRightClick,
}: ToothMeshProps) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  if (!toothData) return null;

  const color =
    TOOTH_STATUS_COLORS[toothData.status] || TOOTH_STATUS_COLORS["higido"];
  const isExtraido = toothData.status === "extraido";

  const handleClick = (e: { stopPropagation: () => void; button: number }) => {
    e.stopPropagation();
    if (e.button === 2) {
      onToothRightClick(toothData.number);
    } else {
      onToothClick(toothData.number);
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? "#4444ff" : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.3}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      <mesh position={[0, -0.8, 0]} castShadow>
        <coneGeometry args={[0.25, 0.6, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color={isExtraido ? "#ffffff" : "#1e293b"}
        anchorX="center"
        anchorY="middle"
      >
        {String(toothData.number)}
      </Text>

      {hovered && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
      )}
    </group>
  );
}
