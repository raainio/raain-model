import {RainComputation} from './RainComputation';
import {Link} from '../organizations/Link';
import {RainMeasure} from './RainMeasure';
import {RaainNode} from '../organizations/RaainNode';

/**
 *  api/rains/:id/computations/:computationId?format=map&...
 *  or with
 *  api/rains/:id/computations?format=map&begin=...
 */
export class RainComputationMap extends RainComputation {

    private map: string; // RainMeasure[]; stringified

    constructor(
        idOrObjectToCopy: string | any,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        quality?: number,
        timeSpentInMs?: number,
        version?: string,
        map?: RainMeasure[] | string,
    ) {
        if (typeof idOrObjectToCopy !== 'string') {
            super(idOrObjectToCopy.id,
                idOrObjectToCopy.periodBegin,
                idOrObjectToCopy.periodEnd,
                idOrObjectToCopy.links,
                idOrObjectToCopy.quality,
                idOrObjectToCopy.progressIngest,
                idOrObjectToCopy.progressComputing,
                idOrObjectToCopy.timeSpentInMs,
                undefined, undefined, undefined,
                idOrObjectToCopy.version);

            this.setMapData(idOrObjectToCopy.map);
            return;
        }

        super(idOrObjectToCopy, periodBegin, periodEnd, links, quality, undefined, undefined, timeSpentInMs,
            undefined, undefined, undefined, version);

        this.setMapData(map);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
            delete json['results'];
        }
        return json;
    }

    public setMapData(mapData: RainMeasure[] | string) {
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

    public getMapData(): RainMeasure[] {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    }
}
