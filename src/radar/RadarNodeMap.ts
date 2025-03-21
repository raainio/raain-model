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
        team: TeamNode,
        links?: Link[] | RaainNode[],
        version?: string,
        configurationAsJSON?: any,
    }) {
        super(json);
        this.date = new Date(json.date);
        this.setMapData(json.map);
    }

    public toJSON(): any {
        const json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
        }
        json['date'] = this.date.toISOString();
        return json;
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
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    }
}
