import { useMemo } from 'react'
import * as THREE from 'three'
import type { BusStop } from '../../types'

interface HeatmapOverlayProps {
  stops: BusStop[]
}

export default function HeatmapOverlay({ stops }: HeatmapOverlayProps) {
  const heatCircles = useMemo(() => {
    return stops.map((stop) => {
      const ratio = stop.passengerCount / stop.safetyThreshold
      let color = '#00ff88'
      let opacity = 0.3
      if (ratio >= 0.6 && ratio < 0.9) {
        color = '#ffcc00'
        opacity = 0.45
      } else if (ratio >= 0.9) {
        color = '#ff4444'
        opacity = 0.6
      }
      const scale = Math.min(Math.max(ratio, 0.5), 2.5)
      return {
        id: stop.id,
        position: stop.position,
        color,
        opacity,
        scale,
      }
    })
  }, [stops])

  return (
    <group>
      {heatCircles.map((circle) => (
        <group key={circle.id} position={[circle.position[0], circle.position[1], circle.position[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[circle.scale * 3, 32]} />
            <meshBasicMaterial
              color={circle.color}
              transparent
              opacity={circle.opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[circle.scale * 2.5, circle.scale * 3, 32]} />
            <meshBasicMaterial
              color={circle.color}
              transparent
              opacity={circle.opacity * 0.5}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
