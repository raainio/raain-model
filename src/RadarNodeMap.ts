import {RadarMeasure} from "./RadarMeasure";
import {RadarNode} from "./RadarNode";
import {Link} from "./Link";

export class RadarNodeMap extends RadarNode {

    // potential result format (stored as stringified json)
    private map: string;

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        links?: Link[] | any[],
        latitude?: number,
        longitude?: number
    ) {
        super(idOrObjectToCopy, name, links, latitude, longitude);

        if (idOrObjectToCopy.map) {
            this.map = idOrObjectToCopy.map;
        }
        if (!this.map && idOrObjectToCopy.getMapData) {
            this.map = JSON.stringify(idOrObjectToCopy.getMapData());
        }
    }

    public toJSON(): Object {
        let json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
        }
        return json;
    }

    public setMapData(mapData: RadarMeasure[] | string) {
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

