import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StaticGradientMesh } from './StaticGradientMesh'

// ---------------------------------------------------------------------------
// 3D Scene Components (Soft Glass Spheres, Floating Coins & Card Shapes)
// ---------------------------------------------------------------------------
const FloatingShapes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null)

  // Floating items data
  const items = useMemo(() => {
    return [
      // Glass spheres
      { type: 'sphere', position: [-4.2, 2.5, -3], scale: 1.1, color: '#6366F1', speed: 0.6 },
      { type: 'sphere', position: [4.8, -2.2, -4], scale: 1.4, color: '#22D3EE', speed: 0.5 },
      { type: 'sphere', position: [-3.8, -2.8, -2], scale: 0.8, color: '#22D3EE', speed: 0.7 },
      { type: 'sphere', position: [3.5, 3.2, -5], scale: 1.2, color: '#818CF8', speed: 0.4 },

      // Floating Coins (Cylinders)
      { type: 'coin', position: [-5.0, -0.5, -2.5], scale: 0.9, color: '#6366F1', speed: 0.8 },
      { type: 'coin', position: [5.2, 1.2, -3.5], scale: 1.0, color: '#22D3EE', speed: 0.65 },

      // Floating Minimal Credit Card Shape
      { type: 'card', position: [-3.2, 4.0, -6], scale: 1.1, color: '#4338CA', speed: 0.5 },
      { type: 'card', position: [4.2, -3.8, -5], scale: 1.0, color: '#0E7490', speed: 0.55 },
    ]
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!groupRef.current) return

    groupRef.current.children.forEach((child, i) => {
      const item = items[i]
      if (!item) return
      child.position.y += Math.sin(t * item.speed + i) * 0.003
      child.rotation.x += 0.002 * (i % 2 === 0 ? 1 : -1)
      child.rotation.y += 0.003 * (i % 2 === 0 ? -1 : 1)
    })
  })

  return (
    <group ref={groupRef}>
      {items.map((item, i) => {
        if (item.type === 'sphere') {
          return (
            <mesh key={i} position={item.position as [number, number, number]}>
              <sphereGeometry args={[item.scale, 32, 32]} />
              <meshPhysicalMaterial
                color={item.color}
                roughness={0.15}
                transmission={0.65}
                thickness={1.2}
                transparent
                opacity={0.7}
                reflectivity={0.9}
              />
            </mesh>
          )
        }

        if (item.type === 'coin') {
          return (
            <mesh
              key={i}
              position={item.position as [number, number, number]}
              rotation={[Math.PI / 4, Math.PI / 3, 0]}
            >
              <cylinderGeometry args={[item.scale, item.scale, 0.18, 32]} />
              <meshStandardMaterial
                color={item.color}
                metalness={0.7}
                roughness={0.25}
                transparent
                opacity={0.6}
              />
            </mesh>
          )
        }

        // Minimal Card
        return (
          <mesh
            key={i}
            position={item.position as [number, number, number]}
            rotation={[0.3, -0.4, 0.2]}
          >
            <boxGeometry args={[item.scale * 2.2, item.scale * 1.4, 0.06]} />
            <meshStandardMaterial
              color={item.color}
              metalness={0.5}
              roughness={0.3}
              transparent
              opacity={0.45}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Camera Controller with Gentle Mouse Parallax (Max 2-3 degrees)
// ---------------------------------------------------------------------------
const CameraController: React.FC = () => {
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Map to -1 .. 1 range
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    // Subtle parallax: clamp to max 0.5 units (~2 degrees)
    const targetX = mouse.current.x * 0.5
    const targetY = mouse.current.y * 0.35

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.035)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.035)
    state.camera.lookAt(0, 0, 0)
  })

  return null
}

// ---------------------------------------------------------------------------
// Perspective Grid Floor (Fading into Horizon)
// ---------------------------------------------------------------------------
const PerspectiveFloor: React.FC = () => {
  return (
    <group position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper
        args={[60, 40, 0x6366f1, 0x1e293b]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Main Background3D Component (with Visibility & Reduced-Motion Handlers)
// ---------------------------------------------------------------------------
export const Background3D: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handleMotionChange)

    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      mq.removeEventListener('change', handleMotionChange)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // If user prefers reduced motion or on mobile/small screen, render static gradient mesh
  if (prefersReducedMotion) {
    return <StaticGradientMesh />
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060B1A]">
      {/* Fallback Static Gradient Mesh underneath */}
      <StaticGradientMesh />

      {/* R3F WebGL Canvas (Capped at 1.5 DPR, max 60fps) */}
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isTabVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, 11], fov: 45 }}
        >
          <CameraController />

          {/* Deep Navy Atmosphere Fog */}
          <fog attach="fog" args={['#060B1A', 8, 24]} />

          {/* Calm Lighting in Indigo and Cyan */}
          <ambientLight intensity={0.4} color="#0B1226" />
          <directionalLight position={[10, 10, 5]} intensity={0.8} color="#6366F1" />
          <pointLight position={[-10, -5, -5]} intensity={1.2} color="#22D3EE" distance={25} />
          <pointLight position={[8, -8, 2]} intensity={0.6} color="#818CF8" distance={20} />

          {/* Floating Glass Spheres, Coins and Cards */}
          <FloatingShapes />

          {/* Faint Horizon Grid */}
          <PerspectiveFloor />
        </Canvas>
      </div>

      {/* Subtle Noise Texture Overlay (3% Opacity for film grain depth) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default Background3D
