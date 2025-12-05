import {PaginationResponse} from '../common';
import {RainNode} from '../../rain';

// GET /rains response body
export interface RaainApiRainsFindAllMineResponse extends PaginationResponse {
    rains: ReturnType<RainNode['toJSON']>[];
}
