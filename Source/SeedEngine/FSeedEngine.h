// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "FSeedEngine.generated.h"

/**
 * Seed-based pseudo-random number generator for deterministic level generation
 */
UCLASS(Blueprintable)
class USeedEngine : public UObject
{
    GENERATED_BODY()
    
public:
    USeedEngine();
    
    /**
     * Initialize the engine with a seed value
     * @param InitialSeed - The seed value for deterministic generation
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    void Initialize(int32 InitialSeed);
    
    /**
     * Get the current seed value
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    int32 GetCurrentSeed() const { return CurrentSeed; }
    
    /**
     * Generate a random integer between Min and Max (inclusive)
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    int32 RandRange(int32 Min, int32 Max);
    
    /**
     * Generate a random float between Min and Max
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    float RandRangeFloat(float Min, float Max);
    
    /**
     * Pick a random element from an array using the seed
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine", meta = (AutoCreateRefTerm = "Array"))
    int32 RandIndex(const TArray<int32>& Array);
    
    /**
     * Shuffle an array deterministically based on seed
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine", meta = (AutoCreateRefTerm = "Array"))
    TArray<int32> ShuffleArray(const TArray<int32>& Array);
    
    /**
     * Generate a weighted random selection
     * @param Weights - Array of weights corresponding to indices
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    int32 WeightedRandom(const TArray<float>& Weights);
    
    /**
     * Create a new seed from string (e.g., level code)
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    int32 StringToSeed(const FString& SeedString);
    
    /**
     * Convert seed to string representation
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    FString SeedToString(int32 Seed);
    
    /**
     * Advance the internal state without returning a value
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    void Advance();
    
    /**
     * Reset to initial seed
     */
    UFUNCTION(BlueprintCallable, Category = "Seed Engine")
    void Reset();
    
private:
    /** Current seed state */
    int32 CurrentSeed;
    
    /** Original seed for reset */
    int32 InitialSeed;
    
    /** Internal PRNG implementation (Linear Congruential Generator) */
    int32 NextRandom();
    
    // LCG parameters (same as glibc)
    static constexpr int32 LCG_A = 1103515245;
    static constexpr int32 LCG_C = 12345;
    static constexpr int32 LCG_M = 2147483648; // 2^31
};
