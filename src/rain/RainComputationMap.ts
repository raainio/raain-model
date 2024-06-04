import {RainComputationAbstract} from './RainComputationAbstract';
import {Link} from '../organization/Link';
import {RainMeasure} from './RainMeasure';
import {RaainNode} from '../organization/RaainNode';

/**
 *  api/rains/:id/computations/:computationId?format=map&...
 *  or with
 *  api/rains/:id/computations?format=map&begin=...
 */
export class RainComputationMap extends RainComputationAbstract {

    private map: string; // RainMeasure[]; stringified

    constructor(json: {
        id: string,
        date: Date,
        isReady: boolean,

        map: RainMeasure[] | string,

        links?: Link[] | RaainNode[],
        version?: string,
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isDoneDate?: Date,
        launchedBy?: string,
        rain?: RaainNode[],
        radars?: Link[] | RaainNode[],
    }) {
        super(json);
        this.setMapData(json.map);
    }

    public toJSON(): any {
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
