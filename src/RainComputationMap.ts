import {RainComputationNode} from "./RainComputationNode";
import {Link} from "./Link";
import {RainMeasure} from "./RainMeasure";
import {RaainNode} from "./RaainNode";


// api/rains/:id/computations/:id?format=map&...
export class RainComputationMap extends RainComputationNode {

    // potential result format (stored as stringified json)
    private map: string;

    // public map: RainMeasure[];

    constructor(
        idOrObjectToCopy: any | string,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        version?: string,
    ) {
        super(idOrObjectToCopy, periodBegin, periodEnd, links, quality, progressIngest, progressComputing, timeSpentInMs,
            undefined, undefined, undefined, undefined, version);

        if (idOrObjectToCopy.map) {
            this.setMapData(idOrObjectToCopy.map);
        }
        if (idOrObjectToCopy.getMapData) {
            this.setMapData(idOrObjectToCopy.getMapData());
        }
    }

    public toJSON(): Object {
        let json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
            delete json['results'];
        }
        return json;
    }

    public setMapData(mapData: RainMeasure[] | string) {
        let map = mapData;
        try {
            if (typeof (mapData) !== 'string') {
                map = JSON.stringify(mapData);
            }
        } catch (e) {
        }
        this.map = map.toString();
    }

    public getMapData(): RainMeasure[] {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    }
}
