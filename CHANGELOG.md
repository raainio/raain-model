# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Differentiate getOneCircle and getOneRawCircle depending on perf context
- Added new method to CartesianTools:
    - howManyPixelsInEarthMap: Counts how many pixels are in a square defined by southwest and northeast coordinates

### Fixed

- Fixed usage of `this.scale` in CartesianTools methods, replacing with `earthMap.latitudeScale` for proper scaling

## [3.0.17] - 2025-07-03

### Added

- getOneCircle from a polarMeasureValueMap

## [3.0.16] - 2025-07-02

### Fixed

- adjustRainNodeWithSquareWidth return type

## [3.0.15] - 2025-07-02

### Added

- Added new methods to CartesianTools:
    - GetLatLngRectsCenter: Calculates the center of a set of LatLng rectangles
    - GetLimitPoints: Gets the boundary points of a set of LatLng rectangles
    - getSquareFromWidthAndCenter: Creates a square of specified width around a center point
    - adjustRainNodeWithSquareWidth: Adjusts a RainNode with a square of specified width

### Changed

- Refactored EarthMap from interface to class with singleton pattern
- Improved RainNode to use CartesianTools methods for center and limit point calculations
- Enhanced setDefaultLatLng in RainNode to handle cases with and without radars
- Updated tests to verify new functionality

## [3.0.14] - 2025-06-22

### Added

- Added static `Duplicate()` method to PolarMeasureValueMap class for creating copies of polar measure value maps

### Changed

- Changed `measureValuePolarContainer.getDistance()` to `measureValuePolarContainer.distance` in PolarMeasureValueMap
- Commented out warning message about negative distanceInMeters in PolarMeasureValueMap

## [3.0.13] - 2025-06-16

### Added

- Added ESLint configuration with modern rules
- Enhanced code style consistency

### Changed

- Updated dependencies to latest versions
- Improved build process scripts

## [3.0.12] - 2025-06-06

### Added

- Added static TYPE property to RainComputationQuality class
- Added getLinkType method to RainComputationQuality class for consistent link type handling

## [3.0.11] - 2025-05-20

### Added

- New script for squashing commits (scripts/bp/squash-commits.js)
- New script for switching dependencies (scripts/bp/switch-dependencies.js)
- New script for updating changelog dates (scripts/bp/update-changelog-date.js)
- Added bpstatus.json for build process status tracking
- Added src/bpInfo.ts for version information

### Changed

- Updated build process and CI workflow
- Improved RadarNode and RainComputationMap implementations
- Updated documentation in .memory-bank folder
- Refactored release process

### Removed

- Removed RELEASE_PROCESS.md (content moved to README.md)
- Removed scripts/update-changelog.js and scripts/verify-changelog.js
- Removed specs/REQUIREMENTS.md and specs/TECHNICAL.md

## [3.0.10] - 2025-04-25

### Added

- Improved build process with new scripts
- Enhanced project structure

### Changed

- Updated dependencies to latest versions
- Improved code quality and type safety

## [3.0.9] - 2025-04-25

### Changed

- Fixed documentation inconsistencies
- Updated all documentation to reflect latest changes
- Regenerated API documentation

## [3.0.8] - 2025-04-25

### Changed

- Minor improvements to error handling
- Updated dependencies to latest versions

## [3.0.7] - 2025-04-25

### Fixed

- Edge case in radar data processing
- Performance issue in quality assessment

## [3.0.6] - 2025-04-25

### Added

- Enhanced support for multiple radar sources
- Improved integration with physical rain gauge stations

## [3.0.5] - 2025-04-25

### Changed

- Modified CI workflow to allow releasing without bumping version
- Updated version checking to display warnings instead of failing
- Enhanced tag creation process to check if tag already exists

## [3.0.4] - 2025-04-17

### Changed

- Improved type safety by changing configurationAsJSON parameter from `any` to `string` in RainNode
- Updated .gitignore to exclude .output.txt file
- Modified parameter types from `any` to `string` for configurationAsJSON
- Enhanced node creation with proper link handling
- Improved type safety and error handling across components

### Added

- Enhanced support for string IDs in team parameters
- Improved error handling in getMapData() methods

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

## [2.6.9] - 2024-03-21

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

## [2.6.8] - 2024-03-16

### Fixed

- PolarMeasureValue getFiltered functionality

### Technical Details

- Optimized filtering algorithms
- Improved error handling in measurement processing

## [2.6.7] - 2024-02-24

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

[Unreleased]: https://github.com/raainio/raain-model/compare/v3.0.15...HEAD

[3.0.15]: https://github.com/raainio/raain-model/compare/v3.0.14...v3.0.15

[3.0.14]: https://github.com/raainio/raain-model/compare/v3.0.13...v3.0.14

[3.0.13]: https://github.com/raainio/raain-model/compare/v3.0.12...v3.0.13

[3.0.12]: https://github.com/raainio/raain-model/compare/v3.0.11...v3.0.12

[3.0.11]: https://github.com/raainio/raain-model/compare/v3.0.10...v3.0.11

[3.0.10]: https://github.com/raainio/raain-model/compare/v3.0.9...v3.0.10

[3.0.9]: https://github.com/raainio/raain-model/compare/v3.0.8...v3.0.9

[3.0.8]: https://github.com/raainio/raain-model/compare/v3.0.7...v3.0.8

[3.0.7]: https://github.com/raainio/raain-model/compare/v3.0.6...v3.0.7

[3.0.6]: https://github.com/raainio/raain-model/compare/v3.0.5...v3.0.6

[3.0.5]: https://github.com/raainio/raain-model/compare/v3.0.4...v3.0.5

[3.0.4]: https://github.com/raainio/raain-model/compare/v3.0.3...v3.0.4

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
