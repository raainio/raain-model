import {RainComputationAbstract} from './RainComputationAbstract';
import {Link} from '../organization/Link';
import {RainMeasure} from './RainMeasure';
import {RaainNode} from '../organization/RaainNode';
import {LatLng} from '../cartesian/LatLng';
import {QualityTools} from '../quality/tools/QualityTools';

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

    public setMapData(mapData: RainMeasure[] | string, options = {
        mergeCartesian: false,
        mergeCartesianPixelWidth: new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE}),
        mergeLimitPoints: [new LatLng({lat: 0, lng: 0}), new LatLng({lat: 0, lng: 0})] as [LatLng, LatLng],
        removeNullValues: false,
    }) {
        if (!mapData) {
            return;
        }

        if (typeof (mapData) !== 'string' && options?.mergeCartesian) {
            this.buildLatLngMatrix(options);
            mapData = this.mergeRainMeasures(mapData as RainMeasure[], options);
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
