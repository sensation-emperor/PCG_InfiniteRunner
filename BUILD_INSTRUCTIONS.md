# Seed-Based Unreal Engine Endless Runner Generator - Build Instructions

## Project Overview

This is a procedural content generation (PCG) system for Unreal Engine that automatically generates Temple Run/Subway Surfers-style endless runner games from selected assets.

## Module Structure

```
Source/
├── EndlessRunnerGenerator.h/cpp    # Main plugin module
├── TileTypes.h                     # Core enums and structs
├── AssetScanner/                   # Asset discovery and categorization
│   ├── FAssetScanner.h/cpp
│   └── FScannedAssetData.h/cpp
├── TileLibrary/                    # Tile management
│   ├── FTileDefinition.h/cpp
├── SeedEngine/                     # PRNG and seed-based generation
│   ├── FSeedEngine.h/cpp
├── DifficultyDirector/             # Dynamic difficulty system
│   ├── FDifficultyDirector.h/cpp
└── LevelGenerator/                 # Main generation orchestration
    ├── FLevelGenerator.h/cpp
```

## Building the Plugin

### Step 1: Create Plugin Directory

Copy this project into your Unreal Engine project's Plugins folder:

```bash
# In your Unreal Engine project root
mkdir -p Plugins/EndlessRunnerGenerator
cp -r Source Plugins/EndlessRunnerGenerator/
cp EndlessRunnerGenerator.uplugin Plugins/EndlessRunnerGenerator/
```

### Step 2: Create Plugin Descriptor

Create `EndlessRunnerGenerator.uplugin` in the plugin root:

```json
{
    "FileVersion": 3,
    "Version": 1,
    "VersionName": "1.0",
    "FriendlyName": "Endless Runner Generator",
    "Description": "Procedural generation system for endless runner games",
    "Category": "Procedural Content Generation",
    "CreatedBy": "Your Name",
    "CreatedFrom": "Custom C++ Plugin",
    "DocsURL": "",
    "Modules": [
        {
            "Name": "EndlessRunnerGenerator",
            "Type": "Runtime",
            "LoadingPhase": "Default"
        }
    ],
    "Plugins": [],
    "CanContainContent": true,
    "IsBetaVersion": false,
    "InstalledState": true
}
```

### Step 3: Create Build.cs File

Create `Source/EndlessRunnerGenerator.build.cs`:

```csharp
using UnrealBuildTool;

public class EndlessRunnerGenerator : ModuleRules
{
    public EndlessRunnerGenerator(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.PCHOrSharedPCH;
        
        PublicDependencyModuleNames.AddRange(new string[] 
        { 
            "Core", 
            "CoreUObject", 
            "Engine",
            "InputCore"
        });
        
        PrivateDependencyModuleNames.AddRange(new string[] 
        { 
            "Projects",
            "Slate",
            "SlateCore"
        });
    }
}
```

### Step 4: Compile

1. Right-click on your `.uproject` file
2. Select "Generate Visual Studio project files"
3. Open the generated `.sln` file in Visual Studio
4. Build the solution in Development Editor configuration

Alternatively, use command line:

```bash
# Navigate to Unreal Engine installation
cd /path/to/UnrealEngine/Engine/Binaries/DotNET

# Build your project
dotnet build /path/to/YourProject/YourProject.uproject
```

## Usage

### 1. Asset Scanning

```cpp
// Create asset scanner
UAssetScanner* Scanner = NewObject<UAssetScanner>();
Scanner->OnScanComplete.AddDynamic(this, &AMyClass::OnAssetsScanned);

// Scan asset directories
Scanner->ScanPath("/Game/Assets/Environment", true);
Scanner->ScanPath("/Game/Assets/Obstacles", true);
```

### 2. Setup Components

```cpp
// Create components
USeedEngine* SeedEngine = NewObject<USeedEngine>();
UTileLibrary* TileLib = LoadObject<UTileLibrary>(nullptr, TEXT("/Game/TileLibrary.MyTileLib"));
UDifficultyDirector* Director = NewObject<UDifficultyDirector>();

// Initialize difficulty presets
TArray<FDifficultySettings> Presets;
// ... configure presets
Director->Initialize(Presets);

// Create and initialize generator
ULevelGenerator* Generator = NewObject<ULevelGenerator>();
Generator->Initialize(SeedEngine, TileLib, Director);
```

### 3. Generate Level

```cpp
// Configure generation
FGenerationParameters Params;
Params.Seed = 12345;  // Use same seed for reproducible levels
Params.MinTiles = 50;
Params.MaxTiles = 100;
Params.InitialDifficulty = 0.5f;
Params.bEnableDynamicDifficulty = true;

// Connect to events
Generator->OnGenerationComplete.AddDynamic(this, &AMyClass::OnLevelGenerated);
Generator->OnTileGenerated.AddDynamic(this, &AMyClass::OnTilePlaced);

// Generate
Generator->GenerateLevel(Params);
```

### 4. Blueprint Usage

All classes are Blueprint-exposed:

1. Create Blueprint instances of:
   - `SeedEngine`
   - `DifficultyDirector`
   - `LevelGenerator`

2. Use the exposed functions in Blueprint graphs

## Key Features

### Seed-Based Generation
- Deterministic level generation from seed values
- Shareable level codes via seed strings
- Reproducible runs for testing

### Asset Categorization
- Automatic scanning of Unreal asset folders
- Smart categorization based on naming conventions
- Tag extraction from paths

### Dynamic Difficulty
- Real-time adjustment based on player performance
- Configurable difficulty presets
- Smooth transitions between difficulty levels

### Tile System
- Modular tile definitions with compatibility rules
- Support for curves, jumps, obstacles, bridges, tunnels
- Validation for playability

## API Reference

### USeedEngine
- `Initialize(int32 Seed)` - Set seed value
- `RandRange(int32 Min, int32 Max)` - Get random integer
- `RandRangeFloat(float Min, float Max)` - Get random float
- `StringToSeed(FString)` - Convert string to seed

### UTileLibrary
- `GetTilesByType(ETileType)` - Filter tiles by type
- `GetRandomTileByType(ETileType, int32 Seed)` - Deterministic selection
- `ValidateAllTiles()` - Check mesh references

### UDifficultyDirector
- `UpdateDifficulty(Score, Distance, Deaths)` - Adjust based on performance
- `GetCurrentDifficulty()` - Get current value (0-1)
- `SetDifficulty(float, FString Reason)` - Manual override

### ULevelGenerator
- `GenerateLevel(FGenerationParameters)` - Full level generation
- `GenerateNextTile()` - Incremental generation
- `ValidateLevelPlayability()` - Check for issues

## License

MIT License - See LICENSE file for details
