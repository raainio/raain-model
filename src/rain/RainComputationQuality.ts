import {RainComputationAbstract} from './RainComputationAbstract';
import {Link, RaainNode, RaainNodeType} from '../organization';
import {SpeedMatrixContainer} from '../quality';
import {RainComputation} from './RainComputation';

/**
 * @external
 *  - API: /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares
 */
export class RainComputationQuality extends RainComputationAbstract {
    public static readonly TYPE = RaainNodeType.RainComputationQuality;
    public qualitySpeedMatrixContainer: SpeedMatrixContainer;
    public error: string;

    constructor(json: {
        id: string;
        date: Date | string;
        isReady: boolean;
        qualitySpeedMatrixContainer: SpeedMatrixContainer;

        links?: Link[] | RaainNode[];
        version?: string;
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isDoneDate?: Date | string;
        launchedBy?: string;
        rain?: Link | RaainNode;
        radars?: Link[] | RaainNode[];
        rainComputation?: Link | RaainNode;
        error?: string;
        originalDBZMin?: number;
        originalDBZMax?: number;
    }) {
        super(json);
        this.qualitySpeedMatrixContainer = json.qualitySpeedMatrixContainer;
        this.addRainComputationLink(json.rainComputation);
        this.error = json.error;
    }

    private static _getRainComputationLinks(linkToPurify: any): any[] {
        if (!linkToPurify) {
            return [];
        }

        if (linkToPurify instanceof Link) {
            return [linkToPurify];
        } else if (linkToPurify['_id']) {
            return [
                new RainComputation({
                    id: linkToPurify['_id'].toString(),
                    date: linkToPurify.date,
                    version: linkToPurify.version,
                    isReady: true,
                    results: [], // useless
                }),
            ];
        } else if (linkToPurify.id) {
            return [
                new RainComputation({
                    id: linkToPurify.id.toString(),
                    date: linkToPurify.date,
                    version: linkToPurify.version,
                    isReady: true,
                    results: [], // useless
                }),
            ];
        }
        return [];
    }

    public addRainComputationLink(linkToAdd: Link | RaainNode): void {
        this.addLinks(RainComputationQuality._getRainComputationLinks(linkToAdd));
    }

    merge(rainComputationQuality: RainComputationQuality) {
        this.date = this.mergeDateMin(this.date, rainComputationQuality.date);
        this.quality = this.mergeAvg(this.quality, rainComputationQuality.quality);
        this.progressIngest = this.mergeMin(
            this.progressIngest,
            rainComputationQuality.progressIngest
        );
        this.progressComputing = this.mergeMin(
            this.progressComputing,
            rainComputationQuality.progressComputing
        );
        this.timeSpentInMs = this.mergeSum(
            this.timeSpentInMs,
            rainComputationQuality.timeSpentInMs
        );

        if (this.qualitySpeedMatrixContainer && this.qualitySpeedMatrixContainer.merge) {
            this.qualitySpeedMatrixContainer = this.qualitySpeedMatrixContainer.merge(
                rainComputationQuality.qualitySpeedMatrixContainer
            );
        }
    }

    public toJSON(arg?: any) {
        const json = super.toJSON();
        const extendedJson = {
            ...json,
            qualitySpeedMatrixContainer: this.qualitySpeedMatrixContainer as any,
            rainComputation: '',
            error: this.error ?? '',
        };

        if (this.qualitySpeedMatrixContainer?.toJSON) {
            extendedJson.qualitySpeedMatrixContainer = this.qualitySpeedMatrixContainer.toJSON(arg);
        }

        const rainComputationLink = this.getLink(RainComputation.TYPE);
        if (rainComputationLink) {
            extendedJson.rainComputation = rainComputationLink.getId();
        }

        return extendedJson;
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

    protected getLinkType(): RaainNodeType {
        return RainComputationQuality.TYPE;
    }
}
