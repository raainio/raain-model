import {RainComputationMap} from '../../rain';

// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/cumulative/:cumulativeHours response body
export interface RaainApiRainsCumulativeCumulativeResponse {
    cumulative?: ReturnType<RainComputationMap['toJSON']>;
}
