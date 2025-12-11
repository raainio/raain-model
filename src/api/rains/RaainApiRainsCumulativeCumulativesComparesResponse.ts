import {RainComputationQuality} from '../../rain';

// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares response body
// For cumulative of cumulative compares (on-demand cumulative with windowInMinutes > 0)
export interface RaainApiRainsCumulativeCumulativesComparesResponse {
    qualities: Omit<
        ReturnType<RainComputationQuality['toJSON']>,
        'rain' | 'radars' | 'rainComputation' | 'links'
    >[];
}
