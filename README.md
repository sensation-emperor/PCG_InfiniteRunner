# Math Runner - Procedural 3D Infinite Runner ⚡

A complete, fully procedural 3D infinite runner web game with **3D animated character models, smooth skeletal animation state machine, real-time procedural geometry, dynamic visual biomes, and a polyphonic Web Audio synthesizer**!

---

## 🎮 Quick Start

You can play immediately either by running a local dev server or directly opening `index.html` in your browser.

### Option 1: Using pnpm & Vite (Recommended)

```bash
pnpm install
pnpm dev
```
Open `http://localhost:5173` in your browser.

### Option 2: Direct Local Browser Open / Static Server

Simply open `index.html` in any modern web browser or run:
```bash
# Python 3
python -m http.server 8080

# Or Vite preview
pnpm exec vite preview
```

---

## ✨ Features & Game Systems

### 1. 🤖 3D Animated Character Roster & Skeletal Animation Suite
- **⚡ Volt-7 Cyber Robot**: Expressive animated robot with glowing emissive visor, full skeletal rig, and fluid running, jumping, sliding, wave greeting, and crash reactions.
- **🛡️ Vanguard Commando**: Sci-Fi athletic exo-suit runner with dynamic sprint cycle, athletic jump flips, and slide dives.
- **🤖 X-9 Cyber Android**: Mixamo-style agile synthetic humanoid with high-reflex movements.
- **🔮 Neo Procedural Droid**: Pure mathematical geometric avatar with glowing quantum core and trigonometric running limb oscillations.
- **Live 3D Start Screen Showcase**: Real-time 3D character display in the menu that dynamically updates and plays greeting animations when switching characters.
- **Dynamic Procedural Banking & Lean**: Characters roll and lean (\(\pm 18^\circ\)) during left/right lane dodges.

### 2. 🕹️ Multi-Mode Game Suite
- **Classic Endless**: High-octane runner with dynamic speed acceleration, progressive hazard density, and high-score chase.
- **Time Attack**: Race against a 30.0s countdown clock. Collect glowing **Chrono Shards** to add +5.0s and extend your run.
- **Zen Flow**: A soothing endless runner mode with zero obstacles or fail states, relaxing ambient harmonic drones, and continuous flow.

### 3. ⚡ Full Arcade Power-Up Suite
- 🛡️ **Shield (15s)**: Pulsing procedural energy aura that absorbs obstacle collisions without ending the run.
- 🧲 **Coin Magnet (12s)**: Gravitational quadratic pull drawing coins and shards towards the player across all 3 lanes.
- ✨ **2X Multiplier (12s)**: Doubles distance score accumulation and coin collection value.
- 🚀 **Hyperdrive Boost (6s)**: Rocket burst forward at 2.2x speed with procedural warp trail particles and total invulnerability.

### 4. 🎨 Dynamic Visual Biomes & Shaders
- 🌆 **Neon Cyberpunk**: High-contrast cyan and magenta neon glow with dark reflective floor grids.
- 🌅 **Synthwave Sunset**: Coral Rose (`#FF6B9D`) to Sunset Orange (`#FF9A56`) gradient aesthetic with retro violet horizon.
- 🟩 **Matrix Wireframe**: Emerald digital holographic wireframe grid with neon pulse lines.
- 🌌 **Deep Void**: Obsidian terrain, luminescent gold accents, and starry atmospheric fog.
- **Dynamic Biome Shifting**: Seamlessly transitions biomes every 500 meters during long runs with color, fog, and shader lerping.

### 5. ✨ Cyberpunk Post-Processing Suite
- **Selective Unreal Bloom Glow**: Calibrated Bloom post-processing rendering luminous neon tracks, laser gantries, coin halos, and character visors with High / Balanced / Off presets.
- **Directional Screen Shake Physics**: Impulse-driven harmonic camera shake for jump landings, lane dodges, shield breaks, and fatal obstacle collisions.
- **Speed Warp Tunnel Shader**: Radial perspective distortion and neon speed lines active during Hyperdrive Boost.
- **Chromatic Aberration Bursts**: Dynamic RGB channel offset flash upon obstacle impact.

### 6. 🎵 4-Genre Procedural Audio Synthesizer (Web Audio API)
- **🌆 Horizon (Synthwave)**: 16th-note rolling saw bass arpeggios + soaring pentatonic leads synced to runner speed.
- **⚡ Darksynth (Industrial Cyberpunk)**: Heavy dual-saw detuned bass + resonant bandpass filter sweeps + industrial noise drums.
- **👾 8-Bit (Arcade Chiptune)**: Rapid square-wave chord arpeggios + vintage noise snares + chip melodies.
- **🌌 Ambient (Zen Pad)**: Lush evolving polyphonic harmonic drones for relaxing runs.
- **3D Spatial Audio Panning**: Web Audio stereo panning accurately positions coins, power-ups, and laser hazards across left/right audio channels as you pass them.

### 7. 📱 Modern Floating Glassmorphism UI
- **Floating Island Top Bar**: Capsule pill shape (`border-radius: 9999px`), frosted glass (`backdrop-filter: blur(20px)`), and live soundtrack/bloom quality quick toggles.
- **Active Power-Up Badges**: Animated cooldown timers showing remaining duration.
- **Mobile Touch Controls**: Full swipe gesture detection (Swipe Up to Jump, Down to Slide, Left/Right to Dodge).

---

## 🎯 Controls

| Action | Desktop Key | Mobile Gesture |
|---|---|---|
| **Jump** | `SPACE` / `W` / `↑` | Swipe Up |
| **Slide** | `S` / `↓` | Swipe Down |
| **Dodge Left** | `A` / `←` | Swipe Left |
| **Dodge Right** | `D` / `→` | Swipe Right |
| **Pause / Resume** | `P` / `ESC` | Pause Button Pill |
| **Toggle Audio** | `Audio Button` | Audio Button Pill |

---

## 📐 Mathematical Techniques & Algorithms

| Category | Mathematical Concepts & Formulas |
|---|---|
| **Geometry** | Parametric equations for Toroids, Cylinders, Octahedrons, Icosahedrons, and Extruded Star Polygons |
| **Noise & RNG** | 3D Perlin Noise, Linear Congruential Generators (LCG) for deterministic seeds |
| **Shaders** | Fresnel normal dot product glow, procedural UV step grids, time-varying trigonometric wave modulation |
| **Physics** | Parabolic trajectory arcs ($y = v_0 t - \frac{1}{2} g t^2$), AABB bounding box collision, lerp interpolation |
| **Audio** | Polyphonic frequency synthesis, low-pass biquad filter envelopes, pentatonic scale ratios |

---

## 📁 Project Structure

```
/PCG_InfiniteRunner
├── assets/
│   ├── js/GLTFLoader.js   # Standalone Three.js GLTF Loader
│   └── models/            # 3D GLB Character Models (robot, soldier, xbot)
├── public/                # Public static assets for dev server & production
├── index.html             # Floating glassmorphic HUD & character selector modal
├── game.js                # Engine, 3D animated player, procedural audio synth
├── package.json           # Web scripts and Vite dev server configuration
├── pnpm-lock.yaml         # Locked dependencies
├── FEATURE_PLAN.md        # Architectural roadmap and procedural algorithm design
├── LICENSE                # MIT License
└── README.md              # Project documentation
```

---

## 📄 License

MIT License - Copyright (c) 2026 sensation-emperor.