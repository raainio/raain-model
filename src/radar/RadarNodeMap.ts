import {RadarMeasure} from './RadarMeasure';
import {RadarNode} from './RadarNode';
import {Link} from '../organization/Link';
import {RaainNode} from '../organization/RaainNode';
import {TeamNode} from '../organization/TeamNode';

/**
 *  api/radars/:radarId?format=map&...
 */
export class RadarNodeMap extends RadarNode {

    public periodBegin: Date;
    public periodEnd: Date;
    private map: string; // RadarMeasure[]; stringified

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        periodBegin: Date,
        periodEnd: Date,
        map: RadarMeasure[] | string,
        name?: string,
        links?: Link[] | RaainNode[],
        team?: TeamNode,
        version?: string,
    }) {
        super(json);
        this.periodBegin = new Date(json.periodBegin);
        this.periodEnd = new Date(json.periodEnd);
        this.setMapData(json.map);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
        }
        json['periodBegin'] = this.periodBegin.toISOString();
        json['periodEnd'] = this.periodEnd.toISOString();
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
