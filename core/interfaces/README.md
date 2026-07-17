# Interfaces Directory

## Purpose
Interface definitions for all system interactions. Interfaces specify the contracts between components â€” how scripts interact with data, how AI agents interact with the system, and how domains communicate.

## Responsibility
Defines the public API surfaces of the Storynaram system â€” input/output contracts, function signatures, event types, and communication protocols between system components.

## Files (planned)
- ScriptInterface.md â€” Script-to-data interaction contract
- AIInterface.md â€” AI-to-system interaction contract
- ValidatorInterface.md â€” Validator input/output contract
- GeneratorInterface.md â€” Generator input/output contract
- ExportInterface.md â€” Export pipeline contract
- ImportInterface.md â€” Import pipeline contract
- EventInterface.md â€” System event definitions

## Naming Convention
- PascalCase.md with Interface suffix
- One interface per system component

## Relationships
- **contracts/** interfaces reference and compose data contracts
- **standards/** interfaces follow interface design standards
- **scripts/** implements interfaces defined here
- **validators/** implements validator interface
