import {RadarMeasure} from './RadarMeasure';
import {RadarNode} from './RadarNode';
import {Link, RaainNode, TeamNode} from '../organization';

export class RadarNodeMap extends RadarNode {
    public date: Date;
    private map: string; // RadarMeasure[]; stringified

    constructor(json: {
        id: string;
        latitude: number;
        longitude: number;
        date: Date;
        map: RadarMeasure[] | string;
        name: string;
        description: string;
        team: string | TeamNode;
        links?: Link[] | RaainNode[];
        version?: string;
        configurationAsJSON?: string;
    }) {
        super(json);
        this.date = json.date ? new Date(json.date) : undefined;
        this.setMapData(json.map);
    }

    public toJSON() {
        const json = super.toJSON();
        const extendedJson = {
            ...json,
            date: this.date,
        };

        if (this.map) {
            return {
                ...extendedJson,
                map: this.map,
            };
        }

        return extendedJson;
    }

    public setMapData(mapData: RadarMeasure[] | string) {
        if (!mapData) {
            return;
        }

        let map = mapData;
        try {
            if (typeof mapData !== 'string') {
                map = JSON.stringify(mapData);
            }
        } catch (e) {
            // Continue with original value if stringification fails
        }
        this.map = map.toString();
    }

    public getMapData(): RadarMeasure[] {
        try {
            const parsed = JSON.parse(this.map);
            return parsed.map((m: any) => new RadarMeasure(m));
        } catch (_) {
            // Return empty array if parsing fails
        }
        return [];
    }
}
