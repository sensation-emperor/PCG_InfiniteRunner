// Copyright Epic Games, Inc. All Rights Reserved.

#include "FAssetScanner.h"
#include "Engine/AssetManager.h"
#include "Misc/FileHelper.h"
#include "HAL/FileManager.h"

UAssetScanner::UAssetScanner()
    : ScannedAssetLibrary(nullptr)
{
    AssetManager = &FAssetManager::Get();
}

void UAssetScanner::ScanPath(const FString& SearchPath, bool bRecursive)
{
    if (SearchPath.IsEmpty())
    {
        UE_LOG(LogTemp, Error, TEXT("AssetScanner: Empty search path provided"));
        OnScanComplete.Broadcast(false, 0);
        return;
    }
    
    // Initialize the asset library if not already done
    if (!ScannedAssetLibrary)
    {
        ScannedAssetLibrary = NewObject<UScannedAssetLibrary>();
    }
    
    ScanDirectory(SearchPath, bRecursive);
    
    int32 TotalAssets = ScannedAssetLibrary->GetTotalAssetCount();
    UE_LOG(LogTemp, Log, TEXT("AssetScanner: Found %d assets in %s"), TotalAssets, *SearchPath);
    
    OnScanComplete.Broadcast(true, TotalAssets);
}

void UAssetScanner::ScanMultiplePaths(const TArray<FString>& SearchPaths, bool bRecursive)
{
    for (const FString& Path : SearchPaths)
    {
        ScanPath(Path, bRecursive);
    }
}

EAssetCategory UAssetScanner::CategorizeAsset(const FString& AssetName, const FString& AssetPath)
{
    FString LowerName = AssetName.ToLower();
    FString LowerPath = AssetPath.ToLower();
    
    // Platform/Path detection
    if (LowerName.Contains("platform") || LowerName.Contains("path") || 
        LowerName.Contains("floor") || LowerName.Contains("ground") ||
        LowerName.Contains("tile") || LowerName.Contains("segment"))
    {
        return EAssetCategory::Platform;
    }
    
    // Obstacle detection
    if (LowerName.Contains("obstacle") || LowerName.Contains("barrier") ||
        LowerName.Contains("block") || LowerName.Contains("wall"))
    {
        return EAssetCategory::Obstacle;
    }
    
    // Collectible detection
    if (LowerName.Contains("coin") || LowerName.Contains("gem") ||
        LowerName.Contains("collect") || LowerName.Contains("powerup") ||
        LowerName.Contains("bonus"))
    {
        return EAssetCategory::Collectible;
    }
    
    // Hazard detection
    if (LowerName.Contains("hazard") || LowerName.Contains("spike") ||
        LowerName.Contains("pit") || LowerName.Contains("trap") ||
        LowerName.Contains("danger"))
    {
        return EAssetCategory::Hazard;
    }
    
    // Environment detection
    if (LowerName.Contains("tree") || LowerName.Contains("rock") ||
        LowerName.Contains("bush") || LowerName.Contains("grass") ||
        LowerName.Contains("plant"))
    {
        return EAssetCategory::Environment;
    }
    
    // Architecture detection
    if (LowerName.Contains("building") || LowerName.Contains("architecture") ||
        LowerName.Contains("structure") || LowerName.Contains("column") ||
        LowerName.Contains("temple"))
    {
        return EAssetCategory::Architecture;
    }
    
    // Decoration detection (default fallback)
    return EAssetCategory::Decoration;
}

TArray<FString> UAssetScanner::ExtractAssetTags(const FString& AssetPath)
{
    TArray<FString> Tags;
    
    // In a full implementation, this would read metadata from the asset
    // For now, we extract basic tags from the path and name
    FString AssetName;
    FString PathPart;
    AssetPath.Split("/", &PathPart, &AssetName, ESearchCase::CaseSensitive, ESearchDir::FromEnd);
    
    // Add folder names as tags
    TArray<FString> PathSegments;
    PathPart.ParseIntoArray(PathSegments, TEXT("/"));
    for (const FString& Segment : PathSegments)
    {
        if (!Segment.IsEmpty())
        {
            Tags.AddUnique(Segment);
        }
    }
    
    return Tags;
}

float UAssetScanner::CalculateComplexity(const FString& AssetPath)
{
    // Placeholder implementation
    // In a real system, this would analyze mesh complexity, texture count, etc.
    return FMath::FRandRange(0.3f, 0.8f);
}

void UAssetScanner::ScanDirectory(const FString& Path, bool bRecursive)
{
    // Implementation would use Unreal's asset registry to find assets
    // This is a simplified version
    IFileManager& FileManager = IFileManager::Get();
    
    TArray<FString> FoundFiles;
    FString SearchPattern = Path / TEXT("*");
    
    if (bRecursive)
    {
        FileManager.FindFilesRecursive(FoundFiles, *SearchPattern, TEXT(".uasset"), true, false);
    }
    else
    {
        FileManager.FindFiles(FoundFiles, *SearchPattern, true);
    }
    
    for (const FString& File : FoundFiles)
    {
        ProcessFoundAsset(File);
    }
}

void UAssetScanner::ProcessFoundAsset(const FString& AssetPath)
{
    if (!ValidateAsset(AssetPath))
    {
        return;
    }
    
    FString AssetName;
    AssetPath.Split("/", nullptr, &AssetName, ESearchCase::CaseSensitive, ESearchDir::FromEnd);
    AssetName.RemoveFromEnd(TEXT(".uasset"));
    
    FScannedAssetData AssetData;
    AssetData.AssetName = AssetName;
    AssetData.PackagePath = AssetPath;
    AssetData.Category = CategorizeAsset(AssetName, AssetPath);
    AssetData.Tags = ExtractAssetTags(AssetPath);
    AssetData.ComplexityRating = CalculateComplexity(AssetPath);
    AssetData.bIsValidated = true;
    AssetData.ScanDate = FDateTime::Now();
    
    ScannedAssetLibrary->AddAsset(AssetData);
}

bool UAssetScanner::ValidateAsset(const FString& AssetPath)
{
    // Check if file exists
    if (!FPaths::FileExists(AssetPath))
    {
        return false;
    }
    
    // Additional validation could check if asset loads properly
    return true;
}

bool UAssetScanner::SaveAssetLibrary(const FString& SavePath)
{
    if (!ScannedAssetLibrary)
    {
        return false;
    }
    
    // Implementation would save the asset library to disk
    UE_LOG(LogTemp, Log, TEXT("AssetScanner: Saving library to %s"), *SavePath);
    return true;
}

bool UAssetScanner::LoadAssetLibrary(const FString& LoadPath)
{
    // Implementation would load a previously saved asset library
    UE_LOG(LogTemp, Log, TEXT("AssetScanner: Loading library from %s"), *LoadPath);
    return true;
}
