import {Link, RaainNode, RaainNodeType} from '../organization';
import {RainCartesianMeasureValue} from '../cartesian';
import {RainComputationAbstract} from './RainComputationAbstract';

/**
 * @external
 *  - API: /rains/:rainId/cumulatives/:rainComputationCumulativeId
 *  - API: /rains/:rainId/cumulatives/:rainComputationCumulativeId/cumulative/:cumulativeHours
 */
export class RainComputationCumulative extends RainComputationAbstract {
    public static TYPE = RaainNodeType.RainComputationCumulative;

    public provider: string;
    // cumulative period (60 x N minutes to get hours of cumulative)
    // meaning that => this.date - this.windowInMinutes = beginning of the period
    public windowInMinutes: number;
    // comparison time step
    public timeStepInMinutes: number;

    constructor(json: {
        id: string;
        date: Date;
        isReady: boolean;
        cumulative: RainCartesianMeasureValue;
        provider: string;
        windowInMinutes: number;

        timeStepInMinutes?: number;

        links?: Link[] | RaainNode[];
        version?: string;
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isDoneDate?: Date | string;
        launchedBy?: string;
        rain?: string | Link | RaainNode;
        radars?: string[] | Link[] | RaainNode[];
        originalDBZMin?: number;
        originalDBZMax?: number;
    }) {
        super(json);
        this.windowInMinutes = json.windowInMinutes;
        this.provider = json.provider;
        this.cumulative = json.cumulative;
        this.timeStepInMinutes =
            typeof json.timeStepInMinutes !== 'undefined'
                ? json.timeStepInMinutes
                : json.windowInMinutes;
    }

    protected _cumulative?: RainCartesianMeasureValue;

    public get cumulative() {
        return this._cumulative;
    }

    public set cumulative(cumulative: RainCartesianMeasureValue | undefined) {
        if (cumulative) {
            this._cumulative = new RainCartesianMeasureValue(cumulative as any);
        }
    }

    public toJSON(options = {stringify: false}) {
        const json = super.toJSON();
        return {
            ...json,
            provider: this.provider,
            timeStepInMinutes: this.timeStepInMinutes,
            windowInMinutes: this.windowInMinutes,
            cumulative: this._cumulative?.toJSON(options),
        };
    }

    protected getLinkType(): RaainNodeType {
        return RainComputationCumulative.TYPE;
    }
}
