import {RaainNode} from '../organizations/RaainNode';
import {Link} from '../organizations/Link';
import {RainPolarMeasureValue} from '../polars/RainPolarMeasureValue';
import {RainCartesianMeasureValue} from '../cartesians/RainCartesianMeasureValue';
import {RainComputation} from './RainComputation';

/**
 *  api/rains/:rainId/computations/:computationId
 *  or as an array on
 *  api/rains/:id/computations?format=id&begin=...
 */
export class RainComputationNode extends RainComputation {

    public static TYPE = 'rain-computation';
    // why array ? because you can have different angle from the Radar
    public results: RainPolarMeasureValue[] | RainCartesianMeasureValue[];

    // not "values" (aka Measure.values), but "results" from computation

    constructor(
        idOrObjectToCopy: string | {
            id?: string,
            periodBegin?: Date,
            periodEnd?: Date,
            links?: Link[] | RaainNode[],
            quality?: number,
            progressIngest?: number,
            progressComputing?: number,
            timeSpentInMs?: number,
            isReady?: boolean,
            isDoneDate?: Date,
            results?: RainPolarMeasureValue[] | RainCartesianMeasureValue[],
            launchedBy?: string,
            version?: string,
            rain?: RaainNode[],
            radars?: Link[] | RaainNode[],
        },
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isReady?: boolean,
        isDoneDate?: Date,
        results?: RainPolarMeasureValue[] | RainCartesianMeasureValue[],
        launchedBy?: string,
        version?: string,
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
                idOrObjectToCopy.isReady,
                idOrObjectToCopy.isDoneDate,
                idOrObjectToCopy.launchedBy,
                idOrObjectToCopy.version);

            this.setResults(idOrObjectToCopy.results);
            return;
        }

        super(idOrObjectToCopy, periodBegin, periodEnd, links, quality, progressIngest, progressComputing, timeSpentInMs,
            isReady, isDoneDate, launchedBy, version);
        this.setResults(results);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['results'] = JSON.stringify(this.results.map(r => r.toJSON()));
        return json;
    }

    protected getLinkType(): string {
        return RainComputationNode.TYPE;
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
                return new RainPolarMeasureValue(r);
            } else if (r.getPolarsStringified) {
                return new RainPolarMeasureValue(r.getPolarsStringified());
            } else if (r.polars) {
                return new RainPolarMeasureValue(r);
            }
            if (typeof r === 'string' && r.indexOf('cartesian') >= 0) {
                return new RainCartesianMeasureValue(r);
            } else if (r.getCartesianValuesStringified) {
                return new RainCartesianMeasureValue(r.getCartesianValuesStringified(), r.getCartesianPixelWidth());
            } else if (r.cartesianValues) {
                return new RainCartesianMeasureValue(r);
            } else {
                return r;
            }
        });
    }

}

