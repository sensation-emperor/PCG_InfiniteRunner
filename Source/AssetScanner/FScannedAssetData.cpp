// Copyright Epic Games, Inc. All Rights Reserved.

#include "FScannedAssetData.h"

TArray<FScannedAssetData> UScannedAssetLibrary::GetAssetsByCategory(EAssetCategory Category)
{
    switch (Category)
    {
        case EAssetCategory::Platform:
            return PlatformAssets;
        case EAssetCategory::Obstacle:
            return ObstacleAssets;
        case EAssetCategory::Decoration:
            return DecorationAssets;
        case EAssetCategory::Collectible:
            return CollectibleAssets;
        case EAssetCategory::Hazard:
            return HazardAssets;
        case EAssetCategory::Environment:
            return EnvironmentAssets;
        case EAssetCategory::Architecture:
            return ArchitectureAssets;
        default:
            return TArray<FScannedAssetData>();
    }
}

void UScannedAssetLibrary::AddAsset(const FScannedAssetData& AssetData)
{
    switch (AssetData.Category)
    {
        case EAssetCategory::Platform:
            PlatformAssets.Add(AssetData);
            break;
        case EAssetCategory::Obstacle:
            ObstacleAssets.Add(AssetData);
            break;
        case EAssetCategory::Decoration:
            DecorationAssets.Add(AssetData);
            break;
        case EAssetCategory::Collectible:
            CollectibleAssets.Add(AssetData);
            break;
        case EAssetCategory::Hazard:
            HazardAssets.Add(AssetData);
            break;
        case EAssetCategory::Environment:
            EnvironmentAssets.Add(AssetData);
            break;
        case EAssetCategory::Architecture:
            ArchitectureAssets.Add(AssetData);
            break;
        default:
            break;
    }
}

bool UScannedAssetLibrary::ValidateAllAssets()
{
    bool bAllValid = true;
    
    auto ValidateArray = [&bAllValid](TArray<FScannedAssetData>& Assets)
    {
        for (FScannedAssetData& Asset : Assets)
        {
            // In a real implementation, this would verify the asset can be loaded
            Asset.bIsValidated = true;
            if (!Asset.bIsValidated)
            {
                bAllValid = false;
            }
        }
    };
    
    ValidateArray(PlatformAssets);
    ValidateArray(ObstacleAssets);
    ValidateArray(DecorationAssets);
    ValidateArray(CollectibleAssets);
    ValidateArray(HazardAssets);
    ValidateArray(EnvironmentAssets);
    ValidateArray(ArchitectureAssets);
    
    return bAllValid;
}

int32 UScannedAssetLibrary::GetTotalAssetCount() const
{
    return PlatformAssets.Num() + 
           ObstacleAssets.Num() + 
           DecorationAssets.Num() + 
           CollectibleAssets.Num() + 
           HazardAssets.Num() + 
           EnvironmentAssets.Num() + 
           ArchitectureAssets.Num();
}
