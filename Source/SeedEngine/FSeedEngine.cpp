// Copyright Epic Games, Inc. All Rights Reserved.

#include "FSeedEngine.h"

USeedEngine::USeedEngine()
    : CurrentSeed(0)
    , InitialSeed(0)
{
}

void USeedEngine::Initialize(int32 InitialSeed)
{
    this->InitialSeed = InitialSeed;
    this->CurrentSeed = InitialSeed;
    UE_LOG(LogTemp, Log, TEXT("SeedEngine: Initialized with seed %d"), InitialSeed);
}

int32 USeedEngine::NextRandom()
{
    // Linear Congruential Generator
    CurrentSeed = (LCG_A * CurrentSeed + LCG_C) % LCG_M;
    return CurrentSeed;
}

int32 USeedEngine::RandRange(int32 Min, int32 Max)
{
    if (Min > Max)
    {
        FMath::Swap(Min, Max);
    }
    
    if (Min == Max)
    {
        return Min;
    }
    
    int32 RandomValue = NextRandom();
    int32 Range = Max - Min + 1;
    return Min + (FMath::Abs(RandomValue) % Range);
}

float USeedEngine::RandRangeFloat(float Min, float Max)
{
    if (Min > Max)
    {
        FMath::Swap(Min, Max);
    }
    
    if (FMath::IsNearlyEqual(Min, Max))
    {
        return Min;
    }
    
    int32 RandomValue = NextRandom();
    float Normalized = (float)FMath::Abs(RandomValue) / (float)LCG_M;
    return Min + Normalized * (Max - Min);
}

int32 USeedEngine::RandIndex(const TArray<int32>& Array)
{
    if (Array.Num() == 0)
    {
        return INDEX_NONE;
    }
    
    int32 Index = RandRange(0, Array.Num() - 1);
    return Index;
}

TArray<int32> USeedEngine::ShuffleArray(const TArray<int32>& Array)
{
    TArray<int32> Result = Array;
    
    // Fisher-Yates shuffle using our deterministic RNG
    for (int32 i = Result.Num() - 1; i > 0; --i)
    {
        int32 j = RandRange(0, i);
        FMath::Swap(Result[i], Result[j]);
    }
    
    return Result;
}

int32 USeedEngine::WeightedRandom(const TArray<float>& Weights)
{
    if (Weights.Num() == 0)
    {
        return INDEX_NONE;
    }
    
    // Calculate total weight
    float TotalWeight = 0.0f;
    for (float Weight : Weights)
    {
        TotalWeight += FMath::Max(0.0f, Weight);
    }
    
    if (TotalWeight <= 0.0f)
    {
        return RandRange(0, Weights.Num() - 1);
    }
    
    // Pick a random point in the weight distribution
    float RandomPoint = RandRangeFloat(0.0f, TotalWeight);
    float CumulativeWeight = 0.0f;
    
    for (int32 i = 0; i < Weights.Num(); ++i)
    {
        CumulativeWeight += FMath::Max(0.0f, Weights[i]);
        if (RandomPoint <= CumulativeWeight)
        {
            return i;
        }
    }
    
    return Weights.Num() - 1;
}

int32 USeedEngine::StringToSeed(const FString& SeedString)
{
    if (SeedString.IsEmpty())
    {
        return 0;
    }
    
    // Hash the string to create a seed
    uint32 Hash = 0;
    for (TCHAR Char : SeedString)
    {
        Hash = Hash * 31 + (uint32)Char;
    }
    
    return (int32)(Hash & 0x7FFFFFFF); // Ensure positive
}

FString USeedEngine::SeedToString(int32 Seed)
{
    return FString::FromInt(Seed);
}

void USeedEngine::Advance()
{
    NextRandom();
}

void USeedEngine::Reset()
{
    CurrentSeed = InitialSeed;
    UE_LOG(LogTemp, Log, TEXT("SeedEngine: Reset to initial seed %d"), InitialSeed);
}
