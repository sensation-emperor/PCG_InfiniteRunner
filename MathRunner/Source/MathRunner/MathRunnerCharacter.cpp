// Copyright MathRunner. All Rights Reserved.

#include "MathRunnerCharacter.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Camera/CameraBoom.h"
#include "ProceduralMeshComponent.h"
#include "Math/UnrealMathUtility.h"

AMathRunnerCharacter::AMathRunnerCharacter()
{
	// Set size for collision capsule
	GetCapsuleComponent()->InitCapsuleSize(42.f, 96.0f);

	// Don't rotate when the controller rotates. Let that just affect the camera.
	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = false;
	bUseControllerRotationRoll = false;

	// Configure character movement
	GetCharacterMovement()->bOrientRotationToMovement = true; // Character moves in the direction of input
	GetCharacterMovement()->RotationRate = FRotator(0.0f, 540.0f, 0.0f);
	GetCharacterMovement()->JumpZVelocity = 600.f;
	GetCharacterMovement()->AirControl = 0.2f;

	// Create a camera boom (pulls in towards the player if there is a collision)
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 800.0f; // The camera follows at this distance behind the character
	CameraBoom->bUsePawnControlRotation = true; // Rotate the arm based on the controller

	// Create a follow camera
	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName); // Attach the camera to the end of the boom and let the boom adjust to target the player properly
	FollowCamera->bUsePawnControlRotation = false; // Camera does not rotate relative to its base

	// Create procedural effect mesh
	EffectMesh = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("EffectMesh"));
	EffectMesh->SetupAttachment(RootComponent);
	EffectMesh->SetVisibility(false); // Hidden by default

	// Initialize movement parameters
	BaseSpeed = 600.0f;
	SpeedMultiplier = 1.0f;
	AnimationPhase = 0.0f;

	// Note: We will override the default movement speed in BeginPlay or via game mode
}

void AMathRunnerCharacter::BeginPlay()
{
	Super::BeginPlay();

	// Set initial movement speed using mathematical formula
	GetCharacterMovement()->MaxWalkSpeed = BaseSpeed * SpeedMultiplier;
}

void AMathRunnerCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Update animation phase using sine wave for smooth procedural animation
	AnimationPhase += DeltaTime * 2.0f;

	// Generate trail effect periodically
	if (FMath::Fmod(AnimationPhase, 0.5f) < 0.01f)
	{
		GenerateTrailEffect();
	}
}

void AMathRunnerCharacter::MoveForward(float Value)
{
	if ((Controller != nullptr) && (Value != 0.0f))
	{
		// Apply speed multiplier to forward movement
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0, Rotation.Yaw, 0);

		// Calculate forward direction with mathematical boost
		const FVector Direction = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
		
		// Apply speed multiplier using exponential scaling for smooth acceleration
		float BoostedValue = Value * SpeedMultiplier;
		
		AddMovementInput(Direction, BoostedValue);
	}
}

void AMathRunnerCharacter::TurnAtRate(float Rate)
{
	// Calculate delta for this frame from the rate information
	AddControllerYawInput(Rate * GetWorld()->GetDeltaSeconds());
}

void AMathRunnerCharacter::TurnByTouch(const ETouchIndex::Type FingerIndex, const FVector Location)
{
	// Touch-based turning implementation
	// Uses circular arc mathematics for smooth rotation
}

void AMathRunnerCharacter::OnTouchStarted(const ETouchIndex::Type FingerIndex, const FVector Location)
{
	// Handle touch start for mobile platforms
	// Could trigger special mathematical abilities
}

void AMathRunnerCharacter::OnTouchStopped(const ETouchIndex::Type FingerIndex, const FVector Location)
{
	// Handle touch stop for mobile platforms
}

void AMathRunnerCharacter::SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent)
{
	// Set up gameplay key mappings
	check(PlayerInputComponent);

	// Bind jump events
	PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
	PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);

	// Bind movement events
	PlayerInputComponent->BindAxis("MoveForward", this, &AMathRunnerCharacter::MoveForward);
	PlayerInputComponent->BindAxis("TurnRight", this, &AMathRunnerCharacter::TurnAtRate);

	// Bind touch events
	PlayerInputComponent->BindTouch(IE_Pressed, this, &AMathRunnerCharacter::OnTouchStarted);
	PlayerInputComponent->BindTouch(IE_Released, this, &AMathRunnerCharacter::OnTouchStopped);
}

void AMathRunnerCharacter::ApplyMathBoost(float Multiplier, float Duration)
{
	// Apply exponential speed boost
	SpeedMultiplier = FMath::Pow(Multiplier, 1.0f);

	// Set timer to reset speed after duration
	GetWorldTimerManager().SetTimer(BoostTimerHandle, this, &AMathRunnerCharacter::ApplyMathBoost_End, Duration, false);
}

void AMathRunnerCharacter::ApplyMathBoost_End()
{
	// Reset speed multiplier to base
	SpeedMultiplier = 1.0f;
	GetCharacterMovement()->MaxWalkSpeed = BaseSpeed;
}

float AMathRunnerCharacter::CalculateJumpForce(float Distance, float Angle) const
{
	// Calculate required jump force using parabolic trajectory equation
	// Formula: F = (m * g * d) / sin(2 * theta)
	// Simplified for game physics
	
	const float Gravity = GetWorld()->GetGravityZ();
	const float Radians = FMath::DegreesToRadians(Angle);
	
	// Avoid division by zero
	if (FMath::IsNearlyZero(FMath::Sin(2.0f * Radians)))
	{
		return GetCharacterMovement()->JumpZVelocity;
	}
	
	// Calculate initial velocity needed
	float Velocity = FMath::Sqrt((Gravity * Distance) / FMath::Sin(2.0f * Radians));
	
	return FMath::Abs(Velocity);
}

float AMathRunnerCharacter::GetCurrentSpeed() const
{
	// Return current speed with mathematical progression
	return BaseSpeed * SpeedMultiplier;
}

void AMathRunnerCharacter::GenerateTrailEffect()
{
	// Generate procedural trail effect using mathematical curves
	// This creates a visual trail behind the player using parametric equations
	
	TArray<FVector> Vertices;
	TArray<int32> Triangles;
	TArray<FVector> Normals;
	TArray<FVector2D> UVs;
	TArray<FColor> Colors;
	TArray<FProcMeshTangent> Tangents;

	// Simple trail generation using sine wave pattern
	const int32 TrailSegments = 10;
	const float TrailWidth = 20.0f;
	const float TrailLength = 100.0f;

	FVector CurrentLocation = GetActorLocation();
	FRotator CurrentRotation = GetActorRotation();

	for (int32 i = 0; i < TrailSegments; i++)
	{
		float T = (float)i / TrailSegments;
		float OffsetX = -T * TrailLength;
		float OffsetY = FMath::Sin(T * PI * 2.0f + AnimationPhase) * TrailWidth * 0.5f;
		
		FVector Position = CurrentLocation + FVector(OffsetX, OffsetY, -50.0f);
		
		Vertices.Add(Position);
		Normals.Add(FVector(0, 0, 1));
		UVs.Add(FVector2D(T, 0));
		Colors.Add(FColor::MakeRandomColor());
		Tangents.Add(FProcMeshTangent(1, 0, 0));
	}

	// Note: Full implementation would create proper mesh geometry
	// This is a simplified example
}
