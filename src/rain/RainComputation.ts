import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {RainPolarMeasureValue} from '../polar/RainPolarMeasureValue';
import {RainCartesianMeasureValue} from '../cartesian/RainCartesianMeasureValue';
import {RainComputationAbstract} from './RainComputationAbstract';

/**
 *  api/rains/:rainId/computations/:computationId
 *  or as an array on
 *  api/rains/:id/computations?format=id&begin=...
 */
export class RainComputation extends RainComputationAbstract {

    public static TYPE = 'rain-computation';

    // why array ? because you can have different angle from the Radar
    public results: RainPolarMeasureValue[] | RainCartesianMeasureValue[];

    // not "values" (aka Measure.values), but "results" from computation

    constructor(json: {
        id: string,
        periodBegin: Date,
        periodEnd: Date,
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
        rain?: RaainNode[],
        radars?: Link[] | RaainNode[],

    }) {
        super(json);
        this.setResults(json.results);
    }

    public toJSON(stringify = false): JSON {
        const json = super.toJSON();
        json['results'] = this.results.map(r => r.toJSON(stringify));
        return json;
    }

    protected getLinkType(): string {
        return RainComputation.TYPE;
    }

    private setResults(results: string[] | RainPolarMeasureValue[] | RainCartesianMeasureValue[]) {
        if (typeof results === 'string') {
            results = JSON.parse(results);
        }

        if (!results || results.length === 0) {
            this.results = [];
            return;
        }

        this.results = results.map(r => {
            if (typeof r === 'string' && r.indexOf('polars') >= 0) {
                return new RainPolarMeasureValue(JSON.parse(r));
            } else if (r.polars) {
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

