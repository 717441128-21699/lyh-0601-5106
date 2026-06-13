import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ChargingPile } from '../../types'

interface ChargingPile3DProps {
  pile: ChargingPile
  selected?: boolean
  onClick?: () => void
}

export default function ChargingPile3D({ pile, selected = false, onClick }: ChargingPile3DProps) {
  const glowRef = useRef<THREE.Mesh>(null)
  const warningRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const getTowerColor = () => {
    switch (pile.status) {
      case 'idle':
        return '#00ff88'
      case 'charging':
        return '#4dabf7'
      case 'fault':
        return '#6c757d'
      default:
        return '#6c757d'
    }
  }

  const towerColor = getTowerColor()
  const showGlow = pile.status === 'idle' || pile.status === 'charging'

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3
    }
    if (warningRef.current) {
      warningRef.current.position.y = 3.5 + Math.sin(t * 4) * 0.1
      const mat = warningRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(t * 5) * 0.4
    }
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.1
      ringRef.current.scale.set(scale, scale, scale)
      const mat = ringRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.3 + Math.sin(t * 2) * 0.2
    }
  })

  return (
    <group position={pile.position} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.7} />
      </mesh>

      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.8, 2.5, 0.5]} />
        <meshStandardMaterial color={towerColor} emissive={towerColor} emissiveIntensity={0.2} metalness={0.3} roughness={0.5} />
      </mesh>

      {showGlow && (
        <mesh ref={glowRef} position={[0, 2.9, 0]}>
          <boxGeometry args={[0.7, 0.15, 0.4]} />
          <meshStandardMaterial color={towerColor} emissive={towerColor} emissiveIntensity={0.5} />
        </mesh>
      )}

      {pile.status === 'fault' && (
        <mesh ref={warningRef} position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.6} />
        </mesh>
      )}

      {selected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
          <ringGeometry args={[1, 1.3, 32]} />
          <meshStandardMaterial
            color={towerColor}
            emissive={towerColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <Html
        position={[0, 4.5, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className="px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap font-medium border border-white/30">
          <div className="text-center" style={{ color: towerColor }}>{pile.name}</div>
          <div className="text-center text-[10px] mt-0.5">
            {pile.status === 'idle' && <span style={{ color: '#00ff88' }}>空闲</span>}
            {pile.status === 'charging' && <span style={{ color: '#4dabf7' }}>充电中</span>}
            {pile.status === 'fault' && <span style={{ color: '#ff4444' }}>故障</span>}
          </div>
        </div>
      </Html>
    </group>
  )
}
