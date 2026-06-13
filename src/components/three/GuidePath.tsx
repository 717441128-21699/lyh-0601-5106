import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface GuidePathProps {
  from: [number, number, number]
  to: [number, number, number]
}

export default function GuidePath({ from, to }: GuidePathProps) {
  const sphereRef = useRef<THREE.Mesh>(null)

  const curve = useMemo(() => {
    const start = new THREE.Vector3(from[0], from[1], from[2])
    const end = new THREE.Vector3(to[0], to[1], to[2])
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.y += 3
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [from, to])

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.06, 8, false)
  }, [curve])

  const linePoints = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 64; i++) {
      const t = i / 64
      const p = curve.getPoint(t)
      pts.push([p.x, p.y, p.z])
    }
    return pts
  }, [curve])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (sphereRef.current) {
      const progress = (t * 0.3) % 1
      const pos = curve.getPoint(progress)
      sphereRef.current.position.copy(pos)
      const mat = sphereRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.8 + Math.sin(t * 5) * 0.2
    }
  })

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Line
        points={linePoints}
        color="#00ff88"
        dashed
        dashSize={0.3}
        gapSize={0.2}
        lineWidth={2}
        transparent
        opacity={0.9}
      />
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  )
}
