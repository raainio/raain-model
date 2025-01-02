import {RainComputationAbstract} from './RainComputationAbstract';
import {Link} from '../organization/Link';
import {RainMeasure} from './RainMeasure';
import {RaainNode} from '../organization/RaainNode';
import {CartesianValue} from '../cartesian/CartesianValue';
import {RainCartesianMeasureValue} from '../cartesian/RainCartesianMeasureValue';
import {LatLng} from '../cartesian/LatLng';
import {QualityTools} from '../quality/tools/QualityTools';
import {CartesianMeasureValue} from '../cartesian/CartesianMeasureValue';

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

    public setMapData(mapData: RainMeasure[] | string, options = {mergeCartesian: false}) {
        if (!mapData) {
            return;
        }

        if (typeof (mapData) !== 'string' && options?.mergeCartesian) {
            const rainMeasures = mapData as RainMeasure[];
            let rainMeasuresMerged = [];
            const cartesianValuesMerged: CartesianValue[] = [];
            let cartesianPixelWidth = new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE});
            for (const rainMeasure of rainMeasures) {
                for (const value of rainMeasure.values) {
                    if (typeof value['cartesianValues'] !== 'undefined' && typeof value['cartesianPixelWidth'] !== 'undefined') {
                        const cartesianMeasureValue = new CartesianMeasureValue(value as any);
                        const cartesianValues = cartesianMeasureValue.getCartesianValues();
                        cartesianPixelWidth = cartesianMeasureValue.getCartesianPixelWidth();
                        for (const cartesianValue of cartesianValues) {

                            const alreadyExist = cartesianValuesMerged.filter(v => cartesianValue.equals(v))
                            if (alreadyExist.length === 1) {
                                alreadyExist[0].value += cartesianValue.value;
                            } else {
                                cartesianValuesMerged.push(new CartesianValue(cartesianValue.toJSON()));
                            }
                        }
                    }
                }

                const rm = new RainMeasure(rainMeasure.toJSON());
                rm.values = [new RainCartesianMeasureValue({cartesianValues: cartesianValuesMerged, cartesianPixelWidth})];
                rainMeasuresMerged = [rm];
            }

            mapData = rainMeasuresMerged;
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
