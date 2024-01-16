import {Link} from '../organizations/Link';
import {GaugeNode} from './GaugeNode';
import {GaugeMeasure} from './GaugeMeasure';
import {RaainNode} from '../organizations/RaainNode';

/**
 * api/gauges/:id?format=map&begin=...
 */
export class GaugeNodeMap extends GaugeNode {

    private map: string; // GaugeMeasure[]; stringified

    constructor(
        idOrObjectToCopy: string | GaugeNodeMap,
        name?: string,
        links?: Link[] | RaainNode[],
        latitude?: number,
        longitude?: number
    ) {
        super(idOrObjectToCopy, name, links, latitude, longitude);
        if (typeof idOrObjectToCopy !== 'string') {
            if (idOrObjectToCopy.map) {
                this.map = idOrObjectToCopy.map;
            }
            if (!this.map && idOrObjectToCopy.getMapData) {
                this.map = JSON.stringify(idOrObjectToCopy.getMapData());
            }
        }
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
