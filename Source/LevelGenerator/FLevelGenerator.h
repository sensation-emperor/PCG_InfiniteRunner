// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "TileTypes.h"
#include "FTileDefinition.h"
#include "FSeedEngine.h"
#include "FDifficultyDirector.h"
#include "FLevelGenerator.generated.h"

/**
 * Struct representing a placed tile in the generated level
 */
USTRUCT(BlueprintType)
struct FPlacedTile
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    FTileDefinition TileDefinition;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    FVector Location;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    FRotator Rotation;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    int32 TileIndex;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    float CumulativeDistance;
    
    FPlacedTile()
        : Location(FVector::ZeroVector)
        , Rotation(FRotator::ZeroRotator)
        , TileIndex(0)
        , CumulativeDistance(0.0f)
    {}
};

/**
 * Delegate for generation events
 */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnGenerationComplete, bool, bSuccess, int32, TilesGenerated);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTileGenerated, FPlacedTile, PlacedTile);

/**
 * Generation parameters for controlling level creation
 */
USTRUCT(BlueprintType)
struct FGenerationParameters
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    int32 Seed;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    int32 MinTiles;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    int32 MaxTiles;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    float InitialDifficulty;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    bool bEnableDynamicDifficulty;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Generation")
    bool bEnsurePlayability;
    
    FGenerationParameters()
        : Seed(12345)
        , MinTiles(50)
        , MaxTiles(200)
        , InitialDifficulty(0.5f)
        , bEnableDynamicDifficulty(true)
        , bEnsurePlayability(true)
    {}
};

/**
 * Main level generator that orchestrates endless runner level creation
 */
UCLASS(Blueprintable)
class ULevelGenerator : public UObject
{
    GENERATED_BODY()
    
public:
    ULevelGenerator();
    
    /** Event triggered when generation completes */
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnGenerationComplete OnGenerationComplete;
    
    /** Event triggered when each tile is generated */
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnTileGenerated OnTileGenerated;
    
    /**
     * Initialize the generator with required components
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    void Initialize(USeedEngine* InSeedEngine, UTileLibrary* InTileLibrary, UDifficultyDirector* InDifficultyDirector);
    
    /**
     * Generate a complete level with the given parameters
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    void GenerateLevel(const FGenerationParameters& Parameters);
    
    /**
     * Generate the next tile in an ongoing generation
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    FPlacedTile GenerateNextTile();
    
    /**
     * Get all generated tiles
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    TArray<FPlacedTile> GetGeneratedTiles() const { return GeneratedTiles; }
    
    /**
     * Clear all generated tiles
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    void ClearGeneratedTiles();
    
    /**
     * Validate that the generated level is playable
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    bool ValidateLevelPlayability();
    
    /**
     * Get the current generation progress (0.0 to 1.0)
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    float GetGenerationProgress() const;
    
    /**
     * Get total length of generated level
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    float GetTotalLevelLength() const;
    
    /**
     * Reset the generator state
     */
    UFUNCTION(BlueprintCallable, Category = "Generation")
    void Reset();
    
private:
    /** Reference to seed engine */
    UPROPERTY()
    USeedEngine* SeedEngine;
    
    /** Reference to tile library */
    UPROPERTY()
    UTileLibrary* TileLibrary;
    
    /** Reference to difficulty director */
    UPROPERTY()
    UDifficultyDirector* DifficultyDirector;
    
    /** Currently generated tiles */
    UPROPERTY()
    TArray<FPlacedTile> GeneratedTiles;
    
    /** Current generation parameters */
    UPROPERTY()
    FGenerationParameters CurrentParameters;
    
    /** Current tile index */
    int32 CurrentTileIndex;
    
    /** Current position in level */
    FVector CurrentPosition;
    
    /** Current rotation */
    FRotator CurrentRotation;
    
    /** Whether generation is in progress */
    bool bIsGenerating;
    
    /** Select appropriate tile type based on context */
    ETileType SelectTileType(int32 TileIndex, int32 TotalTiles);
    
    /** Place a tile at the current position */
    FPlacedTile PlaceTile(const FTileDefinition& TileDef);
    
    /** Update position and rotation for next tile */
    void AdvancePosition(const FTileDefinition& TileDef);
    
    /** Apply difficulty settings to tile selection */
    FTileDefinition SelectTileWithDifficulty(ETileType Type);
};
