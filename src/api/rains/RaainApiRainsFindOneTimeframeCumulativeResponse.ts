import {RainNode} from '../../rain';

// GET /rains/:rainId?format=timeframeCumulative response body
export interface RaainApiRainsFindOneTimeframeCumulativeResponse {
    timeframeCumulative: ReturnType<RainNode['toJSON']>;
}
