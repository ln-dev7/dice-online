# 🎲 Dice Online

> Application web moderne de lancer de dés pour jeux de rôle et jeux de société.

**Made with ❤️ by [Leonel Ngoya](https://lndev.me)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🎲 **Tous les dés JDR** : D2, D3, D4, D6, D8, D10, D12, D20, D100
- 🧮 **Parser de notation** : `2d6+3`, `4d6kh3`, `4d6dl1`, `1d20+5`
- 🎯 **Modes spéciaux** : Avantage / Désavantage, Exploding dice, Reroll on 1, Keep/Drop highest/lowest
- 🎮 **Systèmes de jeu** : D&D 5e, Pathfinder, Call of Cthulhu, Warhammer, Savage Worlds
- 🎨 **Dés 3D** réalistes avec Three.js (avec fallback 2D)
- 🔊 **Sons immersifs** avec contrôle de volume
- 📳 **Vibration mobile** sur les impacts
- 🎉 **Confettis** sur les critiques (20 naturel)
- 📊 **Statistiques détaillées** : distribution, taux de critiques, records
- 📜 **Historique persistant** des 100 derniers lancers
- 💾 **Presets** pour les lancers fréquents
- 👤 **Système de personnages** avec stats et modificateurs
- 🌗 **Dark / Light mode** avec toggle (`d`)
- ⌨️ **Raccourcis clavier** (`Espace` pour relancer, `Cmd+K` pour la palette)
- 🔐 **Crypto-secure random** (`crypto.getRandomValues`)
- ♿ **Accessible** (WCAG AA, `prefers-reduced-motion`)

---

## 🛠️ Stack

| Catégorie | Outil |
|-----------|-------|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript (strict) |
| Styling | TailwindCSS v4 |
| UI | shadcn/ui (radix-luma) |
| 3D | Three.js + @react-three/fiber + drei |
| Animations | Framer Motion |
| State | Zustand (`persist` middleware) |
| Charts | Recharts |
| Toasts | Sonner |
| Tests | Vitest + Testing Library |

---

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/ln-dev7/dice-online.git
cd dice-online

# Installer les dépendances
pnpm install

# Lancer le serveur de dev
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## 📜 Scripts

```bash
pnpm dev         # Serveur de développement (Turbopack)
pnpm build       # Build production
pnpm start       # Serveur production
pnpm lint        # ESLint
pnpm typecheck   # Vérification TypeScript
pnpm test        # Lancer les tests
pnpm test:watch  # Tests en mode watch
pnpm format      # Formater avec Prettier
```

---

## 🎲 Notation supportée

| Notation | Description |
|----------|-------------|
| `1d20` | Lance un D20 |
| `2d6+3` | 2D6 avec modificateur +3 |
| `4d6kh3` | 4D6, garde les 3 plus hauts |
| `4d6dl1` | 4D6, retire le plus bas (stats D&D) |
| `2d20kh1` | Avantage (D&D 5e) |
| `2d20kl1` | Désavantage (D&D 5e) |
| `1d6!` | Exploding dice |

---

## 🗺️ Roadmap

- [ ] Mode collaboratif temps réel (WebRTC)
- [ ] Chat intégré pour parties JDR
- [ ] Système de campagne avec sauvegarde cloud
- [ ] Export PDF des fiches personnages
- [ ] Plus de systèmes de jeu (FATE, GURPS, World of Darkness)
- [ ] Mode "Cinéma" avec ralenti dramatique
- [ ] Intégration avec Roll20 / Foundry VTT

---

## 📄 License

[MIT](LICENSE) © [Leonel Ngoya](https://lndev.me)
