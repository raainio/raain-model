# 🌧️ RAAIN Model

[![npm version](https://badge.fury.io/js/raain-model.svg)](https://badge.fury.io/js/raain-model)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://github.com/raainio/raain-model/actions/workflows/ci.yml/badge.svg)](https://github.com/raainio/raain-model/actions)

> A TypeScript library for radar-based rain measurement and analysis, used in [radartorain.com](https://radartorain.com)
> services.

## 🌟 Features

- **Radar Data Processing**: Efficient processing of radar data for rain measurement
- **Cartesian & Polar Coordinates**: Support for both coordinate systems
- **Advanced Merging**: Sophisticated merging strategies for rain data
- **Quality Assessment**: Built-in quality metrics for measurements
- **TypeScript Support**: Full type safety and modern TypeScript features
- **Performance Optimized**: Efficient data structures and algorithms

## 🚀 Installation

```bash
npm install raain-model
# or
yarn add raain-model
```

## 📖 Quick Start

```typescript
import {RainComputationMap, RainNode, RadarNode} from 'raain-model';

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

// Process rain data
const computation = new RainComputationMap({
    id: 'comp1',
    date: new Date(),
    isReady: true,
    map: [] // Your rain measurement data here
});
```

## 📚 Documentation

Visit [documentation](https://raainio.github.io/raain-model)
and [swagger](https://api.sandbox.radartorain.com/v2/docs).

### Key Components

- `RainNode`: Core class for rain measurement nodes
- `RadarNode`: Radar station representation
- `RainComputationMap`: Advanced rain data processing
- `CartesianTools`: Utilities for coordinate transformations
- `SpeedMatrix`: Matrix operations for rain data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📅 Release Notes

See [Release notes](./RELEASE.md) for version history and changes.

## 🔗 Links

- [Website](https://radartorain.com)
- [API Documentation](https://api.sandbox.radartorain.com/docs)
- [GitHub Issues](https://github.com/raainio/raain-model/issues)
