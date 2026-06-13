import { useMemo } from 'react'
import * as THREE from 'three'

export default function CityGround() {
  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(60, 12, '#1a1f3a', '#1a1f3a')
    grid.material.transparent = true
    grid.material.opacity = 0.4
    return grid
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#0a0e1a"
          emissive="#0a0e1a"
          emissiveIntensity={0.05}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <primitive object={gridHelper} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#0d1326"
          emissive="#1a1f3a"
          emissiveIntensity={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
