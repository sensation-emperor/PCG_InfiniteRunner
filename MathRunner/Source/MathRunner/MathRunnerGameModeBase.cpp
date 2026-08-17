// Copyright MathRunner. All Rights Reserved.

#include "MathRunnerGameModeBase.h"
#include "MathRunnerPlatform.h"
#include "MathRunnerCharacter.h"
#include "Engine/World.h"
#include "Math/UnrealMathUtility.h"

AMathRunnerGameModeBase::AMathRunnerGameModeBase()
{
	// Set default pawn class to our math runner character
	static ConstructorHelpers::FClassFinder<AMathRunnerCharacter> PlayerPawnBPClass(TEXT("/Game/Core/BP_MathRunnerCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}

	// Initialize game mode parameters
	DistanceTraveled = 0.0f;
	CurrentDifficulty = 1.0f;
	SpawnInterval = 500.0f; // Base spawn interval
	GenerationSeed = FMath::Rand();

	// Use mathematical sequence for initial difficulty curve
	CurrentDifficulty = FMath::Pow(1.0f, 2.0f); // Starting value
}

void AMathRunnerGameModeBase::BeginPlay()
{
	Super::BeginPlay();

	// Spawn initial platform sequence using mathematical patterns
	SpawnInitialPlatforms();

	// Set timer for continuous platform generation
	FTimerHandle TimerHandle;
	GetWorldTimerManager().SetTimer(TimerHandle, this, &AMathRunnerGameModeBase::SpawnNextPlatform, 2.0f, true);
}

void AMathRunnerGameModeBase::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Update distance traveled based on player position
	if (GetWorld() && GetWorld()->GetFirstPlayerController())
	{
		APawn* PlayerPawn = GetWorld()->GetFirstPlayerController()->GetPawn();
		if (PlayerPawn)
		{
			DistanceTraveled = PlayerPawn->GetActorLocation().X;

			// Update difficulty based on distance using exponential scaling
			CurrentDifficulty = 1.0f + FMath::Pow(DistanceTraveled / 10000.0f, 1.5f);
		}
	}
}

void AMathRunnerGameModeBase::SpawnNextPlatform()
{
	if (!GetWorld() || !LastPlatform)
	{
		return;
	}

	// Calculate next platform location using parametric equations
	FVector NextLocation = CalculateNextPlatformLocation(LastPlatform);
	FRotator NextRotation(0, 0, 0);

	// Spawn new platform
	FActorSpawnParameters SpawnParams;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	AMathRunnerPlatform* NewPlatform = GetWorld()->SpawnActor<AMathRunnerPlatform>(
		AMathRunnerPlatform::StaticClass(), 
		NextLocation, 
		NextRotation, 
		SpawnParams
	);

	if (NewPlatform)
	{
		SpawnedPlatforms.Add(NewPlatform);
		LastPlatform = NewPlatform;

		// Possibly spawn obstacles on the platform
		if (FMath::FRand() < CurrentDifficulty * 0.3f) // 30% chance scaled by difficulty
		{
			SpawnMathematicalObstacle(NextLocation, FRotator::ZeroRotator);
		}

		// Cleanup old platforms to maintain performance
		CleanupOldPlatforms();
	}
}

FVector AMathRunnerGameModeBase::CalculateNextPlatformLocation(AActor* LastPlatform) const
{
	if (!LastPlatform)
	{
		return FVector(0, 0, 0);
	}

	// Get last platform's end position
	AMathRunnerPlatform* LastMathPlatform = Cast<AMathRunnerPlatform>(LastPlatform);
	if (!LastMathPlatform)
	{
		return LastPlatform->GetActorLocation() + FVector(SpawnInterval, 0, 0);
	}

	// Calculate gap using Fibonacci sequence for natural spacing
	float GapSize = CalculatePlatformGap();

	// Add some randomness using mathematical noise
	float RandomOffset = FMath::Sin(DistanceTraveled * 0.01f) * 50.0f;
	float YOffset = FMath::Cos(DistanceTraveled * 0.005f) * 100.0f;

	return LastPlatform->GetActorLocation() + FVector(GapSize + RandomOffset, YOffset, 0);
}

AActor* AMathRunnerGameModeBase::SpawnMathematicalObstacle(FVector Location, FRotator Rotation)
{
	// In a full implementation, this would spawn various obstacle types
	// Each obstacle would be generated using mathematical shapes (cones, spheres, torus, etc.)

	FActorSpawnParameters SpawnParams;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	// Determine obstacle type based on mathematical pattern
	int32 ObstacleType = DetermineObstacleType();

	// Placeholder: In production, you'd have different actor classes for each obstacle type
	// For now, we'll just log the obstacle spawn
	UE_LOG(LogTemp, Log, TEXT("Spawning mathematical obstacle type %d at %s"), ObstacleType, *Location.ToString());

	return nullptr; // Placeholder
}

float AMathRunnerGameModeBase::GetDifficultyMultiplier() const
{
	// Calculate difficulty using exponential growth function
	// Formula: Difficulty = Base * e^(k * Distance)
	const float BaseDifficulty = 1.0f;
	const float GrowthRate = 0.0001f;

	return BaseDifficulty * FMath::Exp(GrowthRate * DistanceTraveled);
}

void AMathRunnerGameModeBase::UpdateDifficultyBasedOnPerformance()
{
	// Analyze player performance using statistical methods
	// Adjust difficulty using adaptive algorithms

	// Simple implementation: increase difficulty based on distance
	CurrentDifficulty = GetDifficultyMultiplier();

	// Could add more sophisticated analysis:
	// - Player success rate on jumps
	// - Time taken to complete sections
	// - Number of failures/retries
	// - Pattern recognition of player behavior
}

void AMathRunnerGameModeBase::SpawnInitialPlatforms()
{
	if (!GetWorld())
	{
		return;
	}

	FActorSpawnParameters SpawnParams;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	// Spawn first platform at origin
	FVector FirstLocation(0, 0, 0);
	FRotator FirstRotation(0, 0, 0);

	AMathRunnerPlatform* FirstPlatform = GetWorld()->SpawnActor<AMathRunnerPlatform>(
		AMathRunnerPlatform::StaticClass(),
		FirstLocation,
		FirstRotation,
		SpawnParams
	);

	if (FirstPlatform)
	{
		SpawnedPlatforms.Add(FirstPlatform);
		LastPlatform = FirstPlatform;

		// Spawn a few more platforms ahead using arithmetic sequence
		for (int32 i = 1; i < 5; i++)
		{
			FVector NextLoc = FirstLocation + FVector(i * SpawnInterval, 0, 0);
			
			AMathRunnerPlatform* NewPlatform = GetWorld()->SpawnActor<AMathRunnerPlatform>(
				AMathRunnerPlatform::StaticClass(),
				NextLoc,
				FirstRotation,
				SpawnParams
			);

			if (NewPlatform)
			{
				SpawnedPlatforms.Add(NewPlatform);
				LastPlatform = NewPlatform;
			}
		}
	}
}

void AMathRunnerGameModeBase::CleanupOldPlatforms()
{
	if (!GetWorld() || SpawnedPlatforms.Num() == 0)
	{
		return;
	}

	// Get player location
	APawn* PlayerPawn = GetWorld()->GetFirstPlayerController()->GetPawn();
	if (!PlayerPawn)
	{
		return;
	}

	float PlayerX = PlayerPawn->GetActorLocation().X;
	float CleanupThreshold = PlayerX - 2000.0f; // Clean up platforms 2000 units behind player

	// Remove platforms that are too far behind
	for (int32 i = SpawnedPlatforms.Num() - 1; i >= 0; i--)
	{
		AActor* Platform = SpawnedPlatforms[i];
		if (Platform && Platform->GetActorLocation().X < CleanupThreshold)
		{
			Platform->Destroy();
			SpawnedPlatforms.RemoveAt(i);
		}
	}
}

float AMathRunnerGameModeBase::CalculatePlatformGap() const
{
	// Use Fibonacci sequence for natural, aesthetically pleasing gaps
	// Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21...
	
	int32 FibIndex = FMath::FloorToInt(DistanceTraveled / 1000.0f) % 10;
	
	// Pre-calculated Fibonacci numbers scaled for gameplay
	const float FibonacciGaps[] = { 300.0f, 300.0f, 400.0f, 500.0f, 700.0f, 
									 900.0f, 1200.0f, 1500.0f, 2000.0f, 2500.0f };

	float BaseGap = FibonacciGaps[FMath::Clamp(FibIndex, 0, 9)];

	// Apply difficulty modifier
	return BaseGap * (1.0f + CurrentDifficulty * 0.1f);
}

int32 AMathRunnerGameModeBase::DetermineObstacleType() const
{
	// Use mathematical patterns to determine obstacle type
	// Could use prime numbers, golden ratio, or other mathematical sequences

	// Simple implementation using modular arithmetic
	int32 PatternValue = FMath::FloorToInt(DistanceTraveled / 500.0f);
	
	// Return obstacle type based on pattern (0-4 for 5 different types)
	return PatternValue % 5;
}
