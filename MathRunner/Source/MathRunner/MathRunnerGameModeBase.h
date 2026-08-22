// Copyright MathRunner. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MathRunnerGameModeBase.generated.h"

UCLASS()
class AMathRunnerGameModeBase : public AGameModeBase
{
	GENERATED_BODY()

public:
	AMathRunnerGameModeBase();

protected:
	virtual void BeginPlay() override;

public:
	virtual void Tick(float DeltaTime) override;

	// Spawn next platform using mathematical positioning
	UFUNCTION(BlueprintCallable, Category = "Level Generation")
	void SpawnNextPlatform();

	// Calculate platform position using parametric equations
	UFUNCTION(BlueprintPure, Category = "Level Generation")
	FVector CalculateNextPlatformLocation(AActor* LastPlatform) const;

	// Generate obstacle using mathematical shapes
	UFUNCTION(BlueprintCallable, Category = "Obstacles")
	AActor* SpawnMathematicalObstacle(FVector Location, FRotator Rotation);

	// Get difficulty multiplier based on distance traveled
	UFUNCTION(BlueprintPure, Category = "Difficulty")
	float GetDifficultyMultiplier() const;

	// Apply adaptive difficulty using statistical analysis
	UFUNCTION(BlueprintCallable, Category = "Difficulty")
	void UpdateDifficultyBasedOnPerformance();

protected:
	// Array of spawned platforms
	UPROPERTY()
	TArray<AActor*> SpawnedPlatforms;

	// Last spawned platform reference
	UPROPERTY()
	AActor* LastPlatform;

	// Distance traveled by player
	float DistanceTraveled;

	// Current difficulty level
	float CurrentDifficulty;

	// Platform spawn interval
 float SpawnInterval;

	// Mathematical seed for deterministic generation
	int32 GenerationSeed;

private:
	// Spawn initial platform sequence
	void SpawnInitialPlatforms();

	// Clean up old platforms for performance
	void CleanupOldPlatforms();

	// Calculate optimal platform gap using Fibonacci sequence
	float CalculatePlatformGap() const;

	// Generate obstacle type based on mathematical pattern
	int32 DetermineObstacleType() const;
};
