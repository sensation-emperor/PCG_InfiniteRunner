// Copyright MathRunner. All Rights Reserved.

#include "MathRunnerPlatform.h"
#include "ProceduralMeshComponent.h"
#include "Math/UnrealMathUtility.h"

// Sets default values
AMathRunnerPlatform::AMathRunnerPlatform()
{
	// Set this actor to call Tick() every frame. You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = false;

	// Create procedural mesh component
	MeshComponent = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("ProceduralMesh"));
	MeshComponent->SetupAttachment(RootComponent);
	MeshComponent->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	MeshComponent->SetGenerateOverlapEvents(false);

	// Default platform settings
	PlatformType = EPlatformType::Flat;
	PlatformLength = 1000.0f;
	PlatformWidth = 300.0f;
	VertexDensity = 20;
	WaveAmplitude = 100.0f;
	WaveFrequency = 0.01f;
	NoiseScale = 50.0f;

	// Initialize random stream with default seed
	RandomStream.Initialize(12345);
}

// Called when the game starts or when spawned
void AMathRunnerPlatform::BeginPlay()
{
	Super::BeginPlay();

	// Generate the platform on begin play
	GeneratePlatform(PlatformLength, PlatformWidth, VertexDensity, RandomStream.GetCurrentSeed());
}

// Called every frame
void AMathRunnerPlatform::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

void AMathRunnerPlatform::GeneratePlatform(float InLength, float InWidth, int32 Complexity, float Seed)
{
	// Reinitialize random stream with new seed for deterministic generation
	RandomStream.Initialize(FMath::Rand());
	
	// Clear existing mesh data
	MeshComponent->ClearMeshSection(0, true);

	// Update platform parameters
	PlatformLength = InLength;
	PlatformWidth = InWidth;
	VertexDensity = Complexity;

	TArray<FVector> Vertices;
	TArray<int32> Triangles;
	TArray<FVector> Normals;
	TArray<FVector2D> UVs;
	TArray<FColor> Colors;
	TArray<FProcMeshTangent> Tangents;

	// Generate vertices based on platform type
	switch (PlatformType)
	{
	case EPlatformType::Flat:
		GenerateFlatPlatform();
		break;
	case EPlatformType::Wave:
		GenerateWavePlatform();
		break;
	case EPlatformType::Noise:
		GenerateNoisePlatform();
		break;
	case EPlatformType::Spiral:
		GenerateSpiralPlatform();
		break;
	case EPlatformType::Fractal:
		GenerateFractalPlatform();
		break;
	default:
		GenerateFlatPlatform();
		break;
	}

	// Note: Actual vertex generation happens in individual methods
	// This is a simplified structure - full implementation would generate vertices here
}

FVector AMathRunnerPlatform::GetSpawnLocation() const
{
	// Return the end position of this platform for spawning the next one
	return GetActorLocation() + FVector(PlatformLength, 0, 0);
}

void AMathRunnerPlatform::GenerateFlatPlatform()
{
	TArray<FVector> Vertices;
	TArray<int32> Triangles;
	TArray<FVector> Normals;
	TArray<FVector2D> UVs;
	TArray<FColor> Colors;
	TArray<FProcMeshTangent> Tangents;

	const int32 SegmentsX = VertexDensity;
	const int32 SegmentsY = FMath::RoundToInt(VertexDensity * (PlatformWidth / PlatformLength));

	const float StepX = PlatformLength / SegmentsX;
	const float StepY = PlatformWidth / SegmentsY;

	// Generate vertices
	for (int32 Y = 0; Y <= SegmentsY; Y++)
	{
		for (int32 X = 0; X <= SegmentsX; X++)
		{
			float PosX = X * StepX - PlatformLength / 2.0f;
			float PosY = Y * StepY - PlatformWidth / 2.0f;
			float PosZ = 0.0f; // Flat platform

			Vertices.Add(FVector(PosX, PosY, PosZ));
			Normals.Add(FVector(0, 0, 1)); // Up vector
			UVs.Add(FVector2D((float)X / SegmentsX, (float)Y / SegmentsY));
			Colors.Add(FColor::White);
			Tangents.Add(FProcMeshTangent(1, 0, 0));
		}
	}

	// Generate triangles
	for (int32 Y = 0; Y < SegmentsY; Y++)
	{
		for (int32 X = 0; X < SegmentsX; X++)
		{
			int32 TopLeft = Y * (SegmentsX + 1) + X;
			int32 TopRight = TopLeft + 1;
			int32 BottomLeft = (Y + 1) * (SegmentsX + 1) + X;
			int32 BottomRight = BottomLeft + 1;

			// First triangle
			Triangles.Add(TopLeft);
			Triangles.Add(BottomLeft);
			Triangles.Add(TopRight);

			// Second triangle
			Triangles.Add(TopRight);
			Triangles.Add(BottomLeft);
			Triangles.Add(BottomRight);
		}
	}

	MeshComponent->CreateMeshSection_LinearColor(0, Vertices, Triangles, Normals, UVs, Colors, Tangents, true);
}

void AMathRunnerPlatform::GenerateWavePlatform()
{
	TArray<FVector> Vertices;
	TArray<int32> Triangles;
	TArray<FVector> Normals;
	TArray<FVector2D> UVs;
	TArray<FColor> Colors;
	TArray<FProcMeshTangent> Tangents;

	const int32 SegmentsX = VertexDensity;
	const int32 SegmentsY = FMath::RoundToInt(VertexDensity * (PlatformWidth / PlatformLength));

	const float StepX = PlatformLength / SegmentsX;
	const float StepY = PlatformWidth / SegmentsY;

	// Generate vertices with wave pattern
	for (int32 Y = 0; Y <= SegmentsY; Y++)
	{
		for (int32 X = 0; X <= SegmentsX; X++)
		{
			float PosX = X * StepX - PlatformLength / 2.0f;
			float PosY = Y * StepY - PlatformWidth / 2.0f;
			
			// Calculate height using sine and cosine waves
			float WaveX = FMath::Sin(PosX * WaveFrequency) * WaveAmplitude;
			float WaveY = FMath::Cos(PosY * WaveFrequency * 0.5f) * (WaveAmplitude * 0.5f);
			float PosZ = WaveX + WaveY;

			Vertices.Add(FVector(PosX, PosY, PosZ));
			
			// Calculate normal based on wave gradient (simplified)
			float NormalX = -FMath::Cos(PosX * WaveFrequency) * WaveFrequency * WaveAmplitude;
			float NormalY = -FMath::Sin(PosY * WaveFrequency * 0.5f) * WaveFrequency * 0.5f * WaveAmplitude * 0.5f;
			FVector Normal = FVector(NormalX, NormalY, 1).GetSafeNormal();
			Normals.Add(Normal);
			
			UVs.Add(FVector2D((float)X / SegmentsX, (float)Y / SegmentsY));
			Colors.Add(FColor::MakeRandomColor());
			Tangents.Add(FProcMeshTangent(1, 0, 0));
		}
	}

	// Generate triangles (same as flat platform)
	for (int32 Y = 0; Y < SegmentsY; Y++)
	{
		for (int32 X = 0; X < SegmentsX; X++)
		{
			int32 TopLeft = Y * (SegmentsX + 1) + X;
			int32 TopRight = TopLeft + 1;
			int32 BottomLeft = (Y + 1) * (SegmentsX + 1) + X;
			int32 BottomRight = BottomLeft + 1;

			Triangles.Add(TopLeft);
			Triangles.Add(BottomLeft);
			Triangles.Add(TopRight);

			Triangles.Add(TopRight);
			Triangles.Add(BottomLeft);
			Triangles.Add(BottomRight);
		}
	}

	MeshComponent->CreateMeshSection_LinearColor(0, Vertices, Triangles, Normals, UVs, Colors, Tangents, true);
}

void AMathRunnerPlatform::GenerateNoisePlatform()
{
	TArray<FVector> Vertices;
	TArray<int32> Triangles;
	TArray<FVector> Normals;
	TArray<FVector2D> UVs;
	TArray<FColor> Colors;
	TArray<FProcMeshTangent> Tangents;

	const int32 SegmentsX = VertexDensity;
	const int32 SegmentsY = FMath::RoundToInt(VertexDensity * (PlatformWidth / PlatformLength));

	const float StepX = PlatformLength / SegmentsX;
	const float StepY = PlatformWidth / SegmentsY;

	// Generate vertices with noise-based height
	for (int32 Y = 0; Y <= SegmentsY; Y++)
	{
		for (int32 X = 0; X <= SegmentsX; X++)
		{
			float PosX = X * StepX - PlatformLength / 2.0f;
			float PosY = Y * StepY - PlatformWidth / 2.0f;
			
			// Calculate height using simplex noise
			float NoiseValue = SimplexNoise(PosX * NoiseScale, PosY * NoiseScale, 0.0f);
			float PosZ = NoiseValue * NoiseScale;

			Vertices.Add(FVector(PosX, PosY, PosZ));
			Normals.Add(FVector(0, 0, 1)); // Simplified normal
			UVs.Add(FVector2D((float)X / SegmentsX, (float)Y / SegmentsY));
			Colors.Add(FColor::MakeRandomColor());
			Tangents.Add(FProcMeshTangent(1, 0, 0));
		}
	}

	// Generate triangles
	for (int32 Y = 0; Y < SegmentsY; Y++)
	{
		for (int32 X = 0; X < SegmentsX; X++)
		{
			int32 TopLeft = Y * (SegmentsX + 1) + X;
			int32 TopRight = TopLeft + 1;
			int32 BottomLeft = (Y + 1) * (SegmentsX + 1) + X;
			int32 BottomRight = BottomLeft + 1;

			Triangles.Add(TopLeft);
			Triangles.Add(BottomLeft);
			Triangles.Add(TopRight);

			Triangles.Add(TopRight);
			Triangles.Add(BottomLeft);
			Triangles.Add(BottomRight);
		}
	}

	MeshComponent->CreateMeshSection_LinearColor(0, Vertices, Triangles, Normals, UVs, Colors, Tangents, true);
}

void AMathRunnerPlatform::GenerateSpiralPlatform()
{
	// Placeholder for spiral platform generation
	// Would use parametric equations for spiral geometry
	UE_LOG(LogTemp, Warning, TEXT("Spiral platform generation not fully implemented"));
	GenerateFlatPlatform(); // Fallback to flat
}

void AMathRunnerPlatform::GenerateFractalPlatform()
{
	// Placeholder for fractal platform generation
	// Would use recursive mathematical patterns
	UE_LOG(LogTemp, Warning, TEXT("Fractal platform generation not fully implemented"));
	GenerateFlatPlatform(); // Fallback to flat
}

float AMathRunnerPlatform::SimplexNoise(float X, float Y, float Z) const
{
	// Simplified noise function using mathematical operations
	// In production, you'd use a proper Perlin/Simplex noise implementation
	
	// Combine multiple sine waves with different frequencies
	float Noise = 0.0f;
	float Amplitude = 1.0f;
	float Frequency = 1.0f;
	
	for (int32 i = 0; i < 4; i++)
	{
		Noise += Amplitude * FMath::Sin(X * Frequency) * FMath::Cos(Y * Frequency);
		Noise += Amplitude * FMath::Sin(Z * Frequency * 0.5f);
		Amplitude *= 0.5f;
		Frequency *= 2.0f;
	}
	
	return FMath::Clamp(Noise / 4.0f, -1.0f, 1.0f);
}

float AMathRunnerPlatform::CalculateHeight(float X, float Y, float Z) const
{
	switch (PlatformType)
	{
	case EPlatformType::Wave:
		return FMath::Sin(X * WaveFrequency) * WaveAmplitude + 
			   FMath::Cos(Y * WaveFrequency * 0.5f) * (WaveAmplitude * 0.5f);
	case EPlatformType::Noise:
		return SimplexNoise(X * NoiseScale, Y * NoiseScale, Z) * NoiseScale;
	default:
		return 0.0f;
	}
}
