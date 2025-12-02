import {RainNode} from '../../rain';

// GET /rains/:rainId response body
export interface RaainApiRainsFindOneTimeframeCumulativeResponse {
    timeframeCumulative: ReturnType<RainNode['toJSON']>[];
}
