import {MergeStrategy, RainComputationAbstract} from './RainComputationAbstract';
import {Link} from '../organization/Link';
import {RainMeasure} from './RainMeasure';
import {RaainNode} from '../organization/RaainNode';
import {LatLng} from '../cartesian/LatLng';
import {CartesianTools} from '../cartesian/CartesianTools';

/**
 *  api/rains/:id/computations/:computationId?format=map&...
 *  or with
 *  api/rains/:id/computations?format=map&begin=...
 */
export class RainComputationMap extends RainComputationAbstract {

    protected map: string; // RainMeasure[]; stringified

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
        rain?: Link | RaainNode,
        radars?: Link[] | RaainNode[],
    }) {
        super(json);
        this.setMapData(json.map, {mergeStrategy: MergeStrategy.NONE});
    }

    public toJSON(): any {
        const json = super.toJSON();
        if (this.map) {
            json['map'] = this.map;
            delete json['results'];
        }
        return json;
    }

    public setMapData(mapData: RainMeasure[] | string, options: {
        mergeStrategy: MergeStrategy,
        cartesianTools?: CartesianTools,
        mergeLimitPoints?: [LatLng, LatLng],
        removeNullValues?: boolean,
    }) {
        if (!mapData) {
            return;
        }

        if (typeof (mapData) !== 'string' && options.mergeStrategy !== MergeStrategy.NONE
            && options?.cartesianTools && options?.mergeLimitPoints) {

            this.buildLatLngMatrix({
                cartesianTools: options.cartesianTools,
                mergeLimitPoints: options.mergeLimitPoints
            });

            mapData = this.mergeRainMeasures(mapData as RainMeasure[], {
                mergeLimitPoints: options.mergeLimitPoints,
                removeNullValues: !!options.removeNullValues,
                mergeStrategy: options.mergeStrategy,
            });
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
