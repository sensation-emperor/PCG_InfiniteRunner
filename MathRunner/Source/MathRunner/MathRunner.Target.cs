// Copyright MathRunner. All Rights Reserved.

using UnrealBuildTool;

public class MathRunnerTarget : TargetRules
{
public MathRunnerTarget(TargetInfo Target) : base(Target)
{
Type = TargetType.Game;
DefaultBuildSettings = BuildSettingsVersion.V4;
IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;
ExtraModuleNames.AddRange(new string[] { "MathRunner" });
}
}
