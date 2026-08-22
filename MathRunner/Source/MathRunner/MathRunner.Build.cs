// Copyright MathRunner. All Rights Reserved.

using UnrealBuildTool;

public class MathRunner : ModuleRules
{
public MathRunner(ReadOnlyTargetRules Target) : base(Target)
{
PCHUsage = PCHUsageMode.PCHOrSharedPCH;

PublicDependencyModuleNames.AddRange(new string[] { 
"Core", 
"CoreUObject", 
"Engine", 
"InputCore",
"ProceduralMeshComponent"
});

PrivateDependencyModuleNames.AddRange(new string[] {  });
}
}
