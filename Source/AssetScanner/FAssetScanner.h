// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "FScannedAssetData.h"
#include "Engine/AssetManager.h"
#include "UObject/Object.h"
#include "FAssetScanner.generated.h"

/**
 * Delegate for when asset scanning is complete
 */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnAssetScanComplete, bool, bSuccess, int32, AssetsFound);

/**
 * Asset Scanner component that discovers and categorizes Unreal Engine assets
 */
UCLASS(Blueprintable, meta = (BlueprintSpawnableComponent))
class UAssetScanner : public UObject
{
    GENERATED_BODY()
    
public:
    UAssetScanner();
    
    /** Event triggered when scanning completes */
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnAssetScanComplete OnScanComplete;
    
    /**
     * Scan a specific path in the content browser for assets
     * @param SearchPath - The path to scan (e.g., "/Game/Assets")
     * @param bRecursive - Whether to scan subdirectories
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    void ScanPath(const FString& SearchPath, bool bRecursive = true);
    
    /**
     * Scan multiple paths at once
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    void ScanMultiplePaths(const TArray<FString>& SearchPaths, bool bRecursive = true);
    
    /**
     * Categorize a single asset based on its name and tags
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    EAssetCategory CategorizeAsset(const FString& AssetName, const FString& AssetPath);
    
    /**
     * Extract tags from asset metadata
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    TArray<FString> ExtractAssetTags(const FString& AssetPath);
    
    /**
     * Calculate complexity rating for an asset
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    float CalculateComplexity(const FString& AssetPath);
    
    /**
     * Get the current scanned asset library
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    UScannedAssetLibrary* GetAssetLibrary() const { return ScannedAssetLibrary; }
    
    /**
     * Save the scanned asset library to disk
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    bool SaveAssetLibrary(const FString& SavePath);
    
    /**
     * Load a previously saved asset library
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Scanning")
    bool LoadAssetLibrary(const FString& LoadPath);
    
private:
    /** The accumulated library of scanned assets */
    UPROPERTY()
    UScannedAssetLibrary* ScannedAssetLibrary;
    
    /** Asset manager reference */
    TSharedPtr<FAssetManager> AssetManager;
    
    /** Internal scan implementation */
    void ScanDirectory(const FString& Path, bool bRecursive);
    
    /** Process a single found asset */
    void ProcessFoundAsset(const FString& AssetPath);
    
    /** Validate that an asset can be loaded */
    bool ValidateAsset(const FString& AssetPath);
};
