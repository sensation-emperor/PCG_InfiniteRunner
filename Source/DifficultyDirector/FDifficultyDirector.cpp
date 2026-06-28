// Copyright Epic Games, Inc. All Rights Reserved.

#include "FDifficultyDirector.h"

UDifficultyDirector::UDifficultyDirector()
    : CurrentDifficulty(0.5f)
    , BaseDifficulty(0.5f)
    , PerformanceSmoothing(0.1f)
    , MinDistanceForIncrease(5000.0f)
{
}

void UDifficultyDirector::Initialize(const TArray<FDifficultySettings>& Settings)
{
    DifficultyPresets = Settings;
    
    if (DifficultyPresets.Num() > 0)
    {
        CurrentSettings = DifficultyPresets[0];
        CurrentDifficulty = CurrentSettings.TargetDifficulty;
    }
    
    UE_LOG(LogTemp, Log, TEXT("DifficultyDirector: Initialized with %d presets"), DifficultyPresets.Num());
}

void UDifficultyDirector::UpdateDifficulty(int32 PlayerScore, float DistanceTraveled, int32 DeathsInSession)
{
    // Analyze performance
    float PerformanceScore = AnalyzePerformance(PlayerScore, DistanceTraveled, DeathsInSession);
    
    // Adjust difficulty based on performance
    float TargetDifficulty = CurrentDifficulty;
    
    // If player is doing well (high score, low deaths), increase difficulty
    if (PerformanceScore > 0.7f && DeathsInSession < 2)
    {
        TargetDifficulty = FMath::Clamp(CurrentDifficulty + 0.05f, 0.0f, 1.0f);
        SetDifficulty(TargetDifficulty, TEXT("Player performing well"));
    }
    // If player is struggling (many deaths), decrease difficulty
    else if (DeathsInSession >= 3 || PerformanceScore < 0.3f)
    {
        TargetDifficulty = FMath::Clamp(CurrentDifficulty - 0.1f, 0.0f, 1.0f);
        SetDifficulty(TargetDifficulty, TEXT("Player struggling"));
    }
    // Gradual increase over distance
    else if (DistanceTraveled > MinDistanceForIncrease)
    {
        float DistanceBonus = FMath::Min(DistanceTraveled / 10000.0f, 0.3f);
        TargetDifficulty = FMath::Clamp(BaseDifficulty + DistanceBonus, 0.0f, 1.0f);
        SmoothDifficulty(TargetDifficulty);
    }
}

float UDifficultyDirector::AnalyzePerformance(int32 Score, float Distance, int32 Deaths)
{
    // Normalize score (assuming max reasonable score is 10000)
    float NormalizedScore = FMath::Clamp((float)Score / 10000.0f, 0.0f, 1.0f);
    
    // Normalize distance (assuming max reasonable distance is 10000 units)
    float NormalizedDistance = FMath::Clamp(Distance / 10000.0f, 0.0f, 1.0f);
    
    // Death penalty
    float DeathPenalty = FMath::Clamp((float)Deaths / 5.0f, 0.0f, 1.0f);
    
    // Weighted combination
    float Performance = (NormalizedScore * 0.4f) + 
                        (NormalizedDistance * 0.4f) + 
                        ((1.0f - DeathPenalty) * 0.2f);
    
    return Performance;
}

void UDifficultyDirector::SetDifficulty(float NewDifficulty, const FString& Reason)
{
    float OldDifficulty = CurrentDifficulty;
    CurrentDifficulty = FMath::Clamp(NewDifficulty, 0.0f, 1.0f);
    
    // Update settings based on new difficulty
    CurrentSettings = CalculateTargetSettings(CurrentDifficulty);
    
    UE_LOG(LogTemp, Log, TEXT("DifficultyDirector: Changed from %.2f to %.2f - %s"), 
           OldDifficulty, CurrentDifficulty, *Reason);
    
    OnDifficultyChanged.Broadcast(CurrentDifficulty, Reason);
}

float UDifficultyDirector::GetRecommendedTileDifficulty() const
{
    // Return a difficulty value that can be used to select appropriate tiles
    return CurrentSettings.ObstacleComplexity;
}

void UDifficultyDirector::ResetDifficulty()
{
    CurrentDifficulty = BaseDifficulty;
    CurrentSettings = CalculateTargetSettings(BaseDifficulty);
    
    UE_LOG(LogTemp, Log, TEXT("DifficultyDirector: Reset to base difficulty %.2f"), BaseDifficulty);
}

FDifficultySettings UDifficultyDirector::CalculateTargetSettings(float TargetDifficulty)
{
    FDifficultySettings Result;
    
    // If we have presets, interpolate between them
    if (DifficultyPresets.Num() >= 2)
    {
        // Find the two presets that bracket our target difficulty
        const FDifficultySettings* LowPreset = &DifficultyPresets[0];
        const FDifficultySettings* HighPreset = &DifficultyPresets[DifficultyPresets.Num() - 1];
        
        for (int32 i = 0; i < DifficultyPresets.Num() - 1; ++i)
        {
            if (DifficultyPresets[i].TargetDifficulty <= TargetDifficulty &&
                DifficultyPresets[i + 1].TargetDifficulty >= TargetDifficulty)
            {
                LowPreset = &DifficultyPresets[i];
                HighPreset = &DifficultyPresets[i + 1];
                break;
            }
        }
        
        // Calculate interpolation factor
        float Range = HighPreset->TargetDifficulty - LowPreset->TargetDifficulty;
        float Alpha = Range > 0.0f ? (TargetDifficulty - LowPreset->TargetDifficulty) / Range : 0.0f;
        
        // Interpolate all properties
        Result.DifficultyName = FString::Printf(TEXT("Dynamic %.2f"), TargetDifficulty);
        Result.TargetDifficulty = TargetDifficulty;
        Result.ObstacleFrequency = FMath::Lerp(LowPreset->ObstacleFrequency, HighPreset->ObstacleFrequency, Alpha);
        Result.ObstacleComplexity = FMath::Lerp(LowPreset->ObstacleComplexity, HighPreset->ObstacleComplexity, Alpha);
        Result.SpeedMultiplier = FMath::Lerp(LowPreset->SpeedMultiplier, HighPreset->SpeedMultiplier, Alpha);
        Result.CollectibleDensity = FMath::Lerp(LowPreset->CollectibleDensity, HighPreset->CollectibleDensity, Alpha);
    }
    else
    {
        // Default scaling based on difficulty
        Result.DifficultyName = FString::Printf(TEXT("Dynamic %.2f"), TargetDifficulty);
        Result.TargetDifficulty = TargetDifficulty;
        Result.ObstacleFrequency = TargetDifficulty;
        Result.ObstacleComplexity = TargetDifficulty;
        Result.SpeedMultiplier = 1.0f + (TargetDifficulty * 0.5f);  // Up to 1.5x speed
        Result.CollectibleDensity = 1.0f - (TargetDifficulty * 0.3f);  // Fewer collectibles at high difficulty
    }
    
    return Result;
}

void UDifficultyDirector::SmoothDifficulty(float TargetValue)
{
    // Smoothly interpolate current difficulty toward target
    CurrentDifficulty = FMath::FInterpTo(CurrentDifficulty, TargetValue, 
                                          GetWorld()->GetDeltaSeconds(), PerformanceSmoothing);
    
    // Update settings
    CurrentSettings = CalculateTargetSettings(CurrentDifficulty);
}
