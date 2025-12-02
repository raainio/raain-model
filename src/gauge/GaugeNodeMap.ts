import {Link, RaainNode, TeamNode} from '../organization';
import {GaugeNode} from './GaugeNode';
import {GaugeMeasure} from './GaugeMeasure';

/**
 * @external
 *  - API: /gauges/:gaugeId
 */
export class GaugeNodeMap extends GaugeNode {
    private map: string; // GaugeMeasure[]; stringified

    constructor(json: {
        id: string;
        latitude: number;
        longitude: number;
        name: string;
        description: string;
        team: string | TeamNode;
        configurationAsJSON?: string;
        map?: string;
        links?: Link[] | RaainNode[];
        version?: string;
    }) {
        super(json);
        this.setMapData(json.map);
    }

    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            map: this.map,
        };
    }

    public setMapData(mapData: GaugeMeasure[] | string) {
        if (!mapData) {
            return;
        }

        let map = mapData;
        try {
            if (typeof mapData !== 'string') {
                map = JSON.stringify(mapData);
            }
        } catch (_) {
            // Continue with original value if stringification fails
        }
        this.map = map.toString();
    }

    public getMapData(): GaugeMeasure[] {
        try {
            const parsed = JSON.parse(this.map);
            return parsed.map((m: any) => new GaugeMeasure(m));
        } catch (_) {
            // Return empty array if parsing fails
        }
        return [];
    }
}
