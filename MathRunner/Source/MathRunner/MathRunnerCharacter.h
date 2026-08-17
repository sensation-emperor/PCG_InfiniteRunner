// Copyright MathRunner. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "MathRunnerCharacter.generated.h"

UCLASS(config=Game)
class AMathRunnerCharacter : public ACharacter
{
	GENERATED_BODY()

	/** Camera boom positioning the camera behind the character */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
	class USpringArmComponent* CameraBoom;

	/** Follow camera */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
	class UCameraComponent* FollowCamera;

	/** Procedural mesh component for visual effects */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Effects, meta = (AllowPrivateAccess = "true"))
	class UProceduralMeshComponent* EffectMesh;

public:
	AMathRunnerCharacter();

protected:
	/** Called for forwards/backwards input */
	void MoveForward(float Value);

	/** Called for turning via touch input */
	void TurnByTouch(const ETouchIndex::Type FingerIndex, const FVector Location);

	/**
	 * Called via input to turn at a given rate.
	 * @param Rate	This is a normalized rate, i.e. 1.0 means a perfect full circle in one second
	 */
	void TurnAtRate(float Rate);

	/** Handler for when we touch an actor when running. */
	UFUNCTION(BlueprintCallable, Category = "Interaction")
	void OnTouchStarted(const ETouchIndex::Type FingerIndex, const FVector Location);

	/** Handler for when we stop touching an actor when running. */
	UFUNCTION()
	void OnTouchStopped(const ETouchIndex::Type FingerIndex, const FVector Location);

	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

public:
	/** Returns CameraBoom subobject **/
	FORCEINLINE class USpringArmComponent* GetCameraBoom() const { return CameraBoom; }
	/** Returns FollowCamera subobject **/
	FORCEINLINE class UCameraComponent* GetFollowCamera() const { return FollowCamera; }

	// Apply mathematical movement boost
	UFUNCTION(BlueprintCallable, Category = "Movement")
	void ApplyMathBoost(float Multiplier, float Duration);

	// Calculate jump force using parabolic equation
	UFUNCTION(BlueprintPure, Category = "Movement")
	float CalculateJumpForce(float Distance, float Angle) const;

	// Get current speed based on mathematical progression
	UFUNCTION(BlueprintPure, Category = "Movement")
	float GetCurrentSpeed() const;

protected:
	virtual void BeginPlay() override;

private:
	// Base movement speed
	float BaseSpeed;

	// Current speed multiplier
	float SpeedMultiplier;

	// Boost timer handle
	FTimerHandle BoostTimerHandle;

	// Mathematical animation phase
	float AnimationPhase;

	// Generate procedural trail effect
	void GenerateTrailEffect();
};
