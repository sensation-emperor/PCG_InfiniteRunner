// Copyright Epic Games, Inc. All Rights Reserved.

#include "FTileDefinition.h"
#include "Engine/StaticMesh.h"

TArray<FTileDefinition> UTileLibrary::GetTilesByType(ETileType Type)
{
    TArray<FTileDefinition> Result;
    
    for (const FTileDefinition& Tile : TileDefinitions)
    {
        if (Tile.TileType == Type && Tile.bIsEnabled)
        {
            Result.Add(Tile);
        }
    }
    
    return Result;
}

FTileDefinition UTileLibrary::GetRandomTileByType(ETileType Type, int32 Seed)
{
    TArray<FTileDefinition> FilteredTiles = GetTilesByType(Type);
    
    if (FilteredTiles.Num() == 0)
    {
        UE_LOG(LogTemp, Warning, TEXT("TileLibrary: No tiles found for type %d"), (uint8)Type);
        return FTileDefinition();
    }
    
    // Use seed for deterministic random selection
    int32 Index = FMath::Abs(Seed) % FilteredTiles.Num();
    return FilteredTiles[Index];
}

TArray<FTileDefinition> UTileLibrary::GetCompatibleTiles(const FString& CurrentTileName)
{
    TArray<FTileDefinition> Result;
    
    // Find the current tile
    const FTileDefinition* CurrentTile = nullptr;
    for (const FTileDefinition& Tile : TileDefinitions)
    {
        if (Tile.TileName == CurrentTileName)
        {
            CurrentTile = &Tile;
            break;
        }
    }
    
    if (!CurrentTile)
    {
        return Result;
    }
    
    // If no specific compatibility rules, return tiles of similar type
    if (CurrentTile->CompatibleNextTiles.Num() == 0)
    {
        return GetTilesByType(CurrentTile->TileType);
    }
    
    // Return tiles that are compatible
    for (const FTileDefinition& Tile : TileDefinitions)
    {
        if (Tile.bIsEnabled && CurrentTile->CompatibleNextTiles.Contains(Tile.TileName))
        {
            Result.Add(Tile);
        }
    }
    
    return Result;
}

void UTileLibrary::AddTile(const FTileDefinition& TileDef)
{
    TileDefinitions.Add(TileDef);
}

bool UTileLibrary::ValidateAllTiles()
{
    bool bAllValid = true;
    
    for (FTileDefinition& Tile : TileDefinitions)
    {
        // Check if mesh reference is valid
        if (!Tile.TileMesh.IsNull())
        {
            Tile.bIsEnabled = true;
        }
        else
        {
            UE_LOG(LogTemp, Warning, TEXT("TileLibrary: Tile '%s' has invalid mesh reference"), *Tile.TileName);
            Tile.bIsEnabled = false;
            bAllValid = false;
        }
        
        // Validate length
        if (Tile.Length <= 0.0f)
        {
            UE_LOG(LogTemp, Warning, TEXT("TileLibrary: Tile '%s' has invalid length"), *Tile.TileName);
            Tile.bIsEnabled = false;
            bAllValid = false;
        }
    }
    
    return bAllValid;
}

int32 UTileLibrary::GetEnabledTileCount() const
{
    int32 Count = 0;
    for (const FTileDefinition& Tile : TileDefinitions)
    {
        if (Tile.bIsEnabled)
        {
            Count++;
        }
    }
    return Count;
}

float UTileLibrary::GetAverageDifficulty() const
{
    if (TileDefinitions.Num() == 0)
    {
        return 0.0f;
    }
    
    float TotalDifficulty = 0.0f;
    int32 EnabledCount = 0;
    
    for (const FTileDefinition& Tile : TileDefinitions)
    {
        if (Tile.bIsEnabled)
        {
            TotalDifficulty += Tile.DifficultyRating;
            EnabledCount++;
        }
    }
    
    return EnabledCount > 0 ? TotalDifficulty / EnabledCount : 0.0f;
}
