# Math Runner - Build Instructions

## Prerequisites

Before building, ensure you have:

1. **Unreal Engine 5.3** installed via Epic Games Launcher
2. **Visual Studio 2022** with the following workloads:
   - Desktop development with C++
   - Game development with C++
3. **.NET SDK 6.0** or later

## Quick Start

### Option 1: Using Epic Games Launcher (Recommended)

1. Navigate to the `MathRunner` folder
2. Right-click on `MathRunner.uproject`
3. Select "Launch" to open in Unreal Editor
4. The editor will automatically generate project files and compile

### Option 2: Command Line Build

#### Step 1: Generate Project Files

**Windows:**
```batch
cd MathRunner
%UNREAL_ENGINE_PATH%\Engine\Build\BatchFiles\GenerateProjectFiles.bat
```

**Mac/Linux:**
```bash
cd MathRunner
/Path/To/UE_5.3/Engine/Build/BatchFiles/Mac/GenerateProjectFiles.sh
```

#### Step 2: Build with Visual Studio

**Windows:**
```batch
# Open the solution
MathRunner.sln

# Or build from command line
msbuild MathRunner.sln /p:Configuration="Development Editor" /p:Platform="Win64"
```

#### Step 3: Build from Command Line (Alternative)

**Windows:**
```batch
# Build Editor version
%UNREAL_ENGINE_PATH%\Engine\Build\BatchFiles\Build.bat MathRunnerEditor Win64 Development

# Build Game version
%UNREAL_ENGINE_PATH%\Engine\Build\BatchFiles\Build.bat MathRunner Win64 Shipping
```

**Mac:**
```bash
# Build Editor
/Path/To/UE_5.3/Engine/Build/BatchFiles/Mac/Build.sh MathRunnerEditor Mac Development

# Build Game
/Path/To/UE_5.3/Engine/Build/BatchFiles/Mac/Build.sh MathRunner Mac Shipping
```

**Linux:**
```bash
# Build Editor
/Path/To/UE_5.3/Engine/Build/BatchFiles/Linux/Build.sh MathRunnerEditor Linux Development

# Build Game  
/Path/To/UE_5.3/Engine/Build/BatchFiles/Linux/Build.sh MathRunner Linux Shipping
```

## Troubleshooting

### Common Issues

#### 1. "ProceduralMeshComponent module not found"
- Ensure the Procedural Mesh Component plugin is enabled
- In Unreal Editor: Edit > Plugins > Search "Procedural" > Enable
- Or add to your .uproject file:
```json
"Plugins": [
    {
        "Name": "ProceduralMeshComponent",
        "Enabled": true
    }
]
```

#### 2. Compilation Errors
- Clean and rebuild:
  ```batch
  # Delete Binaries and Intermediate folders
  rmdir /s Binaries
  rmdir /s Intermediate
  
  # Regenerate project files
  GenerateProjectFiles.bat
  
  # Rebuild
  msbuild MathRunner.sln
  ```

#### 3. Missing Visual Studio Components
- Open Visual Studio Installer
- Modify installation
- Add "Desktop development with C++" workload
- Add "Game development with C++" workload

#### 4. Unreal Engine Version Mismatch
- Check `MathRunner.uproject` for EngineAssociation
- Current version: 5.3
- Update if using different UE version

## First Launch

After successful build:

1. Open Unreal Editor with the project
2. Create a new level: File > New Level > Default
3. Save as `/Game/Core/MainLevel`
4. The game mode will auto-spawn platforms when you press Play

## Packaging for Distribution

### Windows Package

```batch
%UNREAL_ENGINE_PATH%\Engine\Build\BatchFiles\Build.bat MathRunner Win64 Shipping -project=MathRunner.uproject
```

### Mac Package

```bash
/Path/To/UE_5.3/Engine/Build/BatchFiles/Mac/Build.sh MathRunner Mac Shipping -project=MathRunner.uproject
```

## Performance Tips

1. **Reduce Vertex Density** for lower-end hardware
2. **Enable Nanite** for high-poly platforms (UE5.3+)
3. **Use Lumen** for dynamic global illumination
4. **Adjust LOD settings** in platform generation code

## Development Workflow

1. Make code changes in Visual Studio/Rider
2. Recompile (Ctrl+Shift+B in VS)
3. Hot-reload in Unreal Editor (Tools > Compile)
4. Test changes immediately without restarting editor

## Additional Resources

- [Unreal Engine Documentation](https://docs.unrealengine.com/)
- [Procedural Mesh Component Guide](https://docs.unrealengine.com/5.3/en-US/procedural-mesh-component-in-unreal-engine/)
- [C++ Programming Guide](https://docs.unrealengine.com/5.3/en-US/cpp-programming-guide-for-unreal-engine/)
