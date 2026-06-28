// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "TileTypes.h"
#include "FDifficultyDirector.generated.h"

/**
 * Delegate for difficulty change events
 */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnDifficultyChanged, float, NewDifficulty, FString, Reason);

/**
 * Difficulty settings for the endless runner
 */
USTRUCT(BlueprintType)
struct FDifficultySettings
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    FString DifficultyName;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    float TargetDifficulty;  // 0.0 to 1.0
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    float ObstacleFrequency;  // How often obstacles appear
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    float ObstacleComplexity;  // How complex the obstacles are
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    float SpeedMultiplier;  // Player speed modifier
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Difficulty")
    float CollectibleDensity;  // How many collectibles appear
    
    FDifficultySettings()
        : TargetDifficulty(0.5f)
        , ObstacleFrequency(0.5f)
        , ObstacleComplexity(0.5f)
        , SpeedMultiplier(1.0f)
        , CollectibleDensity(0.5f)
    {}
};

/**
 * Director that manages dynamic difficulty adjustment based on player performance
 */
UCLASS(Blueprintable)
class UDifficultyDirector : public UObject
{
    GENERATED_BODY()
    
public:
    UDifficultyDirector();
    
    /** Event triggered when difficulty changes */
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnDifficultyChanged OnDifficultyChanged;
    
    /**
     * Initialize the difficulty director with settings
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    void Initialize(const TArray<FDifficultySettings>& Settings);
    
    /**
     * Update difficulty based on player performance
     * @param PlayerScore - Current player score
     * @param DistanceTraveled - Distance traveled in current run
     * @param DeathsInSession - Number of deaths in current session
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    void UpdateDifficulty(int32 PlayerScore, float DistanceTraveled, int32 DeathsInSession);
    
    /**
     * Get the current difficulty level (0.0 to 1.0)
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    float GetCurrentDifficulty() const { return CurrentDifficulty; }
    
    /**
     * Get the current difficulty settings
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    FDifficultySettings GetCurrentSettings() const { return CurrentSettings; }
    
    /**
     * Set a specific difficulty level manually
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    void SetDifficulty(float NewDifficulty, const FString& Reason);
    
    /**
     * Get recommended tile difficulty for next segment
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    float GetRecommendedTileDifficulty() const;
    
    /**
     * Get recommended obstacle frequency
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    float GetObstacleFrequency() const { return CurrentSettings.ObstacleFrequency; }
    
    /**
     * Reset difficulty to default
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    void ResetDifficulty();
    
    /**
     * Analyze player performance and suggest difficulty adjustment
     */
    UFUNCTION(BlueprintCallable, Category = "Difficulty")
    float AnalyzePerformance(int32 Score, float Distance, int32 Deaths);
    
private:
    /** All difficulty presets */
    UPROPERTY()
    TArray<FDifficultySettings> DifficultyPresets;
    
    /** Current active difficulty settings */
    UPROPERTY()
    FDifficultySettings CurrentSettings;
    
    /** Current difficulty value (0.0 to 1.0) */
    float CurrentDifficulty;
    
    /** Base difficulty before adjustments */
    float BaseDifficulty;
    
    /** Performance smoothing factor */
    float PerformanceSmoothing;
    
    /** Minimum distance before difficulty can increase */
    float MinDistanceForIncrease;
    
    /** Calculate target difficulty from presets */
    FDifficultySettings CalculateTargetSettings(float TargetDifficulty);
    
    /** Smoothly interpolate between difficulty values */
    void SmoothDifficulty(float TargetValue);
};
