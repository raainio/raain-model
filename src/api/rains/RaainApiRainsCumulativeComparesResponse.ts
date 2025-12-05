import {RainComputationQuality} from '../../rain';

// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares response body
export interface RaainApiRainsCumulativeComparesResponse {
    qualities: Omit<
        ReturnType<RainComputationQuality['toJSON']>,
        'rain' | 'radars' | 'rainComputation' | 'links'
    >[];
}
