import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react'

interface FintechOrbital3DProps {
  className?: string
  size?: number
  stats?: {
    approvedRate?: number
    activeLeads?: number
    processingSpeed?: string
  }
}

export const FintechOrbital3D: React.FC<FintechOrbital3DProps> = ({
  className = '',
  size = 280,
  stats = {
    approvedRate: 88.4,
    activeLeads: 1250,
    processingSpeed: '0.4s',
  },
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationVelocity = useRef({ x: 0.003, y: 0.005 })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (e) {
      console.warn('WebGL init failed', e)
      return
    }

    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.z = 85

    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // 1. Central Core Sphere (Neon Wireframe + Solid Glow Core)
    const coreGeo = new THREE.IcosahedronGeometry(14, 2)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan glow
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    })
    const coreSphere = new THREE.Mesh(coreGeo, coreMat)
    masterGroup.add(coreSphere)

    // Inner glowing nucleus
    const innerGeo = new THREE.SphereGeometry(8, 16, 16)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Violet
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    masterGroup.add(innerSphere)

    // 2. Multi-Axis Concentric Orbital Rings
    const createRing = (radius: number, tube: number, colorHex: number, rotX: number, rotY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 6, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.7,
        wireframe: false,
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.rotation.x = rotX
      ringMesh.rotation.y = rotY
      return ringMesh
    }

    const ring1 = createRing(22, 0.45, 0x06b6d4, Math.PI / 4, 0)
    const ring2 = createRing(28, 0.4, 0x8b5cf6, -Math.PI / 3, Math.PI / 6)
    const ring3 = createRing(34, 0.35, 0x10b981, Math.PI / 6, Math.PI / 3)

    masterGroup.add(ring1, ring2, ring3)

    // 3. Orbiting Data Satellite Nodes (Loan Status Beads)
    const satelliteGroup = new THREE.Group()
    masterGroup.add(satelliteGroup)

    const satGeo = new THREE.SphereGeometry(1.6, 8, 8)
    const satMats = [
      new THREE.MeshBasicMaterial({ color: 0x22d3ee }), // Cyan
      new THREE.MeshBasicMaterial({ color: 0xc084fc }), // Violet
      new THREE.MeshBasicMaterial({ color: 0x34d399 }), // Emerald
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 }), // Amber
    ]

    const satellites: THREE.Mesh[] = []
    const satCount = 4
    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMats[i])
      satellites.push(sat)
      satelliteGroup.add(sat)
    }

    // 4. Ambient Sparkle Dust
    const dustCount = 80
    const dustGeo = new THREE.BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3
      const radius = 30 + Math.random() * 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      dustPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      dustPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      dustPositions[i3 + 2] = radius * Math.cos(phi)
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dustMat = new THREE.PointsMaterial({
      size: 2,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    const dustPoints = new THREE.Points(dustGeo, dustMat)
    masterGroup.add(dustPoints)

    // -------------------------------------------------------------
    // Interactive Drag to Rotate
    // -------------------------------------------------------------
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      masterGroup.rotation.y += deltaX * 0.015
      masterGroup.rotation.x += deltaY * 0.015

      rotationVelocity.current = {
        x: deltaY * 0.002,
        y: deltaX * 0.002,
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y

      masterGroup.rotation.y += deltaX * 0.015
      masterGroup.rotation.x += deltaY * 0.015

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onTouchEnd = () => {
      isDragging.current = false
    }

    domElement.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    // -------------------------------------------------------------
    // Animation Render Loop
    // -------------------------------------------------------------
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Inertia decay
      if (!isDragging.current) {
        masterGroup.rotation.y += rotationVelocity.current.y
        masterGroup.rotation.x += rotationVelocity.current.x
        rotationVelocity.current.y *= 0.985
        rotationVelocity.current.x *= 0.985
        if (Math.abs(rotationVelocity.current.y) < 0.004) rotationVelocity.current.y = 0.004
        if (Math.abs(rotationVelocity.current.x) < 0.002) rotationVelocity.current.x = 0.002
      }

      // Orbital animations
      ring1.rotation.z = elapsed * 0.8
      ring2.rotation.z = -elapsed * 0.6
      ring3.rotation.z = elapsed * 0.4

      coreSphere.rotation.y = elapsed * 0.2
      coreSphere.rotation.x = Math.sin(elapsed * 0.3) * 0.2
      innerSphere.rotation.y = -elapsed * 0.4

      // Orbiting satellites
      satellites[0].position.set(Math.cos(elapsed * 1.2) * 22, Math.sin(elapsed * 1.2) * 22, 0)
      satellites[1].position.set(0, Math.cos(elapsed * 0.9) * 28, Math.sin(elapsed * 0.9) * 28)
      satellites[2].position.set(Math.cos(elapsed * 0.7) * 34, 0, Math.sin(elapsed * 0.7) * 34)
      satellites[3].position.set(
        Math.cos(elapsed * 1.5) * 18,
        Math.sin(elapsed * 1.5) * 18,
        Math.sin(elapsed * 1.5) * 12
      )

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      domElement.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      coreGeo.dispose()
      coreMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      satGeo.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      renderer.dispose()
    }
  }, [size])

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none group cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className="relative z-10 filter drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]"
      />

      {/* Floating Holographic Telemetry HUD Badges */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-[10px] text-cyan-300 font-mono shadow-lg">
        <Sparkles className="h-3 w-3 text-cyan-400 animate-spin-slow" />
        <span>3D QUANTUM CORE</span>
      </div>

      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-[10px] text-emerald-300 font-mono shadow-lg">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        <span>{stats.approvedRate}% APPROVAL</span>
      </div>

      <div className="absolute bottom-2 left-2 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-purple-500/40 text-[10px] text-purple-300 font-mono shadow-lg">
        <Activity className="h-3 w-3 text-purple-400 animate-pulse" />
        <span>{stats.processingSpeed} ROUTE</span>
      </div>

      <p className="text-[10px] text-slate-400 mt-1 font-mono tracking-wider uppercase opacity-70 group-hover:opacity-100 transition-opacity">
        Drag to rotate 3D orbital loan engine
      </p>
    </div>
  )
}

export default FintechOrbital3D
