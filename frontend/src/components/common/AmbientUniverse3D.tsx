import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AmbientUniverse3DProps {
  className?: string
  interactive?: boolean
  particleCount?: number
  speedMultiplier?: number
}

// ---------------------------------------------------------------------------
// Procedural High-Fidelity Bank Card Texture Generator
// ---------------------------------------------------------------------------
function createBankCardTexture(options: {
  bankName: string
  cardType: string
  tier: string
  cardNumber: string
  holderName: string
  expiry: string
  bgColor: string
  accentColor: string
  foilColor: string
}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  // 1. Base Gradient with Brushed Metallic Texture
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 640)
  if (options.tier === 'obsidian') {
    bgGrad.addColorStop(0, '#0f172a')
    bgGrad.addColorStop(0.5, '#1e293b')
    bgGrad.addColorStop(1, '#090d16')
  } else if (options.tier === 'platinum') {
    bgGrad.addColorStop(0, '#cbd5e1')
    bgGrad.addColorStop(0.5, '#e2e8f0')
    bgGrad.addColorStop(1, '#94a3b8')
  } else if (options.tier === 'gold') {
    bgGrad.addColorStop(0, '#785418')
    bgGrad.addColorStop(0.5, '#b48528')
    bgGrad.addColorStop(1, '#53390c')
  } else {
    // Imperial Navy / Mist
    bgGrad.addColorStop(0, '#1e3a8a')
    bgGrad.addColorStop(0.5, '#1e40af')
    bgGrad.addColorStop(1, '#0f172a')
  }

  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 640)

  // 2. Micro-Guilloché Security Curves (Banknote Antifraud Pattern)
  ctx.strokeStyle = options.tier === 'platinum' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1.2
  for (let i = 0; i < 7; i++) {
    ctx.beginPath()
    const yOffset = 80 + i * 75
    for (let x = 0; x <= 1024; x += 10) {
      const y = yOffset + Math.sin(x * 0.015 + i) * 25 + Math.cos(x * 0.03 - i) * 15
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // 3. Bank Brand Header & Category
  ctx.fillStyle = options.tier === 'platinum' ? '#0f172a' : '#ffffff'
  ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif'
  ctx.letterSpacing = '2px'
  ctx.fillText(options.bankName.toUpperCase(), 70, 90)

  ctx.font = '600 20px "SF Mono", "Fira Code", monospace'
  ctx.fillStyle = options.tier === 'platinum' ? '#475569' : options.accentColor
  ctx.fillText(options.cardType.toUpperCase(), 70, 125)

  // 4. Golden EMV Microchip with Contact Traces
  const chipX = 70
  const chipY = 200
  const chipW = 140
  const chipH = 110

  // Chip Base
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH)
  chipGrad.addColorStop(0, '#fef08a')
  chipGrad.addColorStop(0.5, '#eab308')
  chipGrad.addColorStop(1, '#ca8a04')
  ctx.fillStyle = chipGrad
  ctx.beginPath()
  ctx.roundRect(chipX, chipY, chipW, chipH, 14)
  ctx.fill()

  // Chip Contact Grid Lines
  ctx.strokeStyle = '#854d0e'
  ctx.lineWidth = 2.5
  ctx.strokeRect(chipX + 15, chipY + 12, chipW - 30, chipH - 24)
  ctx.beginPath()
  ctx.moveTo(chipX + chipW / 2, chipY + 12)
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 12)
  ctx.moveTo(chipX + 15, chipY + chipH / 2)
  ctx.lineTo(chipX + chipW - 15, chipY + chipH / 2)
  ctx.stroke()

  // 5. Contactless NFC Symbol
  const nfcX = 250
  const nfcY = 255
  ctx.strokeStyle = options.tier === 'platinum' ? '#475569' : '#ffffff'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  for (let r = 16; r <= 36; r += 10) {
    ctx.beginPath()
    ctx.arc(nfcX, nfcY, r, -Math.PI * 0.35, Math.PI * 0.35)
    ctx.stroke()
  }

  // 6. Embossed 16-Digit Card Number with Metallic Drop Shadow
  ctx.font = 'bold 44px "SF Mono", "Courier New", monospace'
  ctx.letterSpacing = '8px'

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.fillText(options.cardNumber, 72, 402)
  // Light highlight
  ctx.fillStyle = options.tier === 'platinum' ? '#0f172a' : '#ffffff'
  ctx.fillText(options.cardNumber, 70, 400)

  // 7. Expiry & Security Badge
  ctx.font = '14px "SF Mono", monospace'
  ctx.fillStyle = options.tier === 'platinum' ? '#64748b' : '#94a3b8'
  ctx.fillText('VALID THRU', 70, 470)

  ctx.font = 'bold 24px "SF Mono", monospace'
  ctx.fillStyle = options.tier === 'platinum' ? '#0f172a' : '#ffffff'
  ctx.fillText(options.expiry, 70, 505)

  // 8. Cardholder Name
  ctx.font = 'bold 26px "Inter", sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillStyle = options.tier === 'platinum' ? '#0f172a' : '#f8fafc'
  ctx.fillText(options.holderName.toUpperCase(), 70, 570)

  // 9. Holographic Security Patch (Bottom Right)
  const holoX = 850
  const holoY = 470
  const holoW = 100
  const holoH = 100

  const holoGrad = ctx.createLinearGradient(holoX, holoY, holoX + holoW, holoY + holoH)
  holoGrad.addColorStop(0, '#f43f5e')
  holoGrad.addColorStop(0.25, '#fbbf24')
  holoGrad.addColorStop(0.5, '#34d399')
  holoGrad.addColorStop(0.75, '#38bdf8')
  holoGrad.addColorStop(1, '#818cf8')

  ctx.fillStyle = holoGrad
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.roundRect(holoX, holoY, holoW, holoH, 18)
  ctx.fill()
  ctx.globalAlpha = 1.0

  // Dual Interlocking Reserve Circles (Payment Network Emblem)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.beginPath()
  ctx.arc(holoX + 35, holoY + 50, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.beginPath()
  ctx.arc(holoX + 65, holoY + 50, 28, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}

// ---------------------------------------------------------------------------
// Procedural Gold Bullion Bar Texture Generator (Stamped 999.9 Fine Gold)
// ---------------------------------------------------------------------------
function createGoldIngotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Brushed Warm Gold Texture
  const grad = ctx.createLinearGradient(0, 0, 512, 256)
  grad.addColorStop(0, '#fbbf24')
  grad.addColorStop(0.3, '#f59e0b')
  grad.addColorStop(0.7, '#d97706')
  grad.addColorStop(1, '#b45309')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // Border Indent
  ctx.strokeStyle = '#92400e'
  ctx.lineWidth = 4
  ctx.strokeRect(16, 16, 480, 224)

  // Stamped Assayer Text
  ctx.textAlign = 'center'
  ctx.fillStyle = '#78350f'
  ctx.font = 'bold 24px "Inter", sans-serif'
  ctx.fillText('LOANFLOW TREASURY', 256, 60)

  ctx.font = '900 46px "SF Mono", monospace'
  ctx.fillText('999.9', 256, 120)

  ctx.font = 'bold 20px "Inter", sans-serif'
  ctx.fillText('FINE GOLD • 1000g', 256, 160)

  ctx.font = '14px "SF Mono", monospace'
  ctx.fillText('ASSAY NUMBER: AU-849201 • ISO-CERTIFIED', 256, 205)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}

export const AmbientUniverse3D: React.FC<AmbientUniverse3DProps> = ({
  className = '',
  interactive = true,
  particleCount = 200,
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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.0022)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 165)

    // -------------------------------------------------------------
    // Studio Banking Lighting (Key sunlight, soft mist-blue fill, gold rim)
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const keySunlight = new THREE.DirectionalLight(0xfffdfa, 1.25)
    keySunlight.position.set(70, 90, 80)
    scene.add(keySunlight)

    const fillMistLight = new THREE.DirectionalLight(0xdbeafe, 0.7)
    fillMistLight.position.set(-80, -50, -40)
    scene.add(fillMistLight)

    const goldRimLight = new THREE.PointLight(0xf59e0b, 1.0, 200)
    goldRimLight.position.set(60, -40, 50)
    scene.add(goldRimLight)

    // -------------------------------------------------------------
    // 1. High-Fidelity 3D Bank Credit & Underwriting Cards
    // -------------------------------------------------------------
    const cardGroup = new THREE.Group()
    scene.add(cardGroup)

    const createRealisticCard = (
      tex: THREE.CanvasTexture,
      width: number,
      height: number,
      x: number,
      y: number,
      z: number,
      rotX: number,
      rotY: number,
      rotZ: number
    ) => {
      const card = new THREE.Group()

      // Rounded Card Front
      const cardGeo = new THREE.BoxGeometry(width, height, 0.5)

      // Multi-material: Front gets texture, sides get silver core, back gets dark magnetic stripe
      const frontMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.28,
        metalness: 0.45,
      })
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.2,
        metalness: 0.8,
      })
      const backMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.3,
      })

      const materials = [
        edgeMat, // Right
        edgeMat, // Left
        edgeMat, // Top
        edgeMat, // Bottom
        frontMat, // Front
        backMat, // Back
      ]

      const mesh = new THREE.Mesh(cardGeo, materials)
      card.add(mesh)

      card.position.set(x, y, z)
      card.rotation.set(rotX, rotY, rotZ)
      return card
    }

    // Card 1: LoanFlow World Elite Obsidian Card (Top Left)
    const tex1 = createBankCardTexture({
      bankName: 'HDFC Bank Partner',
      cardType: 'Commercial Reserve Underwriter',
      tier: 'obsidian',
      cardNumber: '5328 •••• •••• 9421',
      holderName: 'Vikramaditya Singhania',
      expiry: '11/29',
      bgColor: '#0f172a',
      accentColor: '#38bdf8',
      foilColor: '#e2e8f0',
    })
    const card1 = createRealisticCard(tex1, 32, 20.2, -88, 38, -25, 0.15, 0.35, 0.18)

    // Card 2: State Bank of India Platinum Commercial Card (Bottom Right)
    const tex2 = createBankCardTexture({
      bankName: 'SBI Apex Commercial',
      cardType: 'SME Smart Underwriting Facility',
      tier: 'platinum',
      cardNumber: '4210 •••• •••• 8820',
      holderName: 'LoanFlow Underwriting Desk',
      expiry: '08/30',
      bgColor: '#e2e8f0',
      accentColor: '#0369a1',
      foilColor: '#0f172a',
    })
    const card2 = createRealisticCard(tex2, 30, 18.9, 92, -32, -20, -0.2, -0.38, -0.22)

    // Card 3: ICICI Bank / Axis Bank Gold Private Credit (Top Right Background)
    const tex3 = createBankCardTexture({
      bankName: 'ICICI Express Private',
      cardType: 'Instant Capital Disbursement',
      tier: 'gold',
      cardNumber: '4912 •••• •••• 1150',
      holderName: 'Enterprise Client Suite',
      expiry: '12/28',
      bgColor: '#785418',
      accentColor: '#fef08a',
      foilColor: '#fbbf24',
    })
    const card3 = createRealisticCard(tex3, 27, 17, 85, 48, -55, 0.12, -0.25, 0.12)

    cardGroup.add(card1, card2, card3)

    // -------------------------------------------------------------
    // 2. Real 3D 999.9 Fine Gold Bullion Ingot Bars (Treasury Reserves)
    // -------------------------------------------------------------
    const goldGroup = new THREE.Group()
    scene.add(goldGroup)

    const ingotTex = createGoldIngotTexture()

    const createGoldBar = (x: number, y: number, z: number, rX: number, rY: number, rZ: number) => {
      const barGroup = new THREE.Group()

      // Trapezoidal Ingot shape (Tapered box)
      const barGeo = new THREE.BoxGeometry(18, 5, 9)
      const topMat = new THREE.MeshStandardMaterial({
        map: ingotTex,
        color: 0xffdf78,
        metalness: 0.95,
        roughness: 0.18,
      })
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        metalness: 0.95,
        roughness: 0.22,
      })

      const barMaterials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]
      const barMesh = new THREE.Mesh(barGeo, barMaterials)
      barGroup.add(barMesh)

      barGroup.position.set(x, y, z)
      barGroup.rotation.set(rX, rY, rZ)
      return barGroup
    }

    const goldBar1 = createGoldBar(-76, -42, -35, 0.35, 0.5, -0.15)
    const goldBar2 = createGoldBar(-68, -46, -30, 0.25, 0.35, -0.05)
    goldGroup.add(goldBar1, goldBar2)

    // -------------------------------------------------------------
    // 3. Bank Vault Gear Escutcheon (Security & ISO Underwriting Dial)
    // -------------------------------------------------------------
    const vaultGroup = new THREE.Group()
    scene.add(vaultGroup)

    // Vault Outer Gear Wheel with Precision Teeth
    const gearGeo = new THREE.CylinderGeometry(18, 18, 1.8, 24)
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Brushed surgical steel
      metalness: 0.85,
      roughness: 0.25,
    })
    const gearMesh = new THREE.Mesh(gearGeo, gearMat)
    gearMesh.rotation.x = Math.PI / 2
    vaultGroup.add(gearMesh)

    // Inner Concentric Calibration Ring
    const innerRingGeo = new THREE.TorusGeometry(12, 0.6, 16, 48)
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xb48528, // Warm brass / gold index
      metalness: 0.8,
      roughness: 0.3,
    })
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat)
    vaultGroup.add(innerRingMesh)

    // Central Vault Locking Hub
    const hubGeo = new THREE.CylinderGeometry(5, 5, 2.5, 16)
    const hubMesh = new THREE.Mesh(hubGeo, gearMat)
    hubMesh.rotation.x = Math.PI / 2
    vaultGroup.add(hubMesh)

    vaultGroup.position.set(-35, -15, -45)
    vaultGroup.scale.set(0.85, 0.85, 0.85)

    // -------------------------------------------------------------
    // 4. Interconnected Core Banking Capital Flow Network
    // -------------------------------------------------------------
    const networkGroup = new THREE.Group()
    scene.add(networkGroup)

    const bankNodes = [
      new THREE.Vector3(-65, 22, -10), // HDFC Mumbai
      new THREE.Vector3(-25, 52, -20), // SBI Delhi
      new THREE.Vector3(35, 38, 0),    // ICICI Mumbai
      new THREE.Vector3(72, -8, -15),  // Axis Ahmedabad
      new THREE.Vector3(25, -48, -5),  // Kotak Bengaluru
      new THREE.Vector3(-45, -35, 10), // Treasury Vault
      new THREE.Vector3(0, 0, -5),     // LoanFlow Central CRM
    ]

    const nodeGeo = new THREE.SphereGeometry(2.0, 16, 16)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.6,
    })
    const goldNodeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.9,
    })

    bankNodes.forEach((pos, i) => {
      const mesh = new THREE.Mesh(nodeGeo, i === 5 || i === 6 ? goldNodeMat : nodeMat)
      mesh.position.copy(pos)
      networkGroup.add(mesh)
    })

    // Connect nodes with smooth banking currency flow lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.45,
    })

    for (let i = 0; i < bankNodes.length; i++) {
      for (let j = i + 1; j < bankNodes.length; j++) {
        if (bankNodes[i].distanceTo(bankNodes[j]) < 90) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([bankNodes[i], bankNodes[j]])
          const line = new THREE.Line(lineGeo, lineMat)
          networkGroup.add(line)
        }
      }
    }

    // -------------------------------------------------------------
    // 5. Serene Capital & Treasury Ambient Dust Particles
    // -------------------------------------------------------------
    const particleGeo = new THREE.BufferGeometry()
    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 380
      posArray[i + 1] = (Math.random() - 0.5) * 280
      posArray[i + 2] = (Math.random() - 0.5) * 200
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x64748b, // Slate mist
      transparent: true,
      opacity: 0.4,
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
    // Realistic Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime() * speedMultiplier

      // Gentle camera parallax with smooth lerp
      targetX += (mouseX - targetX) * 0.035
      targetY += (mouseY - targetY) * 0.035
      camera.position.x = targetX * 0.35
      camera.position.y = -targetY * 0.35
      camera.lookAt(0, 0, 0)

      // Floating Bank Cards natural aerodynamic tilt & oscillation
      card1.rotation.y = 0.35 + Math.sin(elapsed * 0.4) * 0.2
      card1.rotation.x = 0.15 + Math.cos(elapsed * 0.3) * 0.12
      card1.position.y = 38 + Math.sin(elapsed * 0.6) * 4.5

      card2.rotation.y = -0.38 - Math.sin(elapsed * 0.35) * 0.22
      card2.rotation.x = -0.2 + Math.cos(elapsed * 0.4) * 0.14
      card2.position.y = -32 + Math.sin(elapsed * 0.5) * 4.0

      card3.rotation.y = -0.25 + Math.cos(elapsed * 0.3) * 0.18
      card3.position.y = 48 + Math.sin(elapsed * 0.65) * 3.5

      // Gold Bullion Bars gentle floating gleam
      goldBar1.rotation.y = 0.5 + Math.sin(elapsed * 0.3) * 0.15
      goldBar1.position.y = -42 + Math.cos(elapsed * 0.45) * 2.5
      goldBar2.rotation.y = 0.35 + Math.sin(elapsed * 0.35) * 0.12
      goldBar2.position.y = -46 + Math.sin(elapsed * 0.4) * 2.5

      // Vault Gear slow mechanical security rotation
      vaultGroup.rotation.z = elapsed * 0.08
      vaultGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.1

      // Subtle network & particle rotation
      networkGroup.rotation.y = elapsed * 0.035
      dustPoints.rotation.y = elapsed * 0.015

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

      tex1.dispose()
      tex2.dispose()
      tex3.dispose()
      ingotTex.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      nodeGeo.dispose()
      nodeMat.dispose()
      goldNodeMat.dispose()
      lineMat.dispose()
      gearGeo.dispose()
      gearMat.dispose()
      innerRingGeo.dispose()
      innerRingMat.dispose()
      hubGeo.dispose()
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
