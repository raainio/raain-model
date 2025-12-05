import {RainComputationMap} from '../../rain';

// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId?format=cartesian-map response body
export interface RaainApiRainsCumulativeCartesianMapResponse {
    'cartesian-map'?: ReturnType<RainComputationMap['toJSON']>;
}
