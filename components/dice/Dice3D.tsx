"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  TetrahedronGeometry,
  BoxGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  CylinderGeometry,
  CanvasTexture,
  MeshStandardMaterial,
  MathUtils,
  SRGBColorSpace,
  type Mesh,
  type BufferGeometry,
} from "three"
import type { DiceType } from "@/types/dice"
import {
  useSettingsStore,
  type DiceColor,
  type DiceMaterial,
} from "@/store/settingsStore"
import { cn } from "@/lib/utils"

const DICE_COLOR_MAP: Record<DiceColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
  gold: "#f59e0b",
  silver: "#cbd5e1",
  black: "#1e1b4b",
  white: "#f8fafc",
  "neon-pink": "#ec4899",
  "neon-cyan": "#06b6d4",
}

const DICE_TEXT_COLOR: Record<DiceColor, string> = {
  red: "#ffffff",
  blue: "#ffffff",
  green: "#ffffff",
  purple: "#ffffff",
  gold: "#1f1300",
  silver: "#1f2937",
  black: "#ffffff",
  white: "#1f2937",
  "neon-pink": "#ffffff",
  "neon-cyan": "#0c1e2c",
}

// Pour BoxGeometry, ordre des matériaux : [+X, -X, +Y, -Y, +Z, -Z]
const D6_FACE_AT_AXIS: number[] = [1, 6, 2, 5, 3, 4]

const D6_FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, -Math.PI / 2, 0],
  6: [0, Math.PI / 2, 0],
  2: [Math.PI / 2, 0, 0],
  5: [-Math.PI / 2, 0, 0],
  3: [0, 0, 0],
  4: [0, Math.PI, 0],
}

function createFaceTexture(value: number, bg: string, fg: string): CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  if (!ctx) return new CanvasTexture(canvas)

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = "rgba(255,255,255,0.15)"
  ctx.lineWidth = 8
  ctx.strokeRect(8, 8, 240, 240)

  ctx.fillStyle = fg
  ctx.font = "bold 150px ui-sans-serif, system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(value.toString(), 128, 128)

  if (value === 6 || value === 9) {
    ctx.beginPath()
    ctx.moveTo(95, 200)
    ctx.lineTo(161, 200)
    ctx.lineWidth = 8
    ctx.strokeStyle = fg
    ctx.stroke()
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

function buildGeometry(type: DiceType): BufferGeometry {
  switch (type) {
    case "d4":
      return new TetrahedronGeometry(1.2)
    case "d6":
    case "d2":
      return new BoxGeometry(1.6, 1.6, 1.6)
    case "d8":
      return new OctahedronGeometry(1.2)
    case "d10":
    case "d100":
      return new CylinderGeometry(0, 1.2, 1.6, 5, 1)
    case "d12":
      return new DodecahedronGeometry(1.1)
    case "d20":
      return new IcosahedronGeometry(1.2)
    case "d3":
      return new CylinderGeometry(1, 1, 0.8, 3)
    default:
      return new IcosahedronGeometry(1.2)
  }
}

function getMaterialProps(material: DiceMaterial, color: string) {
  switch (material) {
    case "metal":
      return { color, metalness: 0.95, roughness: 0.15 }
    case "gem":
      return {
        color,
        metalness: 0,
        roughness: 0.05,
        opacity: 0.85,
        transparent: true,
      }
    case "wood":
      return { color: "#92400e", metalness: 0, roughness: 0.85 }
    case "marble":
      return { color: "#f1f5f9", metalness: 0.1, roughness: 0.4 }
    case "holographic":
      return {
        color,
        metalness: 0.6,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.1,
      }
    case "neon":
      return {
        color,
        metalness: 0,
        roughness: 0.5,
        emissive: color,
        emissiveIntensity: 0.6,
      }
    case "plastic":
    default:
      return { color, metalness: 0.05, roughness: 0.4 }
  }
}

interface DieMeshProps {
  type: DiceType
  spinning: boolean
  color: DiceColor
  material: DiceMaterial
  userRotation: { x: number; y: number }
  resultValue?: number
  position?: [number, number, number]
  spinSeed?: number
}

function DieMesh({
  type,
  spinning,
  color,
  material,
  userRotation,
  resultValue,
  position = [0, 0, 0],
  spinSeed = 1,
}: DieMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const wasSpinning = useRef(false)
  const colorHex = DICE_COLOR_MAP[color]
  const fgHex = DICE_TEXT_COLOR[color]

  const geometry = useMemo(() => buildGeometry(type), [type])

  const materials = useMemo(() => {
    if (type !== "d6") return null
    const matProps = getMaterialProps(material, colorHex)
    return D6_FACE_AT_AXIS.map((face) => {
      const tex = createFaceTexture(face, colorHex, fgHex)
      return new MeshStandardMaterial({ ...matProps, color: "#ffffff", map: tex })
    })
  }, [type, material, colorHex, fgHex])

  const targetRotation = useMemo<[number, number, number]>(() => {
    if (type === "d6" && resultValue && D6_FACE_ROTATIONS[resultValue]) {
      const [tx, ty, tz] = D6_FACE_ROTATIONS[resultValue]
      return [tx + userRotation.x, ty + userRotation.y, tz]
    }
    return [userRotation.x, userRotation.y, 0]
  }, [type, resultValue, userRotation])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    if (spinning) {
      // Vitesse légèrement variable par dé pour éviter une rotation synchronisée
      const variance = 0.7 + ((spinSeed * 13) % 100) / 200
      mesh.rotation.x += delta * 6 * variance
      mesh.rotation.y += delta * 8 * variance
      mesh.rotation.z += delta * 4 * variance
      wasSpinning.current = true
      return
    }

    if (wasSpinning.current) {
      mesh.rotation.x = MathUtils.lerp(mesh.rotation.x, targetRotation[0], delta * 12)
      mesh.rotation.y = MathUtils.lerp(mesh.rotation.y, targetRotation[1], delta * 12)
      mesh.rotation.z = MathUtils.lerp(mesh.rotation.z, targetRotation[2], delta * 12)
      const close =
        Math.abs(mesh.rotation.x - targetRotation[0]) < 0.005 &&
        Math.abs(mesh.rotation.y - targetRotation[1]) < 0.005 &&
        Math.abs(mesh.rotation.z - targetRotation[2]) < 0.005
      if (close) {
        mesh.rotation.set(...targetRotation)
        wasSpinning.current = false
      }
      return
    }

    mesh.rotation.set(...targetRotation)
  })

  if (materials) {
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        position={position}
        castShadow
        receiveShadow
      />
    )
  }

  const props = getMaterialProps(material, colorHex)
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial {...props} />
    </mesh>
  )
}

export interface Dice3DItem {
  type: DiceType
  value?: number
}

interface Dice3DProps {
  /** Liste des dés à afficher en 3D (tous types confondus). */
  dice: Dice3DItem[]
  spinning: boolean
  className?: string
}

// Layout en grille des dés. Pour N dés, calcule cols/rows + offsets centrés.
function computeLayout(n: number): {
  positions: [number, number, number][]
  spacing: number
} {
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const spacing = n <= 1 ? 0 : 2.6
  const positions: [number, number, number][] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const x = (c - (cols - 1) / 2) * spacing
    const y = ((rows - 1) / 2 - r) * spacing
    positions.push([x, y, 0])
  }
  return { positions, spacing }
}

export function Dice3D({ dice, spinning, className }: Dice3DProps) {
  const diceColor = useSettingsStore((s) => s.diceColor)
  const material = useSettingsStore((s) => s.diceMaterial)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  const [rotation, setRotation] = useState({ x: 0.3, y: 0.4 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  // Reset la rotation user quand un nouveau résultat arrive (snap-to-face propre)
  const valuesKey = dice.map((d) => d.value ?? "?").join("|")
  const [prevValuesKey, setPrevValuesKey] = useState(valuesKey)
  if (
    !spinning &&
    valuesKey !== prevValuesKey &&
    dice.every((d) => d.value !== undefined)
  ) {
    setPrevValuesKey(valuesKey)
    setRotation({ x: 0, y: 0 })
  }

  const { positions } = computeLayout(dice.length)

  // Calcule la distance camera adaptative (vue large pour beaucoup de dés)
  const cols = Math.ceil(Math.sqrt(dice.length))
  const camZ = Math.max(5, 4 + cols * 1.2)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (spinning) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY }
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    dragRef.current = { x: e.clientX, y: e.clientY }
    setRotation((prev) => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }))
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      dragRef.current = null
    }
  }

  return (
    <div
      className={cn("relative size-full", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        cursor: spinning ? "default" : "grab",
        touchAction: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, camZ], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion && !spinning ? "demand" : "always"}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color="#a78bfa" />
        {dice.map((d, i) => (
          <DieMesh
            key={i}
            type={d.type}
            spinning={spinning}
            color={diceColor}
            material={material}
            userRotation={rotation}
            resultValue={d.value}
            position={positions[i]}
            spinSeed={i + 1}
          />
        ))}
      </Canvas>
    </div>
  )
}
