import {Link, RaainNode, TeamNode} from '../organization';

/**
 * Represents a rain gauge station in the RAAIN system.
 * This class manages gauge data collection and configuration.
 *
 * @remarks
 * Used in the API endpoint: api/gauges/:id
 *
 * @example
 * ```typescript
 * const gaugeNode = new GaugeNode({
 *   id: 'gauge1',
 *   latitude: 48.8566,
 *   longitude: 2.3522,
 *   name: 'Paris Gauge',
 *   team: teamNode,
 *   description: 'Main rain gauge station'
 * });
 * ```
 */
export class GaugeNode extends RaainNode {
    /** Type identifier for gauge nodes */
    public static TYPE = 'gauge';

    /** Name of the gauge station */
    public name: string;

    /** Description of the gauge station */
    public description: string;

    /** Latitude of the gauge station */
    public latitude: number;

    /** Longitude of the gauge station */
    public longitude: number;

    /** Associated team */
    public team: TeamNode;

    /** Internal configuration storage */
    private configurationAsJSON: string;

    /**
     * Creates a new GaugeNode instance.
     *
     * @param json - Configuration object
     * @param json.id - Unique identifier
     * @param json.latitude - Latitude of the gauge station
     * @param json.longitude - Longitude of the gauge station
     * @param json.name - Name of the gauge station
     * @param json.team - Associated team
     * @param json.description - Optional description
     * @param json.links - Optional array of links
     * @param json.version - Optional version string
     * @param json.configurationAsJSON - Optional configuration object
     */
    constructor(json: {
        id: string;
        latitude: number;
        longitude: number;
        name: string;
        team: string | TeamNode;
        description?: string;
        links?: Link[] | RaainNode[];
        version?: string;
        configurationAsJSON?: string;
    }) {
        super(json);
        this.latitude = json.latitude;
        this.longitude = json.longitude;
        this.name = json.name;
        this.description = json.description;
        this.team = json.team as TeamNode;
        if (typeof json.team === 'string') {
            this.team = new TeamNode({id: json.team});
        }
        this.setConfiguration(json.configurationAsJSON);
    }

    /**
     * Sets the configuration for the gauge node.
     *
     * @param configuration - Configuration object or JSON string
     */
    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
            // Ignore parsing errors, use the original value
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    /**
     * Gets the configuration of the gauge node.
     *
     * @returns The configuration object or null if not set
     */
    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
            // Return null if configuration cannot be parsed
        }
        return null;
    }

    /**
     * Converts the gauge node to a JSON object.
     *
     * @returns A JSON object containing the gauge node's data
     */
    public toJSON() {
        const json = super.toJSON();

        return {
            ...json,
            name: this.name,
            description: this.description,
            latitude: this.latitude,
            longitude: this.longitude,
            team: this.team?.id || this.team,
            configurationAsJSON: this.configurationAsJSON,
        };
    }

    /**
     * Returns the link type for gauge nodes.
     *
     * @returns The string 'gauge'
     */
    protected getLinkType(): string {
        return GaugeNode.TYPE;
    }
}
