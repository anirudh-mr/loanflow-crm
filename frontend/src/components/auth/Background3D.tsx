import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { StaticGradientMesh } from './StaticGradientMesh'

// ---------------------------------------------------------------------------
// Global interaction events (e.g. login success rapid spin)
// ---------------------------------------------------------------------------
export interface Background3DProps {
  loginSuccess?: boolean
  onCanvasClick?: (e: React.MouseEvent) => void
}

// ---------------------------------------------------------------------------
// 1. Mouse Rig - Camera Parallax with Smooth Damping (Max ~3-4 degrees)
// ---------------------------------------------------------------------------
export const MouseRig: React.FC = () => {
  const { camera, pointer } = useThree()

  useFrame(() => {
    // Smooth camera tilt and translation based on pointer coordinates (-1 to 1)
    const targetX = pointer.x * 0.9
    const targetY = pointer.y * 0.6

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ---------------------------------------------------------------------------
// 2. Hero Object: Capital & Loan Milestone Orbital Sculpture
// ---------------------------------------------------------------------------
interface HeroSculptureProps {
  loginSuccess?: boolean
}

export const HeroOrbitalSculpture: React.FC<HeroSculptureProps> = ({ loginSuccess = false }) => {
  const masterGroup = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const sat1Ref = useRef<THREE.Mesh>(null)
  const sat2Ref = useRef<THREE.Mesh>(null)
  const sat3Ref = useRef<THREE.Mesh>(null)

  const { pointer } = useThree()

  // Track rotational speed multiplier (accelerates when mouse moves or on login success)
  const spinSpeed = useRef(1)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Rapid spin trigger on login success
    if (loginSuccess) {
      spinSpeed.current = THREE.MathUtils.lerp(spinSpeed.current, 12, 0.08)
    } else {
      // Normal interactive speed: speeds up slightly with pointer distance
      const pointerDistance = Math.hypot(pointer.x, pointer.y)
      const targetSpeed = 1.0 + pointerDistance * 0.8
      spinSpeed.current = THREE.MathUtils.lerp(spinSpeed.current, targetSpeed, 0.05)
    }

    const currentSpeed = spinSpeed.current

    if (masterGroup.current) {
      // Tilts toward cursor smoothly
      masterGroup.current.rotation.y = THREE.MathUtils.lerp(
        masterGroup.current.rotation.y,
        pointer.x * 0.45,
        0.04
      )
      masterGroup.current.rotation.x = THREE.MathUtils.lerp(
        masterGroup.current.rotation.x,
        -pointer.y * 0.35,
        0.04
      )
    }

    // Core slowly tracks mouse with subtle wobble
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.008 * currentSpeed
      coreRef.current.rotation.x = Math.sin(t * 0.8) * 0.1
    }

    // Ring 1 (Navy #0F172A)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.012 * currentSpeed
      ring1Ref.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.08
    }

    // Ring 2 (Champagne Gold #B8860B)
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.016 * currentSpeed
      ring2Ref.current.rotation.y = Math.PI / 6 + Math.cos(t * 0.4) * 0.08
    }

    // Ring 3 (Slate Navy #475569)
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += 0.009 * currentSpeed
      ring3Ref.current.rotation.x = -Math.PI / 3 + Math.sin(t * 0.6) * 0.06
    }

    // Satellite 1 (Emerald Green Milestone - #059669) orbiting along Ring 1
    if (sat1Ref.current) {
      const angle = t * 1.2 * currentSpeed
      const r = 2.4
      sat1Ref.current.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.65, Math.sin(angle) * 0.7)
    }

    // Satellite 2 (Warm Gold Node - #B8860B) orbiting along Ring 2
    if (sat2Ref.current) {
      const angle = -t * 0.9 * currentSpeed + 1.8
      const r = 3.2
      sat2Ref.current.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.8, -Math.cos(angle) * 0.9)
    }

    // Satellite 3 (Deep Navy Node - #0F172A) orbiting along Ring 3
    if (sat3Ref.current) {
      const angle = t * 0.7 * currentSpeed + 3.4
      const r = 3.8
      sat3Ref.current.position.set(Math.cos(angle) * r * 0.85, Math.sin(angle) * r, Math.sin(angle) * 0.8)
    }
  })

  return (
    // Positioned behind and slightly right of the card
    <group ref={masterGroup} position={[2.6, 0.3, -2.2]} scale={[0.88, 0.88, 0.88]}>
      {/* 1. Frosted Glass / Platinum Core Banking Token */}
      <group ref={coreRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.36, 48]} />
          <meshPhysicalMaterial
            color="#F1F5F9"
            metalness={0.2}
            roughness={0.15}
            transmission={0.8}
            thickness={1.6}
            transparent
            opacity={0.88}
            reflectivity={0.9}
          />
        </mesh>

        {/* Inner Warm Gold Inlay Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.05, 20, 64]} />
          <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* 2. Concentric Milestone Rings */}
      {/* Ring 1: Primary Dark Navy (#0F172A) */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.4, 0.045, 24, 96]} />
        <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Ring 2: Warm Institutional Gold (#B8860B) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[3.2, 0.04, 24, 96]} />
        <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Ring 3: Deep Slate (#475569) */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, Math.PI / 3, 0]}>
        <torusGeometry args={[3.8, 0.035, 24, 96]} />
        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* 3. Milestone Satellite Nodes */}
      {/* Node 1: Green Underwriting Approval Node */}
      <mesh ref={sat1Ref}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#059669" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Node 2: Gold Partner Routing Node */}
      <mesh ref={sat2Ref}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Node 3: Navy Capital Disbursement Node */}
      <mesh ref={sat3Ref}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// 3. Floating Frosted-Glass Items (Coins, Mini Cards, Cubes with Cursor Repulsion)
// ---------------------------------------------------------------------------
interface FloatingItemData {
  id: number
  type: 'coin' | 'card' | 'cube'
  home: [number, number, number]
  scale: number
  color: string
  rotationSpeed: [number, number, number]
}

export const FloatingGlassItems: React.FC = () => {
  const items = useMemo<FloatingItemData[]>(() => {
    return [
      // Left side floating items (around login card left & top)
      { id: 1, type: 'coin', home: [-4.8, 2.2, -2.5], scale: 0.65, color: '#FFFFFF', rotationSpeed: [0.01, 0.012, 0.005] },
      { id: 2, type: 'card', home: [-3.8, -2.4, -2.0], scale: 0.75, color: '#DBEAFE', rotationSpeed: [0.006, -0.008, 0.004] },
      { id: 3, type: 'cube', home: [-5.4, -0.6, -3.2], scale: 0.55, color: '#F1F5F9', rotationSpeed: [0.008, 0.006, -0.007] },
      { id: 4, type: 'coin', home: [-2.9, 3.8, -3.0], scale: 0.5, color: '#FEF3C7', rotationSpeed: [-0.01, 0.007, 0.006] },

      // Right side floating items (orbiting around sculpture & background)
      { id: 5, type: 'card', home: [5.2, 2.8, -3.5], scale: 0.8, color: '#FFFFFF', rotationSpeed: [0.005, 0.008, -0.006] },
      { id: 6, type: 'coin', home: [4.6, -2.6, -2.8], scale: 0.7, color: '#DBEAFE', rotationSpeed: [-0.008, -0.01, 0.005] },
      { id: 7, type: 'cube', home: [3.8, 3.6, -4.0], scale: 0.6, color: '#E2E8F0', rotationSpeed: [0.007, -0.006, 0.008] },
      { id: 8, type: 'coin', home: [5.6, 0.4, -3.2], scale: 0.55, color: '#FFFFFF', rotationSpeed: [0.01, -0.008, 0.004] },
      { id: 9, type: 'card', home: [1.2, -4.0, -3.8], scale: 0.7, color: '#E0E7FF', rotationSpeed: [0.004, 0.007, -0.005] },
    ]
  }, [])

  const groupRefs = useRef<(THREE.Group | null)[]>([])
  const { pointer } = useThree()

  // Track dynamic positions with spring physics for cursor repulsion
  const dynamicPositions = useRef(items.map((it) => ({ x: it.home[0], y: it.home[1], z: it.home[2], vx: 0, vy: 0 })))

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Convert 2D screen pointer (-1 to 1) into approximate 3D world space coordinates
    const pointerWorldX = pointer.x * 6.5
    const pointerWorldY = pointer.y * 4.5

    items.forEach((item, index) => {
      const g = groupRefs.current[index]
      if (!g) return

      const dyn = dynamicPositions.current[index]

      // Subtle natural vertical bobbing
      const bobY = Math.sin(t * 1.2 + index * 1.5) * 0.12
      const bobX = Math.cos(t * 0.9 + index * 1.1) * 0.08

      // Distance from cursor to item's current position
      const dx = dyn.x - pointerWorldX
      const dy = dyn.y - pointerWorldY
      const dist = Math.hypot(dx, dy)

      // Repulsion radius = 2.4 units
      if (dist < 2.4 && dist > 0.01) {
        const force = (2.4 - dist) * 0.06
        dyn.vx += (dx / dist) * force
        dyn.vy += (dy / dist) * force
      }

      // Spring force returning toward home position + bobbing
      const targetX = item.home[0] + bobX
      const targetY = item.home[1] + bobY
      const springK = 0.05
      const damping = 0.88

      dyn.vx += (targetX - dyn.x) * springK
      dyn.vy += (targetY - dyn.y) * springK

      dyn.vx *= damping
      dyn.vy *= damping

      dyn.x += dyn.vx
      dyn.y += dyn.vy

      g.position.set(dyn.x, dyn.y, dyn.z)

      // Continuous gentle rotation
      g.rotation.x += item.rotationSpeed[0]
      g.rotation.y += item.rotationSpeed[1]
      g.rotation.z += item.rotationSpeed[2]
    })
  })

  return (
    <group>
      {items.map((item, index) => (
        <group
          key={item.id}
          ref={(el) => { groupRefs.current[index] = el }}
          position={item.home}
        >
          {item.type === 'coin' && (
            <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
              <cylinderGeometry args={[item.scale, item.scale, 0.12, 32]} />
              <meshPhysicalMaterial
                color={item.color}
                roughness={0.15}
                transmission={0.82}
                thickness={1.1}
                transparent
                opacity={0.85}
                reflectivity={0.9}
                clearcoat={1}
              />
            </mesh>
          )}

          {item.type === 'card' && (
            <mesh rotation={[0.2, 0.4, -0.15]}>
              <boxGeometry args={[item.scale * 2.2, item.scale * 1.35, 0.05]} />
              <meshPhysicalMaterial
                color={item.color}
                roughness={0.12}
                transmission={0.85}
                thickness={0.8}
                transparent
                opacity={0.88}
                reflectivity={0.95}
                clearcoat={1}
              />
            </mesh>
          )}

          {item.type === 'cube' && (
            <mesh rotation={[0.4, 0.3, 0.5]}>
              <boxGeometry args={[item.scale * 1.1, item.scale * 1.1, item.scale * 1.1]} />
              <meshPhysicalMaterial
                color={item.color}
                roughness={0.18}
                transmission={0.78}
                thickness={1.4}
                transparent
                opacity={0.82}
                reflectivity={0.85}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// 4. Click Ripple & Particle Burst Effect
// ---------------------------------------------------------------------------
interface Particle {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
}

export const ClickRippleParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; scale: number; opacity: number }[]>([])
  const { pointer } = useThree()

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      // Don't trigger if clicking on inputs or buttons
      const target = e.target as HTMLElement
      if (target.closest('input') || target.closest('button') || target.closest('a')) {
        return
      }

      // Approximate world click position
      const clickX = pointer.x * 6.5
      const clickY = pointer.y * 4.5

      // Add ripple ring
      setRipples((prev) => [
        ...prev.slice(-4),
        { id: Date.now() + Math.random(), x: clickX, y: clickY, scale: 0.1, opacity: 0.7 },
      ])

      // Emit 12 small coin particles
      const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4
        const speed = 0.08 + Math.random() * 0.08
        return {
          id: Date.now() + i,
          x: clickX,
          y: clickY,
          z: -1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (Math.random() - 0.5) * 0.04,
          life: 0,
          maxLife: 45 + Math.random() * 20,
        }
      })

      setParticles((prev) => [...prev.slice(-24), ...newParticles])
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [pointer])

  useFrame(() => {
    // Animate ripple rings
    setRipples((prev) =>
      prev
        .map((r) => ({
          ...r,
          scale: r.scale + 0.12,
          opacity: r.opacity - 0.035,
        }))
        .filter((r) => r.opacity > 0)
    )

    // Animate coin particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          z: p.z + p.vz,
          vy: p.vy - 0.002, // subtle gravity
          life: p.life + 1,
        }))
        .filter((p) => p.life < p.maxLife)
    )
  })

  return (
    <group>
      {/* Ripple expanding rings */}
      {ripples.map((r) => (
        <mesh key={r.id} position={[r.x, r.y, -1]}>
          <ringGeometry args={[r.scale, r.scale + 0.08, 32]} />
          <meshBasicMaterial color="#2563EB" transparent opacity={r.opacity * 0.45} />
        </mesh>
      ))}

      {/* Burst coin particles */}
      {particles.map((p) => {
        const alpha = Math.max(0, 1 - p.life / p.maxLife)
        return (
          <mesh key={p.id} position={[p.x, p.y, p.z]} rotation={[p.life * 0.1, p.life * 0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color="#B8860B" transparent opacity={alpha * 0.75} />
          </mesh>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------------------
// 5. Perspective Grid Floor (Fading into Light Fog Horizon)
// ---------------------------------------------------------------------------
export const PerspectiveFloor: React.FC = () => {
  return (
    <group position={[0, -4.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper
        args={[80, 50, 0x0F172A, 0xCBD5E1]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------
// 6. Main Background3D Component
// ---------------------------------------------------------------------------
export const Background3D: React.FC<Background3DProps> = ({ loginSuccess = false }) => {
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

  // If user prefers reduced motion, render clean static gradient mesh
  if (prefersReducedMotion) {
    return <StaticGradientMesh />
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#F1F3F7] to-[#E8ECF4]">
      {/* Fallback Static Gradient Mesh underneath */}
      <StaticGradientMesh />

      {/* R3F WebGL Canvas (DPR capped at [1, 1.5], max 60fps) */}
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isTabVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, 10.5], fov: 45 }}
        >
          {/* Mouse Parallax Rig */}
          <MouseRig />

          {/* Daylight Fog Horizon (#F1F3F7) */}
          <fog attach="fog" args={['#F1F3F7', 8, 22]} />

          {/* Studio Daylight & Mist Fill Lighting */}
          <ambientLight intensity={0.9} color="#FFFFFF" />
          <directionalLight position={[12, 14, 10]} intensity={1.4} color="#FEF9F3" />
          <directionalLight position={[-12, -6, -6]} intensity={0.7} color="#DBEAFE" />
          <pointLight position={[4, 2, 6]} intensity={0.8} color="#EFF6FF" distance={20} />

          {/* Contact Shadows for realism */}
          <ContactShadows
            position={[0, -4.7, 0]}
            opacity={0.35}
            scale={20}
            blur={2.5}
            far={10}
            color="#0F172A"
          />

          {/* Hero Sculpture (Capital & Loan Milestone Sculpture) */}
          <HeroOrbitalSculpture loginSuccess={loginSuccess} />

          {/* Floating Frosted Glass Coins, Mini Cards & Cubes with Repulsion */}
          <FloatingGlassItems />

          {/* Click Ripple & Particle Burst */}
          <ClickRippleParticles />

          {/* Faint Perspective Grid Floor */}
          <PerspectiveFloor />
        </Canvas>
      </div>

      {/* Subtle Noise Texture Overlay (2-3% opacity for film grain depth) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default Background3D
