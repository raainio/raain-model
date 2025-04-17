# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.3] - 2025-04-17

### Added

- Enhanced support for string IDs in team parameters
- Improved error handling in getMapData() methods

### Changed

- Modified parameter types from `any` to `string` for configurationAsJSON
- Enhanced node creation with proper link handling
- Improved type safety and error handling across components

## [3.0.2] - 2025-04-17

### Added

- Enhanced link handling in GaugeMeasure and RadarMeasure
- Added Release Process documentation in README.md

### Changed

- Improved node creation in GaugeMeasure and RadarMeasure with proper link handling
- Updated documentation in .memory-bank folder
- Clarified release process documentation

## [3.0.1] - 2025-04-17

### Added

- Major version upgrade to 3.0.0
- Enhanced TypeScript 5.0.4 support
- Improved documentation and API references
- Additional test coverage

### Changed

- Refactored core components for better performance
- Updated dependencies to latest versions
- Improved error handling and type safety

### Technical Details

- Optimized data structures for radar and rain processing
- Enhanced coordinate transformation algorithms
- Improved quality metrics calculation

## [2.6.11] - 2025-03-22

### Added

- Planning new feature implementations
- Considering additional testing frameworks

### Changed

- Ongoing documentation improvements
- Code structure refinements

### Dependencies

- Planning to update TypeScript dependencies
- Considering new quality measurement tools integration

### Technical Details

- Investigating performance optimizations
- Exploring new quality metric algorithms

## [2.6.9] - 2025-03-21

### Added

- MIT license file
- TypeDoc configuration for API documentation
- Enhanced documentation for core components

### Changed

- Updated CI workflow configuration
- Improved core components:
    - Enhanced RainNode computation capabilities
    - Updated GaugeNode station management
    - Refined organization structure (RaainNode, TeamNode)

### Dependencies

- Updated dependencies to latest versions
- Upgraded TypeScript to ^5.0.4
- Updated testing frameworks

### Technical Details

- Improved polar measurement value filtering
- Enhanced speed matrix container comparison calculations
- Refined quality control mechanisms

## [2.6.8] - 2025-03-16

### Fixed

- PolarMeasureValue getFiltered functionality

### Technical Details

- Optimized filtering algorithms
- Improved error handling in measurement processing

## [2.6.7] - 2025-02-24

### Fixed

- SpeedMatrixContainer BuildCompares calculations
- Quality point calculations and metrics
- CartesianRainHistory tracking improvements
- QualityTools refinements

### Dependencies

- Updated dependencies to patch security vulnerabilities

### Technical Details

- Improved matrix comparison algorithms
- Enhanced quality metric calculations
- Optimized history tracking mechanisms

## [2.6.0] - 2024

### Added

- Unified Cartesian map tools
- Improved map manipulation utilities

## [2.5.0] - 2024

### Added

- Polar and Cartesian limits (count + offsets)
- PolarMap for index manipulation

## [2.4.0] - 2024

### Changed

- Moved role to roles in PeopleNode
- Improved role management system

## [2.3.0] - 2024

### Changed

- Refactored Angle/Axis system
- Improved angular calculations

## [2.2.0] - 2024

### Changed

- Refactored BuildCompares functionality
- Enhanced comparison algorithms

## [2.1.0] - 2023

### Added

- Extended RainComputationQuality with rainComputation's link
- Added getQualityPointsByHistoricalPosition method

## [2.0.0] - 2023

### Changed

- More flexible configuration system for rain, radar, and gauge
- Restructured Rain zone to use LatLng rects
- Removed period usage in favor of date

## [1.11.0] - 2023

### Changed

- Modified SpeedMatrixContainer's QualityPoints relation (1:N)
- Added SpeedMatrix name property

## [1.10.0] - 2023

### Added

- Object constructor based on JSON only
- Added specifications

## [1.9.0] - 2023

### Added

- Cartesian improvements
- Enhanced coordinate system

## [0.4.0] - 2022

### Changed

- Implemented Cartesian values
- Reorganized folders
- Renamed Polar objects (XX-MeasureValue to XX-PolarMeasureValue)

## [0.3.0] - 2022

### Added

- Added IVersion interface
- Implemented CI/CD pipeline

### Changed

- Reformatted Links structure

## [0.2.0] - 2022

### Added

- Customer teams functionality
- Radar implementation

## [0.0.1] - 2022

### Added

- Initial release
- First extracts from RAAIN services

[Unreleased]: https://github.com/raainio/raain-model/compare/v3.0.3...HEAD

[3.0.3]: https://github.com/raainio/raain-model/compare/v3.0.2...v3.0.3

[3.0.2]: https://github.com/raainio/raain-model/compare/v3.0.1...v3.0.2

[3.0.1]: https://github.com/raainio/raain-model/compare/v2.6.11...v3.0.1

[2.6.11]: https://github.com/raainio/raain-model/compare/v2.6.9...v2.6.11

[2.6.9]: https://github.com/raainio/raain-model/compare/v2.6.8...v2.6.9

[2.6.8]: https://github.com/raainio/raain-model/compare/v2.6.7...v2.6.8

[2.6.7]: https://github.com/raainio/raain-model/compare/v2.6.6...v2.6.7

[2.6.0]: https://github.com/raainio/raain-model/compare/v2.5.0...v2.6.0

[2.5.0]: https://github.com/raainio/raain-model/compare/v2.4.0...v2.5.0

[2.4.0]: https://github.com/raainio/raain-model/compare/v2.3.0...v2.4.0

[2.3.0]: https://github.com/raainio/raain-model/compare/v2.2.0...v2.3.0

[2.2.0]: https://github.com/raainio/raain-model/compare/v2.1.0...v2.2.0

[2.1.0]: https://github.com/raainio/raain-model/compare/v2.0.0...v2.1.0

[2.0.0]: https://github.com/raainio/raain-model/compare/v1.11.0...v2.0.0

[1.11.0]: https://github.com/raainio/raain-model/compare/v1.10.0...v1.11.0

[1.10.0]: https://github.com/raainio/raain-model/compare/v1.9.0...v1.10.0

[1.9.0]: https://github.com/raainio/raain-model/compare/v0.4.0...v1.9.0

[0.4.0]: https://github.com/raainio/raain-model/compare/v0.3.0...v0.4.0

[0.3.0]: https://github.com/raainio/raain-model/compare/v0.2.0...v0.3.0

[0.2.0]: https://github.com/raainio/raain-model/compare/v0.0.1...v0.2.0

[0.0.1]: https://github.com/raainio/raain-model/releases/tag/v0.0.1 
