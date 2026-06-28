// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "ETileType.generated.h"

/**
 * Enum defining the different types of tiles in the endless runner
 */
UENUM(BlueprintType)
enum class ETileType : uint8
{
    Start           UMETA(DisplayName = "Start Tile"),
    Straight        UMETA(DisplayName = "Straight Segment"),
    CurveLeft       UMETA(DisplayName = "Curve Left"),
    CurveRight      UMETA(DisplayName = "Curve Right"),
    Jump            UMETA(DisplayName = "Jump Platform"),
    Obstacle        UMETA(DisplayName = "Obstacle Course"),
    Bridge          UMETA(DisplayName = "Bridge"),
    Tunnel          UMETA(DisplayName = "Tunnel"),
    End             UMETA(DisplayName = "End Tile"),
    
    // Difficulty modifiers
    Easy            UMETA(DisplayName = "Easy Difficulty"),
    Medium          UMETA(DisplayName = "Medium Difficulty"),
    Hard            UMETA(DisplayName = "Hard Difficulty"),
    
    COUNT           UMETA(Hidden)
};

/**
 * Enum for asset categories used in scanning and organization
 */
UENUM(BlueprintType)
enum class EAssetCategory : uint8
{
    Platform        UMETA(DisplayName = "Platform/Path"),
    Obstacle        UMETA(DisplayName = "Obstacle"),
    Decoration      UMETA(DisplayName = "Decoration/Prop"),
    Collectible     UMETA(DisplayName = "Collectible (Coins, Power-ups)"),
    Hazard          UMETA(DisplayName = "Hazard (Spikes, Pits)"),
    Environment     UMETA(DisplayName = "Environment (Trees, Rocks)"),
    Architecture    UMETA(DisplayName = "Architecture (Buildings, Walls)"),
    Particle        UMETA(DisplayName = "Particle Effects"),
    Sound           UMETA(DisplayName = "Sound Cues"),
    
    COUNT           UMETA(Hidden)
};

/**
 * Struct representing metadata for a scanned asset
 */
USTRUCT(BlueprintType)
struct FAssetMetadata
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    FString AssetName;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    FString AssetPath;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    EAssetCategory Category;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    TArray<FString> Tags;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    float ComplexityRating;  // 0.0 to 1.0, how complex/difficult this asset is
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Asset")
    bool bIsValidated;
    
    FAssetMetadata()
        : ComplexityRating(0.5f)
        , bIsValidated(false)
    {}
};
