// Copyright Epic Games, Inc. All Rights Reserved.

#include "EndlessRunnerGenerator.h"

#define LOCTEXT_NAMESPACE "FEndlessRunnerGeneratorModule"

void FEndlessRunnerGeneratorModule::StartupModule()
{
    // This code will execute after your module is loaded into memory; 
    // the exact timing is unspecified. Implementation details are available in the documentation.
}

void FEndlessRunnerGeneratorModule::ShutdownModule()
{
    // This function may be called during shutdown to clean up your module. 
    // For modules that support dynamic reloading, we call this function before unloading the module.
}

#undef LOCTEXT_NAMESPACE
    
IMPLEMENT_MODULE(FEndlessRunnerGeneratorModule, EndlessRunnerGenerator)
