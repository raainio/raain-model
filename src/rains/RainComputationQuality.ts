import {RainComputation} from './RainComputation';
import {Link} from '../organizations/Link';
import {RaainNode} from '../organizations/RaainNode';
import {CartesianValue} from '../cartesians/CartesianValue';


/**
 *  api/rains/:id/computations?format=quality&begin=...&gauges=[...]
 */
export class RainComputationQuality extends RainComputation {

    public maximums: { rainMeasureValue: number, gaugeMeasureValue: number };
    public speed: { angleDegrees: number, speedMetersPerSec: number };
    public points: { gaugeId: string, rainCartesianValue: CartesianValue, gaugeCartesianValue: CartesianValue }[];
    public indicator: number; // be careful not == quality (which is related to the insights quality)

    constructor(
        idOrObjectToCopy: string | any,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        quality?: number,
        timeSpentInMs?: number,
        version?: string,
        maximums?: { rainMeasureValue: number, gaugeMeasureValue: number },
        speed?: { angleDegrees: number, speedMetersPerSec: number },
        points?: { gaugeId: string, rainCartesianValue: CartesianValue, gaugeCartesianValue: CartesianValue }[],
        indicator?: number
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

            this.maximums = idOrObjectToCopy.maximums;
            this.speed = idOrObjectToCopy.speed;
            this.points = idOrObjectToCopy.points;
            this.indicator = idOrObjectToCopy.indicator;

            return;
        }

        super(idOrObjectToCopy, periodBegin, periodEnd, links, quality, undefined, undefined, timeSpentInMs,
            undefined, undefined, undefined, version);

        this.maximums = maximums;
        this.speed = speed;
        this.points = points;
        this.indicator = indicator;
    }

    public toJSON(): JSON {
        const json = super.toJSON();

        json['maximums'] = this.maximums;
        json['speed'] = this.speed;
        json['points'] = this.points;
        json['indicator'] = this.indicator;
        return json;
    }

}

