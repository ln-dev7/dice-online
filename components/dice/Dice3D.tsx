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

// Pour BoxGeometry, Three.js attend l'ordre des matériaux : [+X, -X, +Y, -Y, +Z, -Z]
// On mappe à un dé classique où la somme des faces opposées vaut 7 :
//   +X = 1, -X = 6, +Y = 2, -Y = 5, +Z = 3, -Z = 4
const D6_FACE_AT_AXIS: number[] = [1, 6, 2, 5, 3, 4]

// Rotation à appliquer au mesh pour amener une face donnée vers la caméra (+Z).
// Calculée à partir du tableau ci-dessus.
const D6_FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, -Math.PI / 2, 0], // amène +X (face 1) sur +Z
  6: [0, Math.PI / 2, 0], // amène -X (face 6) sur +Z
  2: [Math.PI / 2, 0, 0], // amène +Y (face 2) sur +Z
  5: [-Math.PI / 2, 0, 0], // amène -Y (face 5) sur +Z
  3: [0, 0, 0], // face 3 (+Z) déjà devant
  4: [0, Math.PI, 0], // amène -Z (face 4) sur +Z
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
  /** Rotation cible appliquée par l'utilisateur via la souris (en idle). */
  userRotation: { x: number; y: number }
  /** Valeur sortie après le lancer (pour snap-to-face d6). */
  resultValue?: number
}

function DieMesh({
  type,
  spinning,
  color,
  material,
  userRotation,
  resultValue,
}: DieMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const wasSpinning = useRef(false)
  const colorHex = DICE_COLOR_MAP[color]
  const fgHex = DICE_TEXT_COLOR[color]

  const geometry = useMemo(() => buildGeometry(type), [type])

  const materials = useMemo(() => {
    if (type !== "d6") return null
    const matProps = getMaterialProps(material, colorHex)
    // Quand on applique une texture, la couleur du material multiplie la texture.
    // On force `color: white` pour que les couleurs de la texture passent inchangées.
    return D6_FACE_AT_AXIS.map((face) => {
      const tex = createFaceTexture(face, colorHex, fgHex)
      return new MeshStandardMaterial({ ...matProps, color: "#ffffff", map: tex })
    })
  }, [type, material, colorHex, fgHex])

  // Cible de rotation : soit la face du résultat (snap), soit la rotation utilisateur (idle).
  const targetRotation = useMemo<[number, number, number]>(() => {
    if (type === "d6" && resultValue && D6_FACE_ROTATIONS[resultValue]) {
      const [tx, ty, tz] = D6_FACE_ROTATIONS[resultValue]
      // Ajoute la rotation utilisateur après le snap pour qu'il puisse continuer à inspecter
      return [tx + userRotation.x, ty + userRotation.y, tz]
    }
    return [userRotation.x, userRotation.y, 0]
  }, [type, resultValue, userRotation])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    if (spinning) {
      // Pendant le lancer : on tourne en continu, l'utilisateur ne peut pas intervenir
      mesh.rotation.x += delta * 6
      mesh.rotation.y += delta * 8
      mesh.rotation.z += delta * 4
      wasSpinning.current = true
      return
    }

    // Sortie de spin : snap vers la face cible (animation rapide)
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

    // En idle : on suit directement la rotation imposée par l'utilisateur (souris)
    mesh.rotation.set(...targetRotation)
  })

  if (materials) {
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
      />
    )
  }

  const props = getMaterialProps(material, colorHex)
  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial {...props} />
    </mesh>
  )
}

interface Dice3DProps {
  type: DiceType
  spinning: boolean
  /** Numéro à afficher en overlay (utilisé pour les dés non-d6). */
  value?: number
  showOverlayNumber?: boolean
  className?: string
}

export function Dice3D({
  type,
  spinning,
  value,
  showOverlayNumber = true,
  className,
}: Dice3DProps) {
  const diceColor = useSettingsStore((s) => s.diceColor)
  const material = useSettingsStore((s) => s.diceMaterial)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  // Rotation contrôlée par la souris.
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.4 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  // Pattern "store previous prop in state" pour reset la rotation quand
  // la valeur change (cf. https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  const [prevValue, setPrevValue] = useState(value)
  if (
    !spinning &&
    type === "d6" &&
    value !== undefined &&
    value !== prevValue
  ) {
    setPrevValue(value)
    setRotation({ x: 0, y: 0 })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (spinning) return
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
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

  const useOverlay = showOverlayNumber && type !== "d6" && value !== undefined

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
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion && !spinning ? "demand" : "always"}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color="#a78bfa" />
        <DieMesh
          type={type}
          spinning={spinning}
          color={diceColor}
          material={material}
          userRotation={rotation}
          resultValue={value}
        />
      </Canvas>

      {useOverlay && !spinning && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-white/20 bg-black/35 px-3 py-1 backdrop-blur-md">
            <span className="font-mono text-3xl font-bold text-white tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {value}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
