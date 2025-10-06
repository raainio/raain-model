# 🌧️ RAAIN Model

[![npm version](https://badge.fury.io/js/raain-model.svg)](https://badge.fury.io/js/raain-model)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.28.0-purple.svg)](https://eslint.org/)
[![Build Status](https://github.com/raainio/raain-model/actions/workflows/ci.yml/badge.svg)](https://github.com/raainio/raain-model/actions)

> A TypeScript library for radar-based rain measurement and analysis, used in [radartorain.com](https://radartorain.com)
> services.

## 🌟 Features

- **Cartesian & Polar Coordinates**: Support for both coordinate systems
- **Advanced Merging**: Sophisticated merging strategies for rain data
- **Quality Assessment**: Built-in quality metrics for measurements
- **TypeScript Support**: Full type safety and modern TypeScript features

## 🚀 Installation

```bash
npm install raain-model
# or
yarn add raain-model
```

## 📖 Quick Start

```typescript
import {RainNode, RadarNode} from 'raain-model';

// Create a radar node
const radarNode = new RadarNode({
    id: 'radar1',
    latitude: 48.8566,
    longitude: 2.3522,
    name: 'Paris Radar',
    team: null
});

// Create a rain node
const rainNode = new RainNode({
    id: 'rain1',
    name: 'Paris Rain',
    team: null,
    radars: [radarNode]
});

```

## 📚 Documentation

Visit [documentation](https://raainio.github.io/raain-model)
and [API swagger](https://api.sandbox.radartorain.com/v3/docs).

### API ↔ Model Mapping

The following table lists which REST API endpoints return or accept which model classes in this library:

| API endpoint (pattern)                                             | Exposes model class      | Notes                                     |
|--------------------------------------------------------------------|--------------------------|-------------------------------------------|
| `api/radars/:id`                                                   | `RadarNode`              | Radar station metadata                    |
| `api/radars/:id/measures/:id`                                      | `RadarMeasure`           | Single radar measure                      |
| `api/radars/:id?format=map&...`                                    | `RadarNodeMap`           | Map/coverage for a radar                  |
| `api/gauges/:id`                                                   | `GaugeNode`              | Rain gauge metadata                       |
| `api/gauges/:id/measures/:id`                                      | `GaugeMeasure`           | Single gauge measure                      |
| `api/gauges/:id?format=map&begin=...`                              | `GaugeNodeMap`           | Gauge data as map over time window        |
| `api/rains/:id`                                                    | `RainNode`               | Rain aggregation entity                   |
| `api/rains/:id/computations/:computationId`                        | `RainComputation`        | One computation result (list of measures) |
| `api/rains/:id/computations?format=id&begin=...`                   | `RainComputation[]`      | List of computations (IDs)                |
| `api/rains/:id/computations/:computationId?format=map`             | `RainComputationMap`     | Computation as cartesian map              |
| `api/rains/:id/computations?format=map&begin=...`                  | `RainComputationMap[]`   | List of maps over period                  |
| `api/rains/:id/computations?format=compare&begin=...&gauges=[...]` | `RainComputationQuality` | Quality/compare metrics                   |
| `api/notifications/:id`                                            | `EventNode`              | Notification/event payload                |
| `api/teams?name=customerTeam`                                      | `TeamNode`               | Team lookup by name                       |
| `api/teams/:id`                                                    | `PeopleNode`             | People related to a team                  |

### Memory Bank

This project uses a Memory Bank for comprehensive documentation and context retention. The Memory Bank is located in the
[.memory-bank](./.memory-bank) directory and contains the following files:

- `memory-bank-rules.md`: Rules to follow and to consider in all contexts
- `projectbrief.md`: Overview of the project, core requirements, and goals
- `productContext.md`: Why the project exists, problems it solves, and how it works
- `systemPatterns.md`: System architecture, key technical decisions, and design patterns
- `techContext.md`: Technologies used, development setup, and technical constraints
- `activeContext.md`: Current work focus, recent changes, and next steps
- `progress.md`: What works, what's left to build, and known issues

Note: These files are used by AI assistants whose memory resets between sessions. They MUST be reviewed at the start of
every task and kept up-to-date.

### Key Components

- `RainNode`: Rain zone
- `RadarNode`: Radar station
- `RainComputationMap`: Rain computation data
- `SpeedMatrix`: Quality matrix

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📅 Changelog

See [Changelog](./CHANGELOG.md) for version history and changes.
