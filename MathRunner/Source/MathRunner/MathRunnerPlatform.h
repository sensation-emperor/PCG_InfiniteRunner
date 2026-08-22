// Copyright MathRunner. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Math/Vector.h"
#include "Math/RandomStream.h"
#include "ProceduralMeshComponent.h"
#include "MathRunnerPlatform.generated.h"

/**
 * A procedurally generated platform using mathematical functions
 * No external assets - all geometry generated via math
 */
UCLASS()
class MATHRUNNER_API AMathRunnerPlatform : public AActor
{
	GENERATED_BODY()
	
public:	
	// Sets default values for this actor's properties
	AMathRunnerPlatform();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

public:	
	// Called every frame
	virtual void Tick(float DeltaTime) override;

	// Generate platform geometry using mathematical functions
	UFUNCTION(BlueprintCallable, Category = "Procedural Generation")
	void GeneratePlatform(float InLength, float InWidth, int32 Complexity, float Seed);

	// Get the end location for spawning next platform
	UFUNCTION(BlueprintPure, Category = "Procedural Generation")
	FVector GetSpawnLocation() const;

	// Platform type enumeration
	UENUM(BlueprintType)
	enum class EPlatformType : uint8
	{
		Flat			UMETA(DisplayName = "Flat"),
		Wave			UMETA(DisplayName = "Wave"),
		Noise			UMETA(DisplayName = "Noise"),
		Spiral			UMETA(DisplayName = "Spiral"),
		Fractal			UMETA(DisplayName = "Fractal")
	};

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	EPlatformType PlatformType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	float PlatformLength;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	float PlatformWidth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	int32 VertexDensity;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	float WaveAmplitude;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	float WaveFrequency;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
	float NoiseScale;

private:
	// Procedural mesh component
	UPROPERTY(VisibleAnywhere, Category = "Components")
	class UProceduralMeshComponent* MeshComponent;

	// Random stream for deterministic generation
	FRandomStream RandomStream;

	// Generate flat platform vertices
	void GenerateFlatPlatform();

	// Generate wave-based platform using sine/cosine
	void GenerateWavePlatform();

	// Generate noise-based platform using Perlin-like noise
	void GenerateNoisePlatform();

	// Generate spiral platform
	void GenerateSpiralPlatform();

	// Generate fractal platform
	void GenerateFractalPlatform();

	// Simplex noise implementation (math-only, no external dependencies)
	float SimplexNoise(float X, float Y, float Z) const;

	// Calculate height based on platform type
	float CalculateHeight(float X, float Y, float Z) const;
};
