import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ShieldCheck, Activity, Landmark, ArrowRightLeft } from 'lucide-react'

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
  size = 260,
  stats = {
    approvedRate: 88.4,
    activeLeads: 1250,
    processingSpeed: '0.4s',
  },
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationVelocity = useRef({ x: 0.002, y: 0.004 })

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

    // Daylight Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const light1 = new THREE.DirectionalLight(0xfef9f3, 1.2) // Warm daylight
    light1.position.set(40, 60, 50)
    scene.add(light1)

    const light2 = new THREE.DirectionalLight(0xe2e8f0, 0.6) // Cool mist fill
    light2.position.set(-40, -30, -30)
    scene.add(light2)

    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // 1. Central Core Banking Token (Platinum & Champagne Gold)
    const tokenGeo = new THREE.CylinderGeometry(10, 10, 2.5, 32)
    const tokenMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Platinum mist
      metalness: 0.6,
      roughness: 0.25,
    })
    const tokenMesh = new THREE.Mesh(tokenGeo, tokenMat)
    tokenMesh.rotation.x = Math.PI / 2
    masterGroup.add(tokenMesh)

    // Inner Gold Rim
    const rimGeo = new THREE.TorusGeometry(8.5, 0.5, 16, 48)
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880, // Champagne bronze
      metalness: 0.7,
      roughness: 0.3,
    })
    const rimMesh = new THREE.Mesh(rimGeo, rimMat)
    masterGroup.add(rimMesh)

    // 2. Concentric Loan Milestone Orbital Dials
    const createDial = (radius: number, tube: number, colorHex: number, rotX: number, rotY: number) => {
      const dialGeo = new THREE.TorusGeometry(radius, tube, 16, 64)
      const dialMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.4,
      })
      const dialMesh = new THREE.Mesh(dialGeo, dialMat)
      dialMesh.rotation.x = rotX
      dialMesh.rotation.y = rotY
      return dialMesh
    }

    // Dial 1: Mist Slate (Origination)
    const dial1 = createDial(20, 0.45, 0x64748b, Math.PI / 4, 0)
    // Dial 2: Champagne Bronze (Underwriting)
    const dial2 = createDial(26, 0.4, 0xb49b78, -Math.PI / 3, Math.PI / 6)
    // Dial 3: Deep Slate Navy (Disbursement)
    const dial3 = createDial(32, 0.35, 0x1e293b, Math.PI / 6, Math.PI / 3)

    masterGroup.add(dial1, dial2, dial3)

    // 3. Floating Banking Satellite Nodes (Disbursement Milestones)
    const satGroup = new THREE.Group()
    masterGroup.add(satGroup)

    const satGeo = new THREE.SphereGeometry(1.4, 16, 16)
    const satMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.3 })
    const satMat2 = new THREE.MeshStandardMaterial({ color: 0xb49b78, metalness: 0.7, roughness: 0.2 })
    const satMat3 = new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.4, roughness: 0.3 }) // Muted sage green

    const sat1 = new THREE.Mesh(satGeo, satMat1)
    const sat2 = new THREE.Mesh(satGeo, satMat2)
    const sat3 = new THREE.Mesh(satGeo, satMat3)

    satGroup.add(sat1, sat2, sat3)

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

      masterGroup.rotation.y += deltaX * 0.012
      masterGroup.rotation.x += deltaY * 0.012

      rotationVelocity.current = {
        x: deltaY * 0.0015,
        y: deltaX * 0.0015,
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

    // Touch support
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

      masterGroup.rotation.y += deltaX * 0.012
      masterGroup.rotation.x += deltaY * 0.012

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
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      if (!isDragging.current) {
        masterGroup.rotation.y += rotationVelocity.current.y
        masterGroup.rotation.x += rotationVelocity.current.x
        rotationVelocity.current.y *= 0.985
        rotationVelocity.current.x *= 0.985
        if (Math.abs(rotationVelocity.current.y) < 0.003) rotationVelocity.current.y = 0.003
        if (Math.abs(rotationVelocity.current.x) < 0.0015) rotationVelocity.current.x = 0.0015
      }

      dial1.rotation.z = elapsed * 0.5
      dial2.rotation.z = -elapsed * 0.4
      dial3.rotation.z = elapsed * 0.3

      tokenMesh.rotation.z = elapsed * 0.2
      rimMesh.rotation.z = -elapsed * 0.2

      sat1.position.set(Math.cos(elapsed * 0.9) * 20, Math.sin(elapsed * 0.9) * 20, 0)
      sat2.position.set(0, Math.cos(elapsed * 0.7) * 26, Math.sin(elapsed * 0.7) * 26)
      sat3.position.set(Math.cos(elapsed * 0.5) * 32, 0, Math.sin(elapsed * 0.5) * 32)

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

      tokenGeo.dispose()
      tokenMat.dispose()
      rimGeo.dispose()
      rimMat.dispose()
      satGeo.dispose()
      satMat1.dispose()
      satMat2.dispose()
      satMat3.dispose()
      renderer.dispose()
    }
  }, [size])

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none group cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className="relative z-10 filter drop-shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
      />

      {/* Clean Minimalist Light Banking Telemetry Badges */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] text-slate-700 font-semibold shadow-xs">
        <Landmark className="h-3 w-3 text-slate-600" />
        <span>BANKING CORE</span>
      </div>

      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 text-[10px] text-emerald-800 font-semibold shadow-xs">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        <span>{stats.approvedRate}% APPROVAL</span>
      </div>

      <div className="absolute bottom-2 left-2 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] text-slate-600 font-semibold shadow-xs">
        <ArrowRightLeft className="h-3 w-3 text-slate-500" />
        <span>{stats.processingSpeed} ROUTE</span>
      </div>

      <p className="text-[10px] text-slate-500 mt-1 font-medium tracking-wide uppercase opacity-75 group-hover:opacity-100 transition-opacity">
        Interactive 3D Capital & Loan Milestone Sculpture
      </p>
    </div>
  )
}

export default FintechOrbital3D
