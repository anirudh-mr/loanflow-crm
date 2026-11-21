import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AmbientUniverse3DProps {
  className?: string
  interactive?: boolean
  particleCount?: number
  speedMultiplier?: number
}

export const AmbientUniverse3D: React.FC<AmbientUniverse3DProps> = ({
  className = '',
  interactive = true,
  particleCount = 650,
  speedMultiplier = 1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Verify WebGL availability
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (e) {
      console.warn('WebGL not supported, falling back', e)
      return
    }

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x030712, 1)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x030712, 0.0018)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 180

    // -------------------------------------------------------------
    // 1. Dynamic Particle Constellation
    // -------------------------------------------------------------
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)

    // Palette: Neon Cyan, Electric Violet, Holographic Emerald, Gold
    const palette = [
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x8b5cf6), // Violet
      new THREE.Color(0x3b82f6), // Blue
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xf59e0b), // Amber/Gold
    ]

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const x = (Math.random() - 0.5) * 500
      const y = (Math.random() - 0.5) * 350
      const z = (Math.random() - 0.5) * 350

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      originalPositions[i3] = x
      originalPositions[i3 + 1] = y
      originalPositions[i3 + 2] = z

      const color = palette[Math.floor(Math.random() * palette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // High performance point sprite texture
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.2, 'rgba(56,189,248,0.8)')
      gradient.addColorStop(0.6, 'rgba(99,102,241,0.3)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 32, 32)
    }
    const particleTexture = new THREE.CanvasTexture(canvas)

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.5,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const pointCloud = new THREE.Points(geometry, particleMaterial)
    scene.add(pointCloud)

    // -------------------------------------------------------------
    // 2. Floating 3D Geometric Polyhedrons (Loan Nodes)
    // -------------------------------------------------------------
    const polyGroup = new THREE.Group()

    const createPolyNode = (geo: THREE.BufferGeometry, colorHex: number, x: number, y: number, z: number, scale: number) => {
      const wireMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      })
      const mesh = new THREE.Mesh(geo, wireMat)
      mesh.position.set(x, y, z)
      mesh.scale.setScalar(scale)
      return mesh
    }

    const node1 = createPolyNode(new THREE.IcosahedronGeometry(18, 1), 0x06b6d4, -130, 60, -50, 1)
    const node2 = createPolyNode(new THREE.OctahedronGeometry(15, 0), 0x8b5cf6, 140, -40, -30, 1.2)
    const node3 = createPolyNode(new THREE.TorusGeometry(16, 3, 8, 24), 0x10b981, 100, 70, -80, 0.9)
    const node4 = createPolyNode(new THREE.DodecahedronGeometry(12, 0), 0xf43f5e, -110, -70, -60, 1.1)

    polyGroup.add(node1, node2, node3, node4)
    scene.add(polyGroup)

    // -------------------------------------------------------------
    // 3. Cybernetic Undulating Energy Grid / Horizon
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(600, 40, 0x1e3a8a, 0x0f172a)
    gridHelper.position.y = -120
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.35
    scene.add(gridHelper)

    // Dynamic point lights for iridescent reflections
    const light1 = new THREE.PointLight(0x06b6d4, 2, 400)
    light1.position.set(-100, 100, 50)
    scene.add(light1)

    const light2 = new THREE.PointLight(0x8b5cf6, 2, 400)
    light2.position.set(100, -100, 50)
    scene.add(light2)

    // -------------------------------------------------------------
    // Mouse Interaction & Parallax
    // -------------------------------------------------------------
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return
      mouseX = (event.clientX - window.innerWidth / 2) * 0.15
      mouseY = (event.clientY - window.innerHeight / 2) * 0.15
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // -------------------------------------------------------------
    // Animation Render Loop
    // -------------------------------------------------------------
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime() * speedMultiplier

      // Smooth camera interpolation (lerp)
      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04

      camera.position.x = targetX * 0.4
      camera.position.y = -targetY * 0.4
      camera.lookAt(scene.position)

      // Rotate point cloud
      pointCloud.rotation.y = elapsedTime * 0.03
      pointCloud.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05

      // Floating polyhedrons rotation & oscillation
      node1.rotation.x = elapsedTime * 0.4
      node1.rotation.y = elapsedTime * 0.3
      node1.position.y = 60 + Math.sin(elapsedTime * 0.8) * 8

      node2.rotation.y = elapsedTime * 0.5
      node2.rotation.z = elapsedTime * 0.2
      node2.position.y = -40 + Math.cos(elapsedTime * 0.7) * 7

      node3.rotation.x = elapsedTime * 0.3
      node3.rotation.y = elapsedTime * 0.4
      node3.position.y = 70 + Math.sin(elapsedTime * 0.6) * 6

      node4.rotation.x = elapsedTime * 0.4
      node4.rotation.z = elapsedTime * 0.5
      node4.position.y = -70 + Math.cos(elapsedTime * 0.9) * 8

      // Grid subtle drift
      gridHelper.rotation.y = elapsedTime * 0.01

      renderer.render(scene, camera)
    }

    animate()

    // -------------------------------------------------------------
    // Cleanup on Unmount
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      geometry.dispose()
      particleMaterial.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [interactive, particleCount, speedMultiplier])

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    />
  )
}

export default AmbientUniverse3D
