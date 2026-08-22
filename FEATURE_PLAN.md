# Math Runner - Web Procedural 3D Infinite Runner Feature Plan

## Vision
Create a high-performance web-based 3D infinite runner game where **ALL assets, geometry, shaders, biomes, sound effects, and music are procedurally generated in real-time using mathematical algorithms**, completely eliminating external 3D models, textures, or audio recordings.

---

## Core Systems & Architecture

### 1. Procedural Geometry Generation System
**All 3D models generated at runtime via mathematical equations**

- **Parametric Mesh Builder**
  - Real-time generation of platforms, obstacles, and collectibles
  - Primitives: Toroids, Octahedrons, Icosahedrons, Cylinders, Extruded Star Polygons
  - Advanced math shapes: Parametric surfaces, noise-displaced vertices, spiral helix gantries
- **Dynamic Procedural Obstacles**
  - Oscillating Sine-wave Laser Barriers
  - Rotating Segmented Helix Gates
  - High Slide Gantries and Elevated Hazard Beams
  - Parametric Sloped Ramps and Torus Arches

### 2. Real-Time Visual Effects & Shaders
**Procedural materials, lighting, and GPU-driven effects**

- **Shader Materials**
  - Fresnel rim glow calculation ($I = (1 - N \cdot V)^p$)
  - Procedural UV step grids and coordinate grid lines
  - Time-varying trigonometric wave modulation
- **Dynamic Biome Engine**
  - **Neon Cyberpunk**: Cyan/Magenta emissive glow with dark floor grid
  - **Synthwave Sunset**: Coral Rose (`#FF6B9D`) to Sunset Orange (`#FF9A56`) gradient
  - **Matrix Wireframe**: Emerald digital holographic wireframe grid
  - **Deep Void**: Obsidian terrain with luminescent gold accents
  - **Dynamic Biome Transitions**: Continuous interpolation of fog, lighting, and palette every 500m

### 3. Procedural Audio Synthesizer (Web Audio API)
**Real-time polyphonic audio generation without external sound files**

- **Synthesized Sound Effects**
  - Jump frequency sweeps with exponential ramp
  - Pentatonic scale coin collection chimes
  - Resonant multi-harmonic shield deflection shockwave
  - Dynamic filter sweeps on power-up activation
  - Filtered noise burst on collision
- **Dynamic Polyphonic Background Music**
  - 16th-note synthesized bass arpeggios synced to player speed
  - Melodic pentatonic lead progressions
  - Ambient multi-frequency harmonic drones for Zen Flow mode

### 4. Game Modes Suite
- **Classic Endless**: Increasing speed curve, progressive obstacle density, and high-score chase.
- **Time Attack**: 30-second countdown with collectible Chrono Shards (+5.0s bonus time).
- **Zen Flow**: Obstacle-free continuous flight mode with relaxing harmonic audio pad synthesis.

### 5. Arcade Power-Up Suite
- **Shield (15s)**: Kinetic energy barrier absorbing collisions.
- **Coin Magnet (12s)**: Quadratic distance gravity pull across all lanes.
- **2X Multiplier (12s)**: Doubled score and coin values.
- **Hyperdrive Boost (6s)**: 2.2x speed burst with warp particles and invulnerability.

### 6. Mobile & Desktop Responsive Controls
- **Desktop**: Arrow keys, WASD, Spacebar, P/ESC for pause.
- **Mobile Touch**: Touch gesture detector supporting swipes in all 4 directions.
- **Floating Island Glassmorphic HUD**: High-performance translucent UI with dedicated capsule targets.

---

## Technical Stack

- **Rendering Engine**: Three.js (WebGL)
- **Audio Engine**: Web Audio API (native browser audio synthesis)
- **Build / Dev Tooling**: Vite with `pnpm`
- **Languages**: HTML5, CSS3 Glassmorphism, Vanilla JavaScript (ES6+)
- **Asset Overhead**: 0 MB (100% procedural)

---

## Roadmap & Planned Enhancements

- [x] Web-based pure procedural pipeline
- [x] Multi-mode runner engine (Classic, Time Attack, Zen)
- [x] Complete power-up suite
- [x] Dynamic 4-biome transition system
- [x] Web Audio real-time polyphonic synth
- [x] Floating Glassmorphism HUD & touch controls
- [ ] Shareable procedural seed codes with custom challenge generation
- [ ] Local high-score persistence via `localStorage`
- [ ] Customizable geometric player avatars (parametric shapes)
- [ ] WebGL Bloom post-processing pipeline
