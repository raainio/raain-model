import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {RainPolarMeasureValue} from '../polar/RainPolarMeasureValue';
import {RainCartesianMeasureValue} from '../cartesian/RainCartesianMeasureValue';
import {RainComputationAbstract} from './RainComputationAbstract';
import {LatLng} from '../cartesian/LatLng';
import {RainMeasure} from './RainMeasure';

/**
 *  api/rains/:rainId/computations/:computationId
 *  or as an array on
 *  api/rains/:id/computations?format=id&begin=...
 */
export class RainComputation extends RainComputationAbstract {

    public static TYPE = 'rain-computation';

    // why "results" ? because "values" came from Measure.values, "results" came from computation
    // why array ? because you can have different angle/axis from the Radar
    public results: RainPolarMeasureValue[] | RainCartesianMeasureValue[];

    constructor(json: {
        id: string,
        date: Date,
        isReady: boolean,
        results: RainPolarMeasureValue[] | RainCartesianMeasureValue[],
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
        this.setResults(json.results);
    }

    public toJSON(options = {
        stringify: false
    }): any {
        const json = super.toJSON();
        json['results'] = this.results.map(r => r.toJSON(options));
        return json;
    }

    mergeCartesianResults(options: {
        mergeCartesianPixelWidth: LatLng,
        mergeLimitPoints: [LatLng, LatLng],
        removeNullValues?: boolean,
    }) {
        this.buildLatLngMatrix(options);
        const values = this.results;
        return this.mergeRainMeasures([new RainMeasure({
            id: this.id,
            values,
            date: this.date
        })], options);
    }

    protected getLinkType(): string {
        return RainComputation.TYPE;
    }

    private setResults(results: string[] | RainPolarMeasureValue[] | RainCartesianMeasureValue[]) {
        if (typeof results === 'string') {
            results = JSON.parse(results);
        }

        if (!results || results.length === 0 || !Array.isArray(results)) {
            this.results = [];
            return;
        }

        this.results = results.map(r => {
            if (typeof r === 'string' && r.indexOf('polarMeasureValue') >= 0) {
                return new RainPolarMeasureValue(JSON.parse(r));
            } else if (r.polarMeasureValue) {
                return new RainPolarMeasureValue(r);
            }
            if (typeof r === 'string' && r.indexOf('cartesian') >= 0) {
                return new RainCartesianMeasureValue(JSON.parse(r));
            } else if (r.cartesianValues) {
                return new RainCartesianMeasureValue(r);
            } else {
                return r;
            }
        });
    }

}
