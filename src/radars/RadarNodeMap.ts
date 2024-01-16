import {RadarMeasure} from './RadarMeasure';
import {RadarNode} from './RadarNode';
import {Link} from '../organizations/Link';
import {RaainNode} from '../organizations/RaainNode';

/**
 *  api/radars/:radarId?format=map&...
 */
export class RadarNodeMap extends RadarNode {

    public periodBegin: Date;
    public periodEnd: Date;
    private map: string; // RadarMeasure[]; stringified

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        latitude?: number,
        longitude?: number,
        map?: RadarMeasure[] | string,
        version?: string,
    ) {

        if (typeof idOrObjectToCopy !== 'string') {
            super(idOrObjectToCopy.id,
                idOrObjectToCopy.name,
                idOrObjectToCopy.links,
                idOrObjectToCopy.latitude,
                idOrObjectToCopy.longitude,
                idOrObjectToCopy.version);

            this.setMapData(idOrObjectToCopy.map);
            this.periodBegin = new Date(idOrObjectToCopy.periodBegin);
            this.periodEnd = new Date(idOrObjectToCopy.periodEnd);
            return;
        }

        super(idOrObjectToCopy, name, links, latitude, longitude, version);
        this.setMapData(map);
        this.periodBegin = new Date(periodBegin);
        this.periodEnd = new Date(periodEnd);
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
