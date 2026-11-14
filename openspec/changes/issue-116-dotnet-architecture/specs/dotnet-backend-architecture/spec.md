# .NET backend architecture verification

<!-- pdac-scope: none reason="This specification concerns build and test enforcement, not product behavior." -->

## ADDED Requirements

### Requirement: Implementation module boundaries are verified against compiled artifacts

The .NET verification lane MUST check each solution implementation module's analyzer activation inputs and MUST test exported handler and sibling implementation-reference boundaries on the compiled product assembly.

#### Scenario: An implementation module loses analyzer activation

- **WHEN** an implementation module omits the compiler-visible activation property, `LighthouseModule=true`, or the analyzer-only project reference
- **THEN** the profile verification fails.

#### Scenario: A compiled module exports a handler or references a sibling implementation

- **WHEN** the actual Workspace assembly exports a CQRS handler or references another implementation assembly in its module family
- **THEN** the compiled architecture test fails.

### Requirement: Roslyn contracts have positive and independent negative compiler fixtures

The .NET verification lane MUST compile a valid supported handler and MUST separately reject an invalid handler contract and an invalid sibling module reference with their corresponding diagnostic IDs.

#### Scenario: Valid semantic handler compiles

- **WHEN** an internal sealed type implements a supported CQRS handler interface
- **THEN** the fixture build succeeds without LH1001.

#### Scenario: Each violated rule fails compilation

- **WHEN** a public handler violates LH1001 or a module references a sibling implementation assembly in violation of LH1002
- **THEN** the respective fixture build fails and reports its own diagnostic ID.
