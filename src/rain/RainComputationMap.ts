import {RainComputationAbstract} from './RainComputationAbstract';
import {Link, RaainNode} from '../organization';
import {RainMeasure} from './RainMeasure';
import {CartesianTools, LatLng} from '../cartesian';
import {MergeStrategy} from './MergeStrategy';
import {RadarMeasure} from '../radar';
import {RaainNodeType} from '../organization/RaainNodeType';

/**
 * Represents a map-based rain computation result.
 * This class extends RainComputationAbstract to provide map-specific functionality for rain data processing.
 *
 * @example
 * ```typescript
 * const computation = new RainComputationMap({
 *   id: 'comp1',
 *   date: new Date(),
 *   isReady: true,
 *   map: [] // Your rain measurement data here
 * });
 * ```
 *
 * @remarks
 * This class is used in the following API endpoints:
 * - api/rains/:id/computations/:computationId?format=map
 * - api/rains/:id/computations?format=map&begin=...
 */
export class RainComputationMap extends RainComputationAbstract {
    public static readonly TYPE = RaainNodeType.RainComputationMap;

    /**
     * The map data stored as a stringified JSON array of RainMeasure objects.
     * This format allows for efficient storage and transmission of large datasets.
     */
    protected map: string;

    /**
     * Creates a new RainComputationMap instance.
     *
     * @param json - The configuration object containing all necessary parameters
     * @param json.id - Unique identifier for the computation
     * @param json.date - Timestamp of the computation
     * @param json.isReady - Whether the computation is ready
     * @param json.map - Array of rain measurements or stringified JSON
     * @param json.links - Optional array of related nodes or links
     * @param json.version - Optional version string
     * @param json.quality - Optional quality metric (0-1), -1 if unknown
     * @param json.progressIngest - Optional ingestion progress (0-100)
     * @param json.progressComputing - Optional computing progress (0-100)
     * @param json.timeSpentInMs - Optional computation time in milliseconds
     * @param json.isDoneDate - Optional completion timestamp
     * @param json.launchedBy - Optional user identifier
     * @param json.rain - Optional related rain node
     * @param json.radars - Optional array of related radar nodes
     */
    constructor(json: {
        id: string;
        date: Date;
        isReady: boolean;
        map: RainMeasure[] | string;
        links?: Link[] | RaainNode[];
        version?: string;
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isDoneDate?: Date;
        launchedBy?: string;
        rain?: string | Link | RaainNode;
        radars?: string[] | Link[] | RaainNode[];
        originalDBZMin?: number;
        originalDBZMax?: number;
    }) {
        super(json);
        this.setMapData(json.map, {mergeStrategy: MergeStrategy.NONE});
    }

    /**
     * Converts the computation to a JSON object.
     *
     * @returns A JSON object containing all relevant data
     * @remarks
     * This method overrides the parent class's toJSON method to handle the map property
     * and remove the results property which is not used in this implementation.
     */
    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            map: this.map,
        };
    }

    /**
     * Sets the map data with optional merging capabilities.
     *
     * @param mapData - The rain measurement data to set
     * @param options - Configuration options for data processing
     * @param options.mergeStrategy - Strategy to use when merging data
     * @param options.cartesianTools - Optional tools for coordinate transformations
     * @param options.mergeLimitPoints - Optional boundary points for merging
     * @param options.removeNullValues - Whether to remove null values during merge
     *
     * @remarks
     * This method handles both string and array inputs, and can perform merging
     * operations based on the provided options. The data is always stored internally
     * as a stringified JSON array.
     */
    public setMapData(
        mapData: RainMeasure[] | string,
        options: {
            mergeStrategy: MergeStrategy;
            cartesianTools?: CartesianTools;
            mergeLimitPoints?: [LatLng, LatLng];
            removeNullValues?: boolean;
        }
    ) {
        if (!mapData) {
            return;
        }

        if (
            typeof mapData !== 'string' &&
            options.mergeStrategy !== MergeStrategy.NONE &&
            options?.cartesianTools &&
            options?.mergeLimitPoints
        ) {
            this.buildLatLngMatrix({
                cartesianTools: options.cartesianTools,
                mergeLimitPoints: options.mergeLimitPoints,
            });

            mapData = this.mergeRainMeasures(mapData as RainMeasure[], {
                mergeLimitPoints: options.mergeLimitPoints,
                removeNullValues: !!options.removeNullValues,
                mergeStrategy: options.mergeStrategy,
            });
        }

        this.map = typeof mapData === 'string' ? mapData : JSON.stringify(mapData);
    }

    public getMapData(): RainMeasure[] {
        try {
            const parsed = JSON.parse(this.map);
            return parsed.map((m: any) => new RadarMeasure(m));
        } catch (_) {
            // Return empty array if parsing fails
        }
        return [];
    }

    protected getLinkType(): RaainNodeType {
        return RainComputationMap.TYPE;
    }
}
