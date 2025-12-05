import {RainComputationCumulative} from '../../rain';

// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId response body
export type RaainApiRainsCumulativesFindOneResponse = ReturnType<
    RainComputationCumulative['toJSON']
>;
