// Copyright Epic Games, Inc. All Rights Reserved.

#include "FLevelGenerator.h"

ULevelGenerator::ULevelGenerator()
    : SeedEngine(nullptr)
    , TileLibrary(nullptr)
    , DifficultyDirector(nullptr)
    , CurrentTileIndex(0)
    , CurrentPosition(FVector::ZeroVector)
    , CurrentRotation(FRotator::ZeroRotator)
    , bIsGenerating(false)
{
}

void ULevelGenerator::Initialize(USeedEngine* InSeedEngine, UTileLibrary* InTileLibrary, UDifficultyDirector* InDifficultyDirector)
{
    SeedEngine = InSeedEngine;
    TileLibrary = InTileLibrary;
    DifficultyDirector = InDifficultyDirector;
    
    UE_LOG(LogTemp, Log, TEXT("LevelGenerator: Initialized with components"));
}

void ULevelGenerator::GenerateLevel(const FGenerationParameters& Parameters)
{
    if (!SeedEngine || !TileLibrary)
    {
        UE_LOG(LogTemp, Error, TEXT("LevelGenerator: Missing required components"));
        OnGenerationComplete.Broadcast(false, 0);
        return;
    }
    
    // Initialize seed engine
    SeedEngine->Initialize(Parameters.Seed);
    
    // Initialize difficulty director
    if (DifficultyDirector && Parameters.bEnableDynamicDifficulty)
    {
        DifficultyDirector->SetDifficulty(Parameters.InitialDifficulty, TEXT("Level generation start"));
    }
    
    CurrentParameters = Parameters;
    GeneratedTiles.Empty();
    CurrentTileIndex = 0;
    CurrentPosition = FVector::ZeroVector;
    CurrentRotation = FRotator::ZeroRotator;
    bIsGenerating = true;
    
    int32 TargetTileCount = SeedEngine->RandRange(Parameters.MinTiles, Parameters.MaxTiles);
    
    UE_LOG(LogTemp, Log, TEXT("LevelGenerator: Generating level with seed %d, %d tiles"), 
           Parameters.Seed, TargetTileCount);
    
    // Generate start tile
    ETileType StartType = ETileType::Start;
    FTileDefinition StartTile = SelectTileWithDifficulty(StartType);
    if (StartTile.TileName.IsEmpty())
    {
        // Fallback to straight if no start tile
        StartTile = SelectTileWithDifficulty(ETileType::Straight);
    }
    PlaceTile(StartTile);
    
    // Generate middle tiles
    while (CurrentTileIndex < TargetTileCount - 1)
    {
        FPlacedTile Placed = GenerateNextTile();
        OnTileGenerated.Broadcast(Placed);
    }
    
    // Generate end tile
    ETileType EndType = ETileType::End;
    FTileDefinition EndTile = SelectTileWithDifficulty(EndType);
    if (EndTile.TileName.IsEmpty())
    {
        EndTile = SelectTileWithDifficulty(ETileType::Straight);
    }
    PlaceTile(EndTile);
    
    bIsGenerating = false;
    
    // Validate playability if requested
    if (Parameters.bEnsurePlayability)
    {
        bool bPlayable = ValidateLevelPlayability();
        if (!bPlayable)
        {
            UE_LOG(LogTemp, Warning, TEXT("LevelGenerator: Generated level may have playability issues"));
        }
    }
    
    UE_LOG(LogTemp, Log, TEXT("LevelGenerator: Generation complete, %d tiles generated"), GeneratedTiles.Num());
    OnGenerationComplete.Broadcast(true, GeneratedTiles.Num());
}

FPlacedTile ULevelGenerator::GenerateNextTile()
{
    if (!bIsGenerating)
    {
        UE_LOG(LogTemp, Warning, TEXT("LevelGenerator: Not currently generating"));
        return FPlacedTile();
    }
    
    int32 TargetTileCount = SeedEngine->RandRange(CurrentParameters.MinTiles, CurrentParameters.MaxTiles);
    ETileType TileType = SelectTileType(CurrentTileIndex, TargetTileCount);
    
    FTileDefinition TileDef = SelectTileWithDifficulty(TileType);
    return PlaceTile(TileDef);
}

void ULevelGenerator::ClearGeneratedTiles()
{
    GeneratedTiles.Empty();
    CurrentTileIndex = 0;
    CurrentPosition = FVector::ZeroVector;
    CurrentRotation = FRotator::ZeroRotator;
    bIsGenerating = false;
}

bool ULevelGenerator::ValidateLevelPlayability()
{
    if (GeneratedTiles.Num() == 0)
    {
        return false;
    }
    
    // Check that we have a start tile
    if (GeneratedTiles[0].TileDefinition.TileType != ETileType::Start &&
        GeneratedTiles[0].TileDefinition.TileType != ETileType::Straight)
    {
        UE_LOG(LogTemp, Warning, TEXT("LevelGenerator: Level does not start with valid tile"));
        return false;
    }
    
    // Check for gaps or overlaps in tile placement
    float ExpectedDistance = 0.0f;
    for (int32 i = 0; i < GeneratedTiles.Num(); ++i)
    {
        const FPlacedTile& Tile = GeneratedTiles[i];
        
        // Verify cumulative distance matches expected
        if (!FMath::IsNearlyEqual(Tile.CumulativeDistance, ExpectedDistance, 1.0f))
        {
            UE_LOG(LogTemp, Warning, TEXT("LevelGenerator: Tile %d has unexpected gap/overlap"), i);
        }
        
        ExpectedDistance += Tile.TileDefinition.Length;
    }
    
    return true;
}

float ULevelGenerator::GetGenerationProgress() const
{
    int32 TargetTileCount = CurrentParameters.MaxTiles;
    if (TargetTileCount == 0)
    {
        return 0.0f;
    }
    
    return (float)GeneratedTiles.Num() / (float)TargetTileCount;
}

float ULevelGenerator::GetTotalLevelLength() const
{
    float TotalLength = 0.0f;
    for (const FPlacedTile& Tile : GeneratedTiles)
    {
        TotalLength += Tile.TileDefinition.Length;
    }
    return TotalLength;
}

void ULevelGenerator::Reset()
{
    ClearGeneratedTiles();
    CurrentParameters = FGenerationParameters();
    if (SeedEngine)
    {
        SeedEngine->Reset();
    }
    if (DifficultyDirector)
    {
        DifficultyDirector->ResetDifficulty();
    }
}

ETileType ULevelGenerator::SelectTileType(int32 TileIndex, int32 TotalTiles)
{
    // First tile should be start
    if (TileIndex == 0)
    {
        return ETileType::Start;
    }
    
    // Last tile should be end
    if (TileIndex >= TotalTiles - 1)
    {
        return ETileType::End;
    }
    
    // Use seed to select tile type
    int32 RandomValue = SeedEngine->RandRange(0, 100);
    
    // Distribution of tile types
    if (RandomValue < 50)
    {
        return ETileType::Straight;
    }
    else if (RandomValue < 65)
    {
        return SeedEngine->RandRange(0, 1) == 0 ? ETileType::CurveLeft : ETileType::CurveRight;
    }
    else if (RandomValue < 80)
    {
        return ETileType::Jump;
    }
    else if (RandomValue < 90)
    {
        return ETileType::Obstacle;
    }
    else if (RandomValue < 95)
    {
        return ETileType::Bridge;
    }
    else
    {
        return ETileType::Tunnel;
    }
}

FPlacedTile ULevelGenerator::PlaceTile(const FTileDefinition& TileDef)
{
    FPlacedTile PlacedTile;
    PlacedTile.TileDefinition = TileDef;
    PlacedTile.Location = CurrentPosition;
    PlacedTile.Rotation = CurrentRotation;
    PlacedTile.TileIndex = CurrentTileIndex;
    PlacedTile.CumulativeDistance = GetTotalLevelLength();
    
    GeneratedTiles.Add(PlacedTile);
    CurrentTileIndex++;
    
    AdvancePosition(TileDef);
    
    return PlacedTile;
}

void ULevelGenerator::AdvancePosition(const FTileDefinition& TileDef)
{
    // Move forward by tile length
    FVector ForwardDir = CurrentRotation.Vector();
    CurrentPosition += ForwardDir * TileDef.Length;
    
    // Handle rotation changes for curves
    switch (TileDef.TileType)
    {
        case ETileType::CurveLeft:
            CurrentRotation.Yaw -= 90.0f;
            break;
        case ETileType::CurveRight:
            CurrentRotation.Yaw += 90.0f;
            break;
        default:
            break;
    }
}

FTileDefinition ULevelGenerator::SelectTileWithDifficulty(ETileType Type)
{
    if (!TileLibrary)
    {
        return FTileDefinition();
    }
    
    // Get all tiles of the requested type
    TArray<FTileDefinition> AvailableTiles = TileLibrary->GetTilesByType(Type);
    
    if (AvailableTiles.Num() == 0)
    {
        // Fallback to straight tiles
        AvailableTiles = TileLibrary->GetTilesByType(ETileType::Straight);
    }
    
    if (AvailableTiles.Num() == 0)
    {
        return FTileDefinition();
    }
    
    // If difficulty director is available, filter by difficulty
    if (DifficultyDirector)
    {
        float TargetDifficulty = DifficultyDirector->GetRecommendedTileDifficulty();
        
        // Find tile closest to target difficulty
        FTileDefinition BestTile = AvailableTiles[0];
        float BestDiff = FMath::Abs(AvailableTiles[0].DifficultyRating - TargetDifficulty);
        
        for (const FTileDefinition& Tile : AvailableTiles)
        {
            float Diff = FMath::Abs(Tile.DifficultyRating - TargetDifficulty);
            if (Diff < BestDiff)
            {
                BestDiff = Diff;
                BestTile = Tile;
            }
        }
        
        return BestTile;
    }
    
    // Otherwise, use seed-based selection
    int32 Index = SeedEngine->RandRange(0, AvailableTiles.Num() - 1);
    return AvailableTiles[Index];
}
