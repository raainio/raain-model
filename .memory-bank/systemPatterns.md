# RAAIN Model System Patterns

## System Architecture
The RAAIN Model library follows a modular architecture organized around key domain concepts:

1. **Organization Layer**: Base classes and interfaces for organizational entities
   - RaainNode: Base class for all node types
   - TeamNode, PeopleNode, EventNode: Organizational entities

2. **Radar Layer**: Classes for radar stations and measurements
   - RadarNode: Represents a radar station with geographic coordinates
   - RadarMeasure: Encapsulates radar measurement data
   - RadarNodeMap: Manages collections of radar nodes

3. **Rain Layer**: Classes for rain data processing
   - RainNode: Represents a rain measurement node
     - Extends `RaainNode`
     - Manages rain data computation and configuration
     - Properties:
       - `name`: Station name
       - `description`: Optional description
       - `team`: Associated TeamNode
       - `status`: Current status number
       - `quality`: Quality metric
       - `latLngRectsAsJSON`: Geographic coverage as JSON
       - `configurationAsJSON`: Private configuration data as string (improved type safety)
     - Key Features:
       - Radar link management
       - Gauge integration
       - Geographic calculations (center, limits)
       - Computation history tracking
   - RainComputation: Processes radar data to compute rain measurements
   - RainComputationAbstract: Base class with core rain computation logic
   - RainComputationMap: Manages spatial distribution of rain computations
   - RainComputationQuality: Assesses quality of rain computations

4. **Gauge Layer**: Classes for rain gauge stations
   - GaugeNode: Represents a physical rain gauge station
     - Extends `RaainNode`
     - Properties:
       - `name`: Station name
       - `description`: Station description
       - `latitude`: Geographic latitude
       - `longitude`: Geographic longitude
       - `team`: Associated TeamNode (supports string IDs)
       - `configurationAsJSON`: Private configuration data as string (improved type safety)
     - Features:
       - Configuration management
       - Location-based services
       - Team association
   - GaugeMeasure: Encapsulates gauge measurement data
   - GaugeNodeMap: Manages collections of gauge nodes

5. **Coordinate Systems**:
   - Polar: Classes for polar coordinate representation
   - Cartesian: Classes for Cartesian coordinate representation

## Key Technical Decisions

1. **TypeScript for Type Safety**: Using TypeScript to ensure type safety and improve developer experience.

2. **Class Inheritance Hierarchy**: Implementing a clear inheritance hierarchy with base classes like RaainNode and abstract classes like RainComputationAbstract.

3. **Composition Over Inheritance**: Using composition for complex relationships between entities.

4. **JSON Serialization**: All entities support JSON serialization/deserialization for data persistence and API communication.

5. **Coordinate System Abstraction**: Abstracting coordinate systems to support both polar and Cartesian representations.

6. **Quality Metrics**: Implementing built-in quality assessment for measurements.
   - Enhanced speed matrix comparisons
   - Improved quality point calculations
   - Updated Cartesian rain history tracking
   - Refined quality measurement tools

7. **Link-based Relationships**: Using Link objects to establish relationships between entities.
   - Enhanced link handling in GaugeMeasure and RadarMeasure
   - Improved node creation with proper link handling

## Design Patterns in Use

1. **Abstract Factory**: Used for creating families of related objects.

2. **Strategy Pattern**: Implemented for different merging strategies (MergeStrategy).

3. **Composite Pattern**: Used in node hierarchies.

4. **Builder Pattern**: Used for constructing complex objects step by step.

5. **Adapter Pattern**: Used for coordinate system conversions.

6. **Observer Pattern**: Implemented for change notifications in some components.

7. **Command Pattern**: Used for encapsulating operations.

## Component Relationships

1. **RaainNode Hierarchy**:
   ```
   RaainNode
   ├── RadarNode
   ├── RainNode
   ├── GaugeNode
   ├── TeamNode
   ├── PeopleNode
   └── EventNode
   ```

2. **Measurement Value Hierarchy**:
   ```
   AbstractPolarMeasureValue
   ├── RadarPolarMeasureValue
   └── RainPolarMeasureValue

   CartesianMeasureValue
   ├── RadarCartesianMeasureValue
   └── RainCartesianMeasureValue
   ```

3. **Computation Flow**:
   ```
   RadarNode → RadarMeasure → RainComputation → RainComputationMap
   ```

4. **Quality Assessment Flow**:
   ```
   RainComputation → RainComputationQuality → Quality Metrics
   ```

5. **Coordinate Transformation Flow**:
   ```
   PolarMeasureValue ↔ CartesianMeasureValue (via transformation tools)
   ```

The architecture is designed to be flexible and extensible, allowing for the addition of new node types, measurement types, and processing strategies as needed.

## API Endpoints
- `/api/rains/:id`: Rain node management
- `/api/gauges/:id`: Gauge station management

## Data Processing
- Polar measurement filtering
- Cartesian coordinate transformations
- Quality metric calculations
