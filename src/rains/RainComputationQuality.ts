import {RainComputation} from './RainComputation';
import {Link} from '../organizations/Link';
import {RaainNode} from '../organizations/RaainNode';
import {CartesianValue} from '../cartesians/CartesianValue';
import {QualityPoint} from '../organizations/QualityPoint';


/**
 *  api/rains/:id/computations?format=compare&begin=...&gauges=[...]
 */
export class RainComputationQuality extends RainComputation {

    public maximums: { rainMeasureValue: number, gaugeMeasureValue: number };
    public speed: { angleDegrees: number, speedMetersPerSec: number };
    public points: QualityPoint[];
    public pointsHistory: QualityPoint[];
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
        points?: { // see raain-quality > QualityPoint[]
            gaugeId: string,
            gaugeDate: Date,
            rainDate: Date,
            gaugeCartesianValue: CartesianValue,
            rainCartesianValue: CartesianValue
        }[],
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
            this.pointsHistory = idOrObjectToCopy.pointsHistory;
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

    merge(rainComputationQuality: RainComputationQuality) {

        this.periodBegin = this.mergeDateMin(this.periodBegin, rainComputationQuality.periodBegin);
        this.periodEnd = this.mergeDateMax(this.periodEnd, rainComputationQuality.periodEnd);
        this.quality = this.mergeAvg(this.quality, rainComputationQuality.quality);
        this.progressIngest = this.mergeMin(this.progressIngest, rainComputationQuality.progressIngest);
        this.progressComputing = this.mergeMin(this.progressComputing, rainComputationQuality.progressComputing);
        this.timeSpentInMs = this.mergeSum(this.timeSpentInMs, rainComputationQuality.timeSpentInMs);

        this.maximums = {
            gaugeMeasureValue: this.mergeMax(this.maximums?.gaugeMeasureValue, rainComputationQuality.maximums?.gaugeMeasureValue),
            rainMeasureValue: this.mergeMax(this.maximums?.rainMeasureValue, rainComputationQuality.maximums?.rainMeasureValue)
        };
        this.speed = {
            angleDegrees: this.mergeAvg(this.speed?.angleDegrees, rainComputationQuality.speed?.angleDegrees),
            speedMetersPerSec: this.mergeAvg(this.speed?.speedMetersPerSec, rainComputationQuality.speed?.speedMetersPerSec)
        };
        this.points = this.mergeConcat(this.points, rainComputationQuality.points);
        this.indicator = this.mergeAvg(this.indicator, rainComputationQuality.indicator);

        if (this.pointsHistory && rainComputationQuality.pointsHistory) {
            this.pointsHistory = this.mergeConcat(this.pointsHistory, rainComputationQuality.pointsHistory);
        }

    }

    public toJSON(): JSON {
        const json = super.toJSON();

        json['maximums'] = this.maximums;
        json['speed'] = this.speed;
        json['points'] = this.points;
        json['indicator'] = this.indicator;
        if (this.pointsHistory) {
            json['pointsHistory'] = this.pointsHistory;
        }

        return json;
    }

    protected mergeStillComputed(v1: any, v2: any): any {
        if (!v1 && !v2) {
            return undefined;
        }
        if (!v1) {
            return v2;
        }
        if (!v2) {
            return v1;
        }
        return null;
    }

    protected mergeDateMin(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.min(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected mergeDateMax(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.max(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected mergeAvg(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return (v1 + v2) / 2;
        }
        return stillComputed;
    }

    protected mergeMin(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return Math.min(v1, v2);
        }
        return stillComputed;
    }

    protected mergeMax(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return Math.max(v1, v2);
        }
        return stillComputed;
    }

    protected mergeSum(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return v1 + v2;
        }
        return stillComputed;
    }

    protected mergeConcat(a1: Array<any>, a2: Array<any>): Array<any> {
        const stillComputed = this.mergeStillComputed(a1, a2);
        if (stillComputed === null) {
            return a1.concat(a2);
        }
        return stillComputed;
    }

}

