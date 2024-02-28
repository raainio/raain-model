import {Link} from '../organization/Link';
import {GaugeNode} from './GaugeNode';
import {GaugeMeasure} from './GaugeMeasure';
import {RaainNode} from '../organization/RaainNode';

/**
 * api/gauges/:id?format=map&begin=...
 */
export class GaugeNodeMap extends GaugeNode {

    private map: string; // GaugeMeasure[]; stringified

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        map?: string,
        name?: string,
        links?: Link[] | RaainNode[],
        version?: string,
    }) {
        super(json);
        this.setMapData(json.map);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
        }
        return json;
    }

    public setMapData(mapData: GaugeMeasure[] | string) {
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

    public getMapData(): GaugeMeasure[] {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    }
}
