// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "TileTypes.h"
#include "Engine/DataAsset.h"
#include "UObject/SoftObjectPtr.h"
#include "FTileDefinition.generated.h"

/**
 * Struct defining a single tile in the library
 */
USTRUCT(BlueprintType)
struct FTileDefinition
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    FString TileName;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    TSoftObjectPtr<UStaticMesh> TileMesh;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    ETileType TileType;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    float Length;  // Length of the tile in Unreal units
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    float DifficultyRating;  // 0.0 to 1.0
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    TArray<FString> CompatibleNextTiles;  // Tile names that can follow this one
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    TArray<FString> Tags;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tile")
    bool bIsEnabled;
    
    FTileDefinition()
        : Length(1000.0f)
        , DifficultyRating(0.5f)
        , bIsEnabled(true)
    {}
};

/**
 * Data Asset containing a library of tiles for level generation
 */
UCLASS(BlueprintType)
class UTileLibrary : public UPrimaryDataAsset
{
    GENERATED_BODY()
    
public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tiles")
    TArray<FTileDefinition> TileDefinitions;
    
    /**
     * Get all tiles of a specific type
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    TArray<FTileDefinition> GetTilesByType(ETileType Type);
    
    /**
     * Get a random tile of a specific type
     * @param Seed - Random seed for deterministic selection
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    FTileDefinition GetRandomTileByType(ETileType Type, int32 Seed);
    
    /**
     * Get tiles compatible with a given tile
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    TArray<FTileDefinition> GetCompatibleTiles(const FString& CurrentTileName);
    
    /**
     * Add a new tile definition to the library
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    void AddTile(const FTileDefinition& TileDef);
    
    /**
     * Validate all tile references
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    bool ValidateAllTiles();
    
    /**
     * Get total count of enabled tiles
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    int32 GetEnabledTileCount() const;
    
    /**
     * Calculate average difficulty of tiles
     */
    UFUNCTION(BlueprintCallable, Category = "Tile Library")
    float GetAverageDifficulty() const;
};
