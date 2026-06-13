import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface RouteLineProps {
  points: [number, number, number][]
  color: string
  highlighted?: boolean
}

export default function RouteLine({ points, color, highlighted = false }: RouteLineProps) {
  const tubeGeometry = useMemo(() => {
    if (points.length < 2) return null
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    )
    return new THREE.TubeGeometry(curve, 64, 0.08, 8, false)
  }, [points])

  const opacity = highlighted ? 0.95 : 0.7
  const emissiveIntensity = highlighted ? 0.5 : 0.2

  return (
    <group>
      {tubeGeometry && (
        <mesh geometry={tubeGeometry}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <Line
        points={points}
        color={color}
        dashed
        dashSize={0.5}
        gapSize={0.3}
        lineWidth={1}
        transparent
        opacity={opacity}
      />
    </group>
  )
}
