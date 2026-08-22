# Math Runner - Unreal Engine Infinite Runner

A **proper Unreal Engine 5** infinite runner game where **all assets are generated procedurally using mathematical functions** - no external art assets required.

## Features

### Core Gameplay
- **Infinite procedural level generation** using mathematical algorithms
- **Dynamic platform creation** with multiple types: Flat, Wave, Noise, Spiral, Fractal
- **Mathematical obstacle generation** using geometric shapes and parametric equations
- **Adaptive difficulty system** based on exponential scaling and Fibonacci sequences
- **Smooth character movement** with physics-based controls

### Procedural Generation System
All visual assets are generated at runtime using:
- **Trigonometric functions** (sine, cosine) for wave patterns
- **Simplex/Perlin noise** for organic terrain variations
- **Parametric equations** for complex geometric shapes
- **Fractal algorithms** for intricate patterns
- **Fibonacci sequences** for natural spacing and proportions

### Platform Types
1. **Flat** - Simple planar surfaces
2. **Wave** - Sinusoidal height variations
3. **Noise** - Perlin-like noise displacement
4. **Spiral** - Parametric spiral geometry
5. **Fractal** - Recursive mathematical patterns

### Technical Features
- Built with **Unreal Engine 5.3**
- Uses **ProceduralMeshComponent** for runtime mesh generation
- **Deterministic generation** with seed-based randomization
- **Performance optimized** with automatic cleanup of old platforms
- **Blueprint accessible** functions for easy extension

## Project Structure

```
MathRunner/
├── Config/
│   ├── DefaultEngine.ini
│   └── DefaultGame.ini
├── Content/
│   ├── Core/
│   ├── Characters/
│   ├── Procedural/
│   ├── Audio/
│   └── UI/
├── Source/
│   ├── MathRunner/
│   │   ├── MathRunner.Build.cs
│   │   ├── MathRunner.Target.cs
│   │   ├── MathRunnerEditor.Target.cs
│   │   ├── MathRunner.h
│   │   ├── MathRunner.cpp
│   │   ├── MathRunnerCharacter.h
│   │   ├── MathRunnerCharacter.cpp
│   │   ├── MathRunnerPlatform.h
│   │   ├── MathRunnerPlatform.cpp
│   │   ├── MathRunnerGameModeBase.h
│   │   └── MathRunnerGameModeBase.cpp
│   ├── MathRunner.Target.cs
│   └── MathRunnerEditor.Target.cs
└── MathRunner.uplugin
```

## Building Instructions

### Prerequisites
- **Unreal Engine 5.3** installed
- **Visual Studio 2022** with C++ development tools
- **Epic Games Launcher**

### Build Steps

1. **Open the Project**
   ```bash
   # Navigate to project directory
   cd MathRunner
   
   # Generate Visual Studio project files
   /path/to/UE_5.3/Engine/Build/BatchFiles/GenerateProjectFiles.bat
   ```

2. **Build in Visual Studio**
   - Open `MathRunner.sln` in Visual Studio
   - Set configuration to `Development Editor`
   - Build solution (Ctrl+Shift+B)

3. **Open in Unreal Editor**
   - Right-click `MathRunner.uproject` (after renaming from .uplugin)
   - Select "Launch" or open via Epic Games Launcher

4. **Alternative: Command Line Build**
   ```bash
   # Build for Development Editor
   /path/to/UE_5.3/Engine/Build/BatchFiles/Build.bat MathRunnerEditor Win64 Development
   
   # Build for Shipping
   /path/to/UE_5.3/Engine/Build/BatchFiles/Build.bat MathRunner Win64 Shipping
   ```

## Usage

### In Unreal Editor
1. Open the project in Unreal Editor
2. Create a new level or open MainLevel
3. The game mode will automatically spawn initial platforms
4. Press Play to start running

### Customization
All parameters are exposed in the editor:
- **Platform settings**: Length, width, vertex density, wave amplitude/frequency
- **Character settings**: Base speed, jump force, boost multipliers
- **Game mode settings**: Spawn interval, difficulty scaling, generation seed

## Mathematical Concepts Used

### Geometry Generation
- **Vertex calculation**: Grid-based tessellation with mathematical height functions
- **Normal calculation**: Gradient-based normals for proper lighting
- **UV mapping**: Procedural UV coordinates based on vertex positions

### Movement Physics
- **Parabolic trajectories**: Jump calculations using projectile motion equations
- **Exponential scaling**: Speed boosts using power functions
- **Trigonometric animation**: Smooth procedural animations using sine waves

### Level Design
- **Fibonacci spacing**: Natural platform gaps using Fibonacci sequence
- **Noise functions**: Organic variations using layered sine waves
- **Modular arithmetic**: Obstacle type selection using pattern recognition

## Extending the Game

### Adding New Platform Types
1. Add new enum value in `MathRunnerPlatform.h`
2. Implement generation function in `MathRunnerPlatform.cpp`
3. Update switch statement in `GeneratePlatform()`

### Adding Obstacles
1. Create new actor class for obstacle type
2. Implement procedural mesh generation
3. Update `SpawnMathematicalObstacle()` in GameMode

### Custom Mathematical Functions
- Add new functions to calculate height, color, or other properties
- Use UE4's `FMath` library for mathematical operations
- Combine multiple functions for complex effects

## Performance Considerations

- **Mesh simplification**: Adjust vertex density based on distance
- **Object pooling**: Reuse platform actors instead of spawning/destroying
- **LOD system**: Implement level of detail for distant platforms
- **Async generation**: Generate platforms on background thread

## License

MIT License - See LICENSE file for details

## Credits

Developed as a demonstration of procedural generation techniques in Unreal Engine.
All assets generated mathematically at runtime - no external art assets used.
