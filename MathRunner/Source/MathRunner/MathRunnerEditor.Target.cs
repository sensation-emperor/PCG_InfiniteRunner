// Copyright MathRunner. All Rights Reserved.

using UnrealBuildTool;

public class MathRunnerEditorTarget : TargetRules
{
public MathRunnerEditorTarget(TargetInfo Target) : base(Target)
{
Type = TargetType.Editor;
DefaultBuildSettings = BuildSettingsVersion.V4;
IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;
ExtraModuleNames.AddRange(new string[] { "MathRunner" });
}
}
