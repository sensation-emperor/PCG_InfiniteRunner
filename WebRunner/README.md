# Math Runner - Procedural 3D Infinite Runner

A fully procedural 3D infinite runner game where **ALL assets are generated using mathematics** - no external art assets required!

## 🎮 Play Now

The game runs directly in your browser. Simply open `index.html` or access the local server at `http://localhost:8080`

## ✨ Features

### All Math-Generated Assets
- **Procedural Geometry**: Platforms, obstacles, and collectibles generated from parametric equations
- **Shader-Based Materials**: Custom GLSL shaders create neon glows, grids, and animated effects
- **Synthesized Audio**: Sound effects generated in real-time using Web Audio API oscillators
- **Deterministic Seeds**: Each run uses a seed for reproducible level generation

### Gameplay Mechanics
- **Three-Lane Running**: Switch between left, center, and right lanes
- **Jump**: Avoid ground obstacles (SPACE/W/↑)
- **Slide**: Duck under arches and barriers (S/↓)
- **Collectibles**: Gather spinning toroid coins for bonus points
- **Progressive Difficulty**: Speed increases over time

### Obstacle Types (All Math-Generated)
1. **Spike Blocks**: Star-shaped extruded geometry
2. **Arch Tunnels**: Torus segments to slide under
3. **Ramps**: Sloped platforms using vertex manipulation
4. **Pillars**: Cylindrical obstacles to dodge

### Visual Aesthetic
- Neon cyberpunk theme with glowing edges
- Animated grid patterns on surfaces
- Pulsing glow effects on collectibles
- Fog-based depth cueing
- Particle decorations

## 🎯 Controls

| Action | Key |
|--------|-----|
| Jump | SPACE / W / ↑ |
| Slide | S / ↓ |
| Move Left | A / ← |
| Move Right | D / → |

## 🏃 How to Play

1. Click "START RUN" to begin
2. Avoid obstacles by jumping, sliding, or changing lanes
3. Collect golden toroids for bonus points
4. Survive as long as possible while speed increases
5. Game ends when you collide with an obstacle

## 📐 Mathematical Techniques Used

### Geometry Generation
- **Parametric Surfaces**: Toroids, cylinders, capsules from mathematical formulas
- **Extrusion**: 2D shapes (stars) converted to 3D via extrusion
- **Vertex Manipulation**: Ramps created by modifying vertex positions
- **Constructive Solid Geometry**: Combined primitives for complex shapes

### Noise & Randomness
- **Perlin Noise**: For natural-looking variations (included in codebase)
- **Linear Congruential Generator**: Deterministic pseudo-random numbers for seed-based generation
- **Hash Functions**: Converting strings to seeds for shareable level codes

### Shaders (GLSL)
- **Fresnel Glow**: Edge detection based on normal vectors
- **Grid Patterns**: UV-based procedural textures
- **Pulsing Effects**: Time-based uniform animations
- **Additive Blending**: Neon appearance

### Physics
- **Parabolic Arcs**: Jump trajectories using kinematic equations
- **Box Collision**: AABB intersection testing
- **Lerp Interpolation**: Smooth lane changes and animations

### Audio Synthesis
- **Oscillators**: Sine, square, sawtooth waves
- **Frequency Modulation**: Pitch sweeps for jump sounds
- **Pentatonic Scale**: Musical collectible chimes
- **Envelope Generators**: ADSR-like volume shaping

## 🚀 Technical Implementation

```javascript
// Example: Procedural spike obstacle
static createSpikeObstacle(size, spikeCount = 4) {
    const shape = new THREE.Shape();
    const angleStep = (Math.PI * 2) / spikeCount;
    
    for (let i = 0; i <= spikeCount * 2; i++) {
        const angle = i * angleStep / 2;
        const radius = i % 2 === 0 ? size : size * 0.3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}
```

## 🎨 Visual Themes (Future Expansion)

The feature plan includes multiple math-based aesthetic themes:
- **Neon/Cyberpunk**: Current default
- **Wireframe**: Debug-style visualization
- **Minimalist**: Flat colors, simple geometry
- **Gradient World**: Color shifts by distance
- **Fractal Dimension**: Recursive geometry
- **Low Poly**: Faceted appearance

## 📊 Performance

- Runs at 60 FPS on modern browsers
- Instanced rendering for repeated geometry
- Object pooling for tiles and particles
- Frustum culling for off-screen objects
- LOD (Level of Detail) ready architecture

## 🔮 Future Features (See FEATURE_PLAN.md)

- Power-up system with math-generated effects
- Multiple game modes (Time Trial, Survival, Zen)
- Character customization (geometric variants)
- Seed sharing and daily challenges
- Leaderboards and achievements
- Advanced particle systems
- Procedural background environments
- Adaptive difficulty AI

## 📁 Project Structure

```
WebRunner/
├── index.html          # Main HTML file with UI
├── game.js             # Complete game implementation
└── README.md           # This file
```

## 🛠️ Technologies

- **Three.js**: 3D rendering library
- **Web Audio API**: Procedural sound synthesis
- **HTML5 Canvas**: Rendering surface
- **Vanilla JavaScript**: No framework dependencies

## 🎓 Educational Value

This project demonstrates:
- Applied mathematics in game development
- Procedural content generation techniques
- Real-time 3D graphics programming
- Audio synthesis fundamentals
- Game physics and collision detection
- Performance optimization strategies

## 📄 License

MIT License - Part of the larger Endless Runner Generator project

---

**Enjoy the beauty of mathematical game design! 🎮✨**
