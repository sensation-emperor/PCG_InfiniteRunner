# Endless Runner Generator - Math-Based Procedural Games

A comprehensive procedural content generation (PCG) system for creating infinite runner games where **all assets can be generated mathematically**. This project includes both an Unreal Engine plugin and a standalone web-based implementation.

## 🎮 Quick Start - Web Version

**Play immediately in your browser!** No installation required.

```bash
cd WebRunner
python3 -m http.server 8080
# Open http://localhost:8080
```

Or simply open `WebRunner/index.html` in your browser.

## 📁 Project Components

### 1. WebRunner (Browser-Based) ⭐ NEW
A complete 3D infinite runner built with Three.js where **ALL assets are procedurally generated using mathematics**:

- ✅ Procedural geometry (platforms, obstacles, collectibles)
- ✅ Shader-based materials with neon effects
- ✅ Synthesized audio using Web Audio API
- ✅ Seed-based deterministic generation
- ✅ Full gameplay loop with scoring

**Features:**
- Jump, slide, and dodge through math-generated obstacles
- Collect spinning toroid coins
- Progressive difficulty with increasing speed
- Neon cyberpunk aesthetic
- Zero external art assets

See `WebRunner/README.md` for details.

### 2. Unreal Engine Plugin
A professional PCG system for Unreal Engine 5 that generates endless runner levels:

- **Asset Scanning & Categorization**: Automatically scans and categorizes UE assets
- **Tile Library System**: Organizes level segments with metadata
- **Seed-Based Generation**: Deterministic level generation for reproducible runs
- **Difficulty Director**: Dynamic difficulty adjustment based on player performance
- **Automatic Game Generation**: Complete level generation from asset pools

## 📋 Feature Plan

See `FEATURE_PLAN.md` for comprehensive roadmap including:

- ✨ Procedural Geometry Generation System
- 🎨 Multiple Visual Themes (Neon, Wireframe, Minimalist, etc.)
- 🏃 Advanced Player Mechanics & Animations
- ⚡ Power-Up System
- 🎵 Procedural Audio Synthesis
- 🎮 Multiple Game Modes
- 🏆 Progression & Social Features

## 🚀 Getting Started

### Web Version (Immediate Play)
```bash
cd WebRunner
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Unreal Engine Plugin
1. Copy to your UE project's `Plugins` folder
2. Enable the plugin in project settings
3. Configure asset pools in the editor
4. Generate levels using Blueprint or C++

## 📐 Mathematical Techniques Used

The WebRunner demonstrates:

| Category | Techniques |
|----------|-----------|
| **Geometry** | Parametric surfaces, extrusion, vertex manipulation |
| **Noise** | Perlin noise, LCG pseudo-random generation |
| **Shaders** | Fresnel glow, UV grids, time-based animation |
| **Physics** | Parabolic arcs, AABB collision, lerp interpolation |
| **Audio** | Oscillator synthesis, frequency modulation, pentatonic scales |

## 🛠️ Technologies

**WebRunner:**
- Three.js (3D rendering)
- Web Audio API (procedural sound)
- Vanilla JavaScript (no framework dependencies)

**Unreal Plugin:**
- Unreal Engine 5.x
- C++
- Blueprint visual scripting

## 🎯 Controls (WebRunner)

| Action | Key |
|--------|-----|
| Jump | SPACE / W / ↑ |
| Slide | S / ↓ |
| Move Left | A / ← |
| Move Right | D / → |

## 📊 Project Structure

```
/workspace
├── FEATURE_PLAN.md          # Comprehensive feature roadmap
├── README.md                # This file
├── BUILD_INSTRUCTIONS.md    # UE plugin build guide
├── Source/                  # Unreal Engine C++ source
│   ├── AssetScanner/
│   ├── TileLibrary/
│   ├── SeedEngine/
│   ├── DifficultyDirector/
│   └── LevelGenerator/
└── WebRunner/               # Browser-based game
    ├── index.html           # Main HTML + UI
    ├── game.js              # Complete game (~1000 lines)
    └── README.md            # Web version documentation
```

## 🎓 Educational Value

This project demonstrates:
- Applied mathematics in game development
- Procedural content generation techniques
- Real-time 3D graphics programming
- Audio synthesis fundamentals
- Game physics and collision detection
- Performance optimization strategies

## 🔮 Future Development

Planned features (see FEATURE_PLAN.md):
- Power-up system with math-generated effects
- Multiple game modes (Time Trial, Survival, Zen)
- Character customization variants
- Seed sharing and daily challenges
- Leaderboards and achievements
- Advanced particle systems
- Adaptive difficulty AI

## 📄 License

MIT License - See LICENSE file for details

---

**Experience the beauty of mathematical game design! 🎮✨**