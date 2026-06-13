import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { BusVehicle } from '../../types'

interface BusVehicle3DProps {
  bus: BusVehicle
  routeColor: string
  selected?: boolean
  onClick?: () => void
}

export default function BusVehicle3D({ bus, routeColor, selected = false, onClick }: BusVehicle3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const warningRef = useRef<THREE.Mesh>(null)

  const bodyColor = bus.passengerRate > 0.85 ? '#ff2d55' : routeColor

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = bus.position[1] + Math.sin(t * 3) * 0.03
    }
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.1
      ringRef.current.scale.set(scale, scale, scale)
      const mat = ringRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.3 + Math.sin(t * 2) * 0.2
    }
    if (warningRef.current) {
      const mat = warningRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(t * 4) * 0.5
    }
  })

  return (
    <group position={[bus.position[0], 0, bus.position[2]]} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      <group ref={groupRef}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[3.5, 1.4, 1.2]} />
          <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.2} metalness={0.3} roughness={0.5} />
        </mesh>

        <mesh position={[1, 1.55, 0]} castShadow>
          <boxGeometry args={[1.4, 0.8, 1.1]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#4dabf7" emissiveIntensity={0.2} metalness={0.6} roughness={0.2} />
        </mesh>

        <mesh position={[-1.4, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-1.4, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.4, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.4, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>

        <pointLight position={[1.76, 0.7, 0.3]} color="#fff5cc" intensity={0.5} distance={3} />
        <pointLight position={[1.76, 0.7, -0.3]} color="#fff5cc" intensity={0.5} distance={3} />

        {bus.batteryLevel < 0.2 && (
          <mesh ref={warningRef} position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
          </mesh>
        )}
      </group>

      {selected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshStandardMaterial
            color={routeColor}
            emissive={routeColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <Html
        position={[0, 2.5, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className="px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap font-medium border border-white/30">
          <div className="text-center font-bold" style={{ color: routeColor }}>{bus.routeName}</div>
          <div className="text-center text-[10px] mt-0.5">
            乘客: <span style={{ color: bus.passengerRate > 0.85 ? '#ff2d55' : '#00ff88' }}>{Math.round(bus.passengerRate * 100)}%</span>
            {' | '}
            电量: <span style={{ color: bus.batteryLevel < 0.2 ? '#ffcc00' : '#4dabf7' }}>{Math.round(bus.batteryLevel * 100)}%</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
