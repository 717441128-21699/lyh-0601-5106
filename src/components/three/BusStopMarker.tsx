import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { BusStop } from '../../types'

interface BusStopMarkerProps {
  stop: BusStop
  selected?: boolean
  onClick?: () => void
}

export default function BusStopMarker({ stop, selected = false, onClick }: BusStopMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const floatRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.15
      ringRef.current.scale.set(scale, scale, scale)
      const mat = ringRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4 + Math.sin(t * 2) * 0.3
    }
    if (floatRef.current) {
      floatRef.current.position.y = (stop.type === 'terminal' ? 6 : stop.type === 'dispatch_center' ? 8 : stop.type === 'charging_station' ? 4 : 2) + Math.sin(t * 2) * 0.2
    }
  })

  const getStopColor = useMemo(() => {
    const ratio = stop.passengerCount / stop.safetyThreshold
    if (ratio < 0.6) return '#00ff88'
    if (ratio < 0.9) return '#ffcc00'
    return '#ff4444'
  }, [stop.passengerCount, stop.safetyThreshold])

  const renderStopContent = () => {
    switch (stop.type) {
      case 'terminal':
        return (
          <group>
            <mesh position={[0, 2, 0]} castShadow>
              <boxGeometry args={[2.5, 4, 2.5]} />
              <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.3} />
            </mesh>
            <mesh ref={floatRef} position={[0, 6, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#4dabf7" emissive="#4dabf7" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )
      case 'dispatch_center':
        return (
          <group>
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[5, 6, 5]} />
              <meshStandardMaterial color="#2d1b4e" emissive="#2d1b4e" emissiveIntensity={0.4} />
            </mesh>
            <mesh ref={floatRef} position={[0, 8, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#cc5de8" emissive="#cc5de8" emissiveIntensity={1} />
            </mesh>
          </group>
        )
      case 'charging_station':
        return (
          <group>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#0d3320" emissive="#0d3320" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 0]}>
              <boxGeometry args={[1.8, 0.2, 1.8]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} />
            </mesh>
            <mesh ref={floatRef} position={[0, 4, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )
      case 'stop':
      default:
        return (
          <group>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
              <meshStandardMaterial color={getStopColor} emissive={getStopColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh ref={floatRef} position={[0, 2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={getStopColor} emissive={getStopColor} emissiveIntensity={0.6} />
            </mesh>
          </group>
        )
    }
  }

  const labelHeight = stop.type === 'dispatch_center' ? 10 : stop.type === 'terminal' ? 8 : stop.type === 'charging_station' ? 5 : 3

  return (
    <group position={stop.position} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      {renderStopContent()}
      {selected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <Html
        position={[0, labelHeight, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className="px-2 py-1 bg-black/70 text-white text-xs rounded whitespace-nowrap font-medium border border-white/20">
          {stop.name}
        </div>
      </Html>
    </group>
  )
}
