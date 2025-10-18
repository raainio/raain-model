# 🌧️ RAAIN Model

[![npm version](https://badge.fury.io/js/raain-model.svg)](https://badge.fury.io/js/raain-model)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.28.0-purple.svg)](https://eslint.org/)
[![Build Status](https://github.com/raainio/raain-model/actions/workflows/ci.yml/badge.svg)](https://github.com/raainio/raain-model/actions)

> Shared TypeScript data models and utilities for radar-based rainfall analysis, used across
> all [radartorain.com](https://radartorain.com) services.

## Overview

**raain-model** is the foundational model library for the Raain ecosystem, providing type-safe data structures,
coordinate transformations, and measurement utilities for converting weather radar data into actionable rainfall
measurements.

## 🌟 Features

- **Dual Coordinate Systems**: Full support for both Cartesian (x, y) and Polar (azimuth, range) coordinate systems
- **Radar & Gauge Integration**: Models for radar stations, rain gauges, and their measurements
- **Quality Assessment**: Built-in quality metrics and comparison tools for radar vs gauge validation
- **Rain Computations**: Aggregated rain calculations with map representations and cumulative tracking
- **Speed & History Tracking**: Rain speed monitoring and historical data management
- **Organization Models**: Team management, user roles, and notification events
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Coordinate Transformations**: CartesianTools and EarthMap utilities for geographic calculations

## 🚀 Installation

```bash
npm install raain-model
# or
yarn add raain-model
```

## 📖 Quick Start

```typescript
import {RainNode, RadarNode, GaugeNode, RainComputationMap} from 'raain-model';

// Create a radar node
const radarNode = new RadarNode({
    id: 'radar1',
    latitude: 48.8566,
    longitude: 2.3522,
    name: 'Paris Radar',
    team: null
});

// Create a rain gauge node
const gaugeNode = new GaugeNode({
    id: 'gauge1',
    latitude: 48.8566,
    longitude: 2.3522,
    name: 'Paris Gauge',
    team: null
});

// Create a rain node with radar coverage
const rainNode = new RainNode({
    id: 'rain1',
    name: 'Paris Rain Zone',
    team: null,
    radars: [radarNode],
    gauges: [gaugeNode]
});
```

## 📚 Documentation

Visit [documentation](https://raainio.github.io/raain-model)
and [API swagger](https://api.sandbox.radartorain.com/v3/docs).

### API ↔ Model Mapping

> **⚠️ IMPORTANT**: Keep this section up to date when adding new API endpoints or model classes. This mapping is
> critical for API consumers to understand which models to expect from each endpoint.
> **Validation Rules:**
> - Every endpoint listed here MUST exist in Raain Api Routes
> - Every model class MUST have the endpoint documented in its source file header (e.g., `RainNode.ts`)
> - Before adding an endpoint, verify it exists in both locations

The following table lists which REST API endpoints return or accept which model classes in this library:

| API endpoint (pattern)                                        | Exposes model class         | Notes                                    |
|---------------------------------------------------------------|-----------------------------|------------------------------------------|
| `api/radars/:id`                                              | `RadarNode`                 | Radar station metadata                   |
| `api/radars/:id/measures/:measureId`                          | `RadarMeasure`              | Single radar measure with polar data     |
| `api/radars/:id/measures?begin=...&end=...`                   | `RadarMeasure[]`            | List of radar measures for date range    |
| `api/gauges/:id`                                              | `GaugeNode`                 | Rain gauge metadata                      |
| `api/gauges/:id/measures?begin=...&end=...`                   | `GaugeMeasure[]`            | List of gauge measures for date range    |
| `api/gauges/:id?format=map&begin=...`                         | `GaugeNodeMap`              | Gauge data as map over time window       |
| `api/rains/:id`                                               | `RainNode`                  | Rain zone entity                         |
| `api/rains/:id/computations/:computationId`                   | `RainComputation`           | One computation result                   |
| `api/rains/:id/computations?format=id&begin=...`              | `RainComputation[]`         | List of computations (IDs)               |
| `api/rains/:id/computations/:computationId?format=map`        | `RainComputationMap`        | Computation as cartesian map             |
| `api/rains/:id/computations?format=map&begin=...`             | `RainComputationMap[]`      | List of maps over period                 |
| `api/rains/:id/computations/:computationId/speeds`            | `RainSpeedMap`              | Rain speed map for a computation         |
| `api/rains/:id/computations/:computationId/compares?date=...` | `RainComputationQuality[]`  | Quality/compare metrics (radar vs gauge) |
| `api/rains/:id/cumulative/:cumulativeId`                      | `RainComputationCumulative` | Cumulative computation                   |
| `api/notifications`                                           | `EventNode[]`               | List of user notifications               |
| `api/teams/:id`                                               | `TeamNode`                  | Team/organization entity                 |
| `api/teams?name=...`                                          | `TeamNode`                  | Team lookup by name                      |
| `api/teams/:id/people`                                        | `PeopleNode[]`              | People related to a team                 |

**Note**: All endpoints are prefixed with the API version (e.g., `/v3/api/...`).

### Core Model Categories

**Organization & Management**

- `RainNode`: Rain zone with radar(s) coverage
- `RadarNode`: Radar station metadata and configuration
- `GaugeNode`: Physical rain gauge station
- `TeamNode`: Team/organization entity
- `PeopleNode`: User/person entity with roles
- `EventNode`: Notification/event payload

**Measurements**

- `RadarMeasure`: Single radar measurement with polar data
- `GaugeMeasure`: Single gauge measurement
- `RainMeasure`: Aggregated rain measurement
- `RainComputation`: Rain computation result
- `RainComputationCumulative`: Cumulative rain computation over time

**Coordinate Systems**

- `CartesianMeasureValue`: Cartesian (x, y) rain map data
- `PolarMeasureValue`: Polar (azimuth, range) radar data
- `PolarMeasureValueMap`: Collection of polar measurements
- `LatLng`: Geographic coordinates (latitude/longitude)
- `EarthMap`: Singleton for earth coordinate mapping
- `CartesianTools`: Utilities for geographic calculations

**Data Visualization**

- `RadarNodeMap`: Radar coverage/map visualization
- `GaugeNodeMap`: Gauge data over time window
- `RainComputationMap`: Rain computation as cartesian map

**Quality & Analysis**

- `RainComputationQuality`: Quality metrics comparing radar vs gauge
- `SpeedMatrix`: Quality assessment matrix
- `RainSpeed` / `RainSpeedMap`: Rain speed tracking and storage

#### 🌍 Coordinate Systems Explained

The library supports two coordinate systems for different use cases:

**Polar Coordinates (azimuth, range)**

- Native radar measurement format
- Azimuth: angle from north (0-360°)
- Range: distance from radar (in meters)
- Used for raw radar data processing

**Cartesian Coordinates (x, y)**

- Grid-based representation
- Used for rain maps and visualizations
- Easier for geographic calculations and mapping
- Transformation utilities provided via `CartesianTools`

## 🛠️ Feel free to contribute

```bash
# Install dependencies
npm i

# ... Do your changes ...

# Linting and formatting
npm run bp:style:fix

# Run all tests
npm test

# (optional) Compile TypeScript
npm run build

# PR it :)
```

## 📅 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and changes.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
