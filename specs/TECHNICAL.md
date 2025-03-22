# Technical Documentation

This document serves as the technical reminder for development and should be updated as implementation evolves.

## Core Components

### RainNode
- Extends `RaainNode`
- Manages rain data computation and configuration
- Properties:
  - `name`: Station name
  - `description`: Optional description
  - `team`: Associated TeamNode
  - `status`: Current status number
  - `quality`: Quality metric
  - `latLngRectsAsJSON`: Geographic coverage as JSON
  - `configurationAsJSON`: Private configuration data
- Key Features:
  - Radar link management
  - Gauge integration
  - Geographic calculations (center, limits)
  - Computation history tracking

### GaugeNode
- Extends `RaainNode`
- Represents physical rain gauge stations
- Properties:
  - `name`: Station name
  - `description`: Station description
  - `latitude`: Geographic latitude
  - `longitude`: Geographic longitude
  - `team`: Associated TeamNode
  - `configurationAsJSON`: Private configuration data
- Features:
  - Configuration management
  - Location-based services
  - Team association

### Organization Structure
- `RaainNode`: Base class for all nodes
- `TeamNode`: Team management and permissions
- `Link`: Relationship management between nodes

### Quality Management
- Enhanced speed matrix comparisons
- Improved quality point calculations
- Updated Cartesian rain history tracking
- Refined quality measurement tools

## API Endpoints
- `/api/rains/:id`: Rain node management
- `/api/gauges/:id`: Gauge station management

## Data Processing
- Polar measurement filtering
- Cartesian coordinate transformations
- Quality metric calculations
