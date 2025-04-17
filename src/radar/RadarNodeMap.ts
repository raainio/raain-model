import {RadarMeasure} from './RadarMeasure';
import {RadarNode} from './RadarNode';
import {Link, RaainNode, TeamNode} from '../organization';

/**
 *  api/radars/:radarId?format=map&...
 */
export class RadarNodeMap extends RadarNode {

    public date: Date;
    private map: string; // RadarMeasure[]; stringified

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        date: Date,
        map: RadarMeasure[] | string,
        name: string,
        description: string,
        team: string | TeamNode,
        links?: Link[] | RaainNode[],
        version?: string,
        configurationAsJSON?: string,
    }) {
        super(json);
        this.date = new Date(json.date);
        this.setMapData(json.map);
    }

    public toJSON() {
        const json = super.toJSON();
        const extendedJson = {
            ...json,
            date: this.date
        };

        if (this.map) {
            return {
                ...extendedJson,
                map: this.map
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
            if (typeof (mapData) !== 'string') {
                map = JSON.stringify(mapData);
            }
        } catch (e) {
        }
        this.map = map.toString();
    }

    public getMapData(): RadarMeasure[] {
        try {
            const parsed = JSON.parse(this.map);
            return parsed.map((m: any) => new RadarMeasure(m));
        } catch (_) {
        }
        return [];
    }
}
