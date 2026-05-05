// Effets sonores synthétisés à la volée via Web Audio API.
// Aucun fichier MP3 nécessaire — tout est généré côté client.

export type SoundName =
  | "roll-start"
  | "dice-impact"
  | "critical"
  | "fumble"
  | "hover"
  | "toggle"

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null

function createCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctx) return ctx
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  masterGain = ctx.createGain()
  masterGain.gain.value = 1
  masterGain.connect(ctx.destination)
  return ctx
}

async function ensureCtx(): Promise<AudioContext | null> {
  const ac = createCtx()
  if (!ac) return null
  if (ac.state === "suspended") {
    try {
      await ac.resume()
    } catch {
      /* ignore */
    }
  }
  return ac
}

// Réveille le contexte audio dès la 1re interaction utilisateur — la plupart
// des navigateurs suspendent l'AudioContext tant qu'il n'y a pas de geste.
if (typeof window !== "undefined") {
  const boot = () => {
    void ensureCtx()
    window.removeEventListener("pointerdown", boot)
    window.removeEventListener("keydown", boot)
    window.removeEventListener("touchstart", boot)
  }
  window.addEventListener("pointerdown", boot, { once: true })
  window.addEventListener("keydown", boot, { once: true })
  window.addEventListener("touchstart", boot, { once: true })
}

interface ToneOptions {
  freq: number
  duration: number
  type?: OscillatorType
  attack?: number
  release?: number
  gain?: number
  freqEnd?: number
}

function playTone(ac: AudioContext, volume: number, opts: ToneOptions) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = opts.type ?? "sine"
  osc.frequency.setValueAtTime(opts.freq, ac.currentTime)
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(0.0001, opts.freqEnd),
      ac.currentTime + opts.duration,
    )
  }
  const peak = Math.max(0.0001, (opts.gain ?? 0.3) * volume)
  const attack = opts.attack ?? 0.005
  const release = opts.release ?? Math.max(0.02, opts.duration - attack)
  gain.gain.setValueAtTime(0.0001, ac.currentTime)
  gain.gain.linearRampToValueAtTime(peak, ac.currentTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + attack + release)
  osc.connect(gain).connect(masterGain ?? ac.destination)
  osc.start()
  osc.stop(ac.currentTime + attack + release + 0.05)
}

function playNoise(
  ac: AudioContext,
  volume: number,
  duration: number,
  opts: { hp?: number; lp?: number; gain?: number } = {},
) {
  const sampleRate = ac.sampleRate
  const buffer = ac.createBuffer(1, sampleRate * duration, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const src = ac.createBufferSource()
  src.buffer = buffer

  let node: AudioNode = src
  if (opts.hp !== undefined) {
    const f = ac.createBiquadFilter()
    f.type = "highpass"
    f.frequency.value = opts.hp
    node.connect(f)
    node = f
  }
  if (opts.lp !== undefined) {
    const f = ac.createBiquadFilter()
    f.type = "lowpass"
    f.frequency.value = opts.lp
    node.connect(f)
    node = f
  }

  const gain = ac.createGain()
  const peak = Math.max(0.0001, (opts.gain ?? 0.3) * volume)
  gain.gain.setValueAtTime(0.0001, ac.currentTime)
  gain.gain.linearRampToValueAtTime(peak, ac.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  node.connect(gain).connect(masterGain ?? ac.destination)
  src.start()
  src.stop(ac.currentTime + duration + 0.05)
}

export function playSound(name: SoundName, volume = 0.6) {
  const v = Math.max(0, Math.min(1, volume))
  void ensureCtx().then((ac) => {
    if (!ac) return

    switch (name) {
      case "roll-start": {
        playNoise(ac, v, 0.5, { hp: 200, lp: 4000, gain: 0.55 })
        playTone(ac, v, {
          freq: 130,
          freqEnd: 65,
          duration: 0.2,
          type: "sine",
          gain: 0.4,
        })
        return
      }
      case "dice-impact": {
        playNoise(ac, v, 0.07, { hp: 1200, lp: 8000, gain: 0.7 })
        playTone(ac, v, {
          freq: 240,
          freqEnd: 120,
          duration: 0.06,
          type: "square",
          gain: 0.35,
        })
        return
      }
      case "critical": {
        const base = 523.25 // C5
        const ratios = [1, 1.26, 1.5, 2]
        ratios.forEach((r, i) => {
          setTimeout(() => {
            playTone(ac, v, {
              freq: base * r,
              duration: 0.22,
              type: "triangle",
              gain: 0.4,
            })
          }, i * 80)
        })
        return
      }
      case "fumble": {
        playTone(ac, v, {
          freq: 240,
          freqEnd: 70,
          duration: 0.6,
          type: "sawtooth",
          gain: 0.35,
        })
        return
      }
      case "hover": {
        playTone(ac, v * 0.5, {
          freq: 880,
          duration: 0.04,
          type: "sine",
          gain: 0.2,
        })
        return
      }
      case "toggle": {
        playTone(ac, v, {
          freq: 660,
          freqEnd: 990,
          duration: 0.07,
          type: "sine",
          gain: 0.25,
        })
        return
      }
    }
  })
}

// Petit utilitaire pour tester l'audio depuis les paramètres.
export async function testAudio(volume = 0.6): Promise<{
  ok: boolean
  reason?: string
}> {
  if (typeof window === "undefined") return { ok: false, reason: "no-window" }
  const ac = await ensureCtx()
  if (!ac) return { ok: false, reason: "no-audio-context" }
  if (ac.state !== "running") {
    return { ok: false, reason: `context-state-${ac.state}` }
  }
  playSound("toggle", volume)
  return { ok: true }
}
