import {RainComputation} from './RainComputation';
import {Link} from '../organizations/Link';
import {RaainNode} from '../organizations/RaainNode';


/**
 *  api/rains/:id/computations?format=compare&begin=...&gauges=[...]
 */
export class RainComputationQuality extends RainComputation {

    public maximums: { rainMeasureValue: number, gaugeMeasureValue: number };
    public qualitySpeedMatrixContainer: any; // TODO align with raain-quality > SpeedMatrixContainer

    constructor(
        idOrObjectToCopy: string | any,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        timeSpentInMs?: number,
        version?: string,
        qualitySpeedMatrixContainer?: any
    ) {
        if (typeof idOrObjectToCopy !== 'string') {
            super(idOrObjectToCopy.id,
                idOrObjectToCopy.periodBegin,
                idOrObjectToCopy.periodEnd,
                idOrObjectToCopy.links,
                undefined,
                idOrObjectToCopy.progressIngest,
                idOrObjectToCopy.progressComputing,
                idOrObjectToCopy.timeSpentInMs,
                undefined, undefined, undefined,
                idOrObjectToCopy.version);

            this.qualitySpeedMatrixContainer = idOrObjectToCopy.qualitySpeedMatrixContainer;

            return;
        }

        super(idOrObjectToCopy, periodBegin, periodEnd, links, undefined, undefined, undefined, timeSpentInMs,
            undefined, undefined, undefined, version);

        this.qualitySpeedMatrixContainer = qualitySpeedMatrixContainer;
    }

    merge(rainComputationQuality: RainComputationQuality) {

        this.periodBegin = this.mergeDateMin(this.periodBegin, rainComputationQuality.periodBegin);
        this.periodEnd = this.mergeDateMax(this.periodEnd, rainComputationQuality.periodEnd);
        this.quality = this.mergeAvg(this.quality, rainComputationQuality.quality);
        this.progressIngest = this.mergeMin(this.progressIngest, rainComputationQuality.progressIngest);
        this.progressComputing = this.mergeMin(this.progressComputing, rainComputationQuality.progressComputing);
        this.timeSpentInMs = this.mergeSum(this.timeSpentInMs, rainComputationQuality.timeSpentInMs);

        if (this.qualitySpeedMatrixContainer && this.qualitySpeedMatrixContainer.merge) {
            this.qualitySpeedMatrixContainer = this.qualitySpeedMatrixContainer.merge(rainComputationQuality.qualitySpeedMatrixContainer);
        }

    }

    public toJSON(arg?): JSON {
        const json = super.toJSON();

        if (this.qualitySpeedMatrixContainer && this.qualitySpeedMatrixContainer.toJSON) {
            json['qualitySpeedMatrixContainer'] = this.qualitySpeedMatrixContainer.toJSON(arg);
        } else if (this.qualitySpeedMatrixContainer) {
            json['qualitySpeedMatrixContainer'] = this.qualitySpeedMatrixContainer;
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

