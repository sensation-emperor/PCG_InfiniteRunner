// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "TileTypes.h"
#include "Engine/DataAsset.h"
#include "UObject/SoftObjectPtr.h"
#include "FScannedAssetData.generated.h"

/**
 * Struct representing a scanned asset with its metadata
 */
USTRUCT(BlueprintType)
struct FScannedAssetData
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    TSoftObjectPtr<UObject> AssetReference;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    FString AssetName;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    FString PackagePath;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    EAssetCategory Category;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    TArray<FString> Tags;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    float ComplexityRating;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    bool bIsValidated;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    FDateTime ScanDate;
    
    FScannedAssetData()
        : ComplexityRating(0.5f)
        , bIsValidated(false)
    {}
};

/**
 * Data Asset containing a collection of scanned assets organized by category
 */
UCLASS(BlueprintType)
class UScannedAssetLibrary : public UPrimaryDataAsset
{
    GENERATED_BODY()
    
public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> PlatformAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> ObstacleAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> DecorationAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> CollectibleAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> HazardAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> EnvironmentAssets;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Assets")
    TArray<FScannedAssetData> ArchitectureAssets;
    
    /**
     * Get all assets for a specific category
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Library")
    TArray<FScannedAssetData> GetAssetsByCategory(EAssetCategory Category);
    
    /**
     * Add a scanned asset to the library
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Library")
    void AddAsset(const FScannedAssetData& AssetData);
    
    /**
     * Validate all assets in the library
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Library")
    bool ValidateAllAssets();
    
    /**
     * Get total count of assets
     */
    UFUNCTION(BlueprintCallable, Category = "Asset Library")
    int32 GetTotalAssetCount() const;
};
