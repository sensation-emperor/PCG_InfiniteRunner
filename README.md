# Seed-Based Unreal Engine Endless Runner Generator

A procedural content generation (PCG) system for Unreal Engine that automatically generates Temple Run/Subway Surfers-style endless runner games from selected assets.

## Features

- **Asset Scanning & Categorization**: Automatically scans and categorizes Unreal Engine assets into functional types (obstacles, platforms, decorations, etc.)
- **Tile Library System**: Organizes level segments into reusable tile libraries with metadata
- **Seed-Based Generation**: Deterministic level generation using seed values for reproducible runs
- **Difficulty Director**: Dynamic difficulty adjustment based on player performance
- **Automatic Game Generation**: Complete game generation from selected asset pools

## Project Structure

```
Source/
├── AssetScanner/          # Asset discovery and categorization
├── TileLibrary/           # Tile management and validation
├── SeedEngine/            # PRNG and seed-based generation
├── DifficultyDirector/    # Dynamic difficulty system
└── LevelGenerator/        # Main generation orchestration
```

## Requirements

- Unreal Engine 5.x
- C++ development environment

## Getting Started

1. Clone this repository into your Unreal Engine project's `Plugins` folder
2. Enable the plugin in your project settings
3. Configure asset pools in the editor
4. Generate levels using the provided tools

## License

MIT License