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
import {RainNode, RadarNode, GaugeNode} from 'raain-model';

// Create a radar node
const radarNode = new RadarNode({
    id: 'parisR',
    latitude: 48.8566,
    longitude: 2.3522,
    name: 'Paris Radar',
    team: null
});

// Create a rain gauge node
const gaugeNode = new GaugeNode({
    id: 'parisG',
    latitude: 48.8566,
    longitude: 2.3522,
    name: 'One Paris Gauge',
    team: null
});

// Create a rain node
const rainNode = new RainNode({
    id: 'parisZ',
    name: 'Paris Rain Zone',
    team: null,
    radars: [radarNode],
    gauges: [gaugeNode]
});

// ...

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

<!-- MODEL_MAPPING_TABLE_START -->

| API endpoint (pattern)                                                                | Exposes model class         | Notes                                               |
|---------------------------------------------------------------------------------------|-----------------------------|-----------------------------------------------------|
| `/radars`                                                                             | `RadarNode[]`               | Search for radars                                   |
| `/radars/:radarId`                                                                    | `RadarNode`                 | Get a radar by ID                                   |
| `/radars/:radarId/measures`                                                           | `RadarMeasure[]`            | Get radar measures                                  |
| `/radars/:radarId/measures/:radarMeasureId`                                           | `RadarMeasure`              | Get a radar measure by ID                           |
| `/gauges`                                                                             | `GaugeNode[]`               | Search for gauges                                   |
| `/gauges/:gaugeId`                                                                    | `GaugeNode`                 | Get a gauge by ID                                   |
| `/gauges/:gaugeId?format=cartesian-map`                                               | `GaugeNodeMap`              | Get a gauge by ID (format=cartesian-map)            |
| `/gauges/:gaugeId/measures`                                                           | `GaugeMeasure[]`            | Get gauge measures                                  |
| `/rains`                                                                              | `RainNode[]`                | Search for rain zones                               |
| `/rains/:rainId`                                                                      | `RainNode`                  | Get a rain zone by ID                               |
| `/rains/:rainId/cumulatives/:rainComputationCumulativeId`                             | `RainComputationCumulative` | Get a cumulative computation                        |
| `/rains/:rainId/cumulatives/:rainComputationCumulativeId?format=cartesian-map`        | `RainComputationMap`        | Get a cumulative computation (format=cartesian-map) |
| `/rains/:rainId/cumulatives/:rainComputationCumulativeId/compares`                    | `RainComputationQuality[]`  | Get cumulative quality metrics                      |
| `/rains/:rainId/cumulatives/:rainComputationCumulativeId/cumulative/:cumulativeHours` | `RainComputationCumulative` | Get cumulative computation data                     |
| `/notifications`                                                                      | `EventNode[]`               | Get all notifications                               |
| `/notifications/:notificationId`                                                      | `EventNode`                 | Get a notification by ID                            |
| `/teams`                                                                              | `TeamNode[]`                | Search for teams                                    |
| `/teams/:teamId`                                                                      | `TeamNode`                  | Get a team by ID                                    |

<!-- MODEL_MAPPING_TABLE_END -->

**Note**: All endpoints are prefixed with the API version (e.g., `/v3/...`).

### API Contracts (`api/`)

The `api/` directory provides TypeScript interfaces for API request and response contracts, enabling type-safe API integration.

**Contract Types:**

| Suffix          | Purpose                   | Example                                   |
|-----------------|---------------------------|-------------------------------------------|
| `*Request`      | Query parameters (GET)    | `RaainApiGaugesFindMeasuresRequest`       |
| `*RequestBody`  | Request body (POST/PUT)   | `RaainApiGaugesUpsertMeasureRequestBody`  |
| `*Response`     | Response body             | `RaainApiGaugesFindMeasuresResponse`      |

**Common Types:**

- `PaginationRequest`: Standard pagination params (`page`, `limit`)
- `PaginatedResponse<T>`: Paginated list response (`data`, `total`, `hasNext`, etc.)
- `ErrorResponse`: Standard error format (`{ error: string }`)

**Usage Example:**

```typescript
import {
    RaainApiGaugesFindMeasuresRequest,
    RaainApiGaugesFindMeasuresResponse,
    PaginatedResponse,
    GaugeNode
} from 'raain-model';

// Type-safe request parameters
const params: RaainApiGaugesFindMeasuresRequest = {
    begin: '2024-01-01T00:00:00Z',
    end: '2024-01-02T00:00:00Z'
};

// Type-safe response handling
const response: RaainApiGaugesFindMeasuresResponse = await fetch(
    `/v3/gauges/${gaugeId}/measures?begin=${params.begin}&end=${params.end}`
).then(r => r.json());

// Paginated endpoints return PaginatedResponse<T>
const gauges: PaginatedResponse<GaugeNode> = await fetch('/v3/gauges').then(r => r.json());
```

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
