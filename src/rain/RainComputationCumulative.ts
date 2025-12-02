import {Link, RaainNode} from '../organization';
import {RainCartesianMeasureValue} from '../cartesian';
import {RainComputationAbstract} from './RainComputationAbstract';
import {RaainNodeType} from '../organization/RaainNodeType';

/**
 * @external
 *  - API: /rains/:rainId/cumulatives/:rainComputationCumulativeId
 *  - API: /rains/:rainId/cumulatives/:rainComputationCumulativeId/cumulative/:cumulativeHours
 */
export class RainComputationCumulative extends RainComputationAbstract {
    public static TYPE = RaainNodeType.RainComputationCumulative;

    public provider: string;
    public timeStepInMinutes: number;

    constructor(json: {
        id: string;
        date: Date;
        isReady: boolean;
        cumulative: RainCartesianMeasureValue;
        provider: string;
        timeStepInMinutes: number;

        links?: Link[] | RaainNode[];
        version?: string;
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isDoneDate?: Date;
        launchedBy?: string;
        rain?: string | Link | RaainNode;
        radars?: string[] | Link[] | RaainNode[];
        originalDBZMin?: number;
        originalDBZMax?: number;
    }) {
        super(json);
        this.timeStepInMinutes = json.timeStepInMinutes;
        this.provider = json.provider;
        this.cumulative = json.cumulative;
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
            cumulative: this._cumulative?.toJSON(options),
        };
    }

    protected getLinkType(): RaainNodeType {
        return RainComputationCumulative.TYPE;
    }
}
