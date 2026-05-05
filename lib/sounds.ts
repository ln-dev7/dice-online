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

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  // Sur certaines plateformes le contexte démarre en "suspended" et doit
  // être réveillé par un geste utilisateur. resume() est sans effet sinon.
  if (ctx.state === "suspended") {
    void ctx.resume()
  }
  return ctx
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

function playTone(volume: number, opts: ToneOptions) {
  const ac = getCtx()
  if (!ac) return
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
  const peak = (opts.gain ?? 0.3) * volume
  const attack = opts.attack ?? 0.005
  const release = opts.release ?? Math.max(0.02, opts.duration - attack)
  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(peak, ac.currentTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + attack + release)
  osc.connect(gain).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + attack + release + 0.05)
}

function playNoise(
  volume: number,
  duration: number,
  opts: { hp?: number; lp?: number; gain?: number } = {},
) {
  const ac = getCtx()
  if (!ac) return
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
  const peak = (opts.gain ?? 0.3) * volume
  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(peak, ac.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  node.connect(gain).connect(ac.destination)
  src.start()
  src.stop(ac.currentTime + duration + 0.05)
}

export function playSound(name: SoundName, volume = 0.6) {
  const ac = getCtx()
  if (!ac) return
  const v = Math.max(0, Math.min(1, volume))

  switch (name) {
    case "roll-start": {
      // Roulement de dés : bruit blanc filtré qui décroît
      playNoise(v, 0.45, { hp: 200, lp: 4000, gain: 0.35 })
      // + petit "thunk" grave
      playTone(v, {
        freq: 120,
        freqEnd: 60,
        duration: 0.18,
        type: "sine",
        gain: 0.25,
      })
      return
    }
    case "dice-impact": {
      // Click sec à l'arrêt du dé
      playNoise(v, 0.06, { hp: 1500, lp: 8000, gain: 0.5 })
      playTone(v, {
        freq: 220,
        freqEnd: 120,
        duration: 0.05,
        type: "square",
        gain: 0.2,
      })
      return
    }
    case "critical": {
      // Petit arpège majeur ascendant
      const base = 523.25 // C5
      const ratios = [1, 1.26, 1.5, 2] // root, M3, P5, octave
      ratios.forEach((r, i) => {
        setTimeout(() => {
          playTone(v, {
            freq: base * r,
            duration: 0.18,
            type: "triangle",
            gain: 0.25,
          })
        }, i * 70)
      })
      return
    }
    case "fumble": {
      // Glissando descendant grave
      playTone(v, {
        freq: 220,
        freqEnd: 70,
        duration: 0.55,
        type: "sawtooth",
        gain: 0.25,
      })
      return
    }
    case "hover": {
      playTone(v * 0.4, {
        freq: 880,
        duration: 0.04,
        type: "sine",
        gain: 0.15,
      })
      return
    }
    case "toggle": {
      playTone(v, {
        freq: 660,
        freqEnd: 990,
        duration: 0.06,
        type: "sine",
        gain: 0.18,
      })
      return
    }
  }
}
