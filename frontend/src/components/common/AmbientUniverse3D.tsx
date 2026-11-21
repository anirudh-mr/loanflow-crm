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
  particleCount = 220,
  speedMultiplier = 0.7,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)

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
      console.warn('WebGL not supported', e)
      return
    }

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xf8fafc, 1) // Crisp mist-blue / alabaster
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.002)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.z = 160

    // Studio Lighting (Warm daylight & cool mist fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xfaf5ee, 0.9) // Soft warm nude sunlight
    dirLight1.position.set(80, 100, 70)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xe2e8f0, 0.6) // Cool mist fill
    dirLight2.position.set(-80, -60, -40)
    scene.add(dirLight2)

    // -------------------------------------------------------------
    // 1. Floating 3D Minimalist Banking & Credit Cards
    // -------------------------------------------------------------
    const cardGroup = new THREE.Group()
    scene.add(cardGroup)

    const createBankCard = (
      width: number,
      height: number,
      colorHex: number,
      x: number,
      y: number,
      z: number,
      rotZ: number
    ) => {
      const card = new THREE.Group()

      // Card Body with rounded bevel look
      const bodyGeo = new THREE.BoxGeometry(width, height, 0.6)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.2,
      })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      card.add(bodyMesh)

      // Golden EMV Chip
      const chipGeo = new THREE.BoxGeometry(width * 0.2, height * 0.22, 0.8)
      const chipMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Champagne gold
        metalness: 0.7,
        roughness: 0.3,
      })
      const chipMesh = new THREE.Mesh(chipGeo, chipMat)
      chipMesh.position.set(-width * 0.25, height * 0.08, 0.1)
      card.add(chipMesh)

      // Magnetic Stripe on back
      const stripeGeo = new THREE.BoxGeometry(width, height * 0.22, 0.7)
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0x334155, // Dark slate
        roughness: 0.5,
      })
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat)
      stripeMesh.position.set(0, height * 0.18, -0.1)
      card.add(stripeMesh)

      card.position.set(x, y, z)
      card.rotation.z = rotZ
      return card
    }

    // 3 Elegant Banking Cards: Mist Slate, Nude Sand, Classic Executive Navy
    const card1 = createBankCard(26, 16, 0x94a3b8, -85, 45, -30, 0.2) // Mist Blue card
    const card2 = createBankCard(24, 15, 0xe2d9cc, 95, -35, -20, -0.25) // Nude Sand card
    const card3 = createBankCard(22, 14, 0x1e293b, 80, 50, -60, 0.15) // Deep Slate card
    const card4 = createBankCard(20, 13, 0xcbd5e1, -75, -45, -50, -0.15) // Platinum card

    cardGroup.add(card1, card2, card3, card4)

    // -------------------------------------------------------------
    // 2. Interconnected Capital Flow Nodes (Customer -> CRM -> Banks)
    // -------------------------------------------------------------
    const networkGroup = new THREE.Group()
    scene.add(networkGroup)

    const nodePositions = [
      new THREE.Vector3(-60, 20, 0),
      new THREE.Vector3(-20, 50, -10),
      new THREE.Vector3(30, 35, 10),
      new THREE.Vector3(70, -10, -20),
      new THREE.Vector3(20, -45, 0),
      new THREE.Vector3(-40, -35, 15),
      new THREE.Vector3(0, 0, -5),
    ]

    const nodeGeo = new THREE.SphereGeometry(1.8, 16, 16)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Slate
      roughness: 0.4,
      metalness: 0.3,
    })

    nodePositions.forEach((pos) => {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat)
      mesh.position.copy(pos)
      networkGroup.add(mesh)
    })

    // Connect nodes with smooth capital flow lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1, // Mist filament
      transparent: true,
      opacity: 0.6,
    })

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j])
        if (dist < 85) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            nodePositions[i],
            nodePositions[j],
          ])
          const line = new THREE.Line(lineGeo, lineMat)
          networkGroup.add(line)
        }
      }
    }

    // -------------------------------------------------------------
    // 3. Gentle Ambient Dust Particles (Champagne & Mist)
    // -------------------------------------------------------------
    const particleGeo = new THREE.BufferGeometry()
    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 350
      posArray[i + 1] = (Math.random() - 0.5) * 250
      posArray[i + 2] = (Math.random() - 0.5) * 200
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x94a3b8, // Mist blue
      transparent: true,
      opacity: 0.45,
    })
    const dustPoints = new THREE.Points(particleGeo, particleMat)
    scene.add(dustPoints)

    // -------------------------------------------------------------
    // Mouse Interaction
    // -------------------------------------------------------------
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return
      mouseX = (event.clientX - window.innerWidth / 2) * 0.08
      mouseY = (event.clientY - window.innerHeight / 2) * 0.08
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

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
    // Serene Banking Motion Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime() * speedMultiplier

      // Gentle camera parallax
      targetX += (mouseX - targetX) * 0.03
      targetY += (mouseY - targetY) * 0.03
      camera.position.x = targetX * 0.3
      camera.position.y = -targetY * 0.3
      camera.lookAt(0, 0, 0)

      // Floating Bank Cards harmonic oscillation
      card1.rotation.y = Math.sin(elapsed * 0.4) * 0.25 + 0.3
      card1.rotation.x = Math.cos(elapsed * 0.3) * 0.15
      card1.position.y = 45 + Math.sin(elapsed * 0.6) * 5

      card2.rotation.y = -Math.sin(elapsed * 0.35) * 0.3 - 0.2
      card2.rotation.x = Math.sin(elapsed * 0.4) * 0.2
      card2.position.y = -35 + Math.cos(elapsed * 0.5) * 4

      card3.rotation.y = Math.cos(elapsed * 0.3) * 0.25 + 0.2
      card3.position.y = 50 + Math.sin(elapsed * 0.7) * 4

      card4.rotation.y = -Math.cos(elapsed * 0.3) * 0.25 - 0.2
      card4.position.y = -45 + Math.sin(elapsed * 0.5) * 5

      // Network group subtle rotation
      networkGroup.rotation.y = elapsed * 0.04
      dustPoints.rotation.y = elapsed * 0.02

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      particleGeo.dispose()
      particleMat.dispose()
      nodeGeo.dispose()
      nodeMat.dispose()
      lineMat.dispose()
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
