import {PaginationRequest} from '../common';
import {RainNode} from '../../rain/RainNode';

// GET /rains response body
export interface RaainApiRainsFindAllMineResponse extends PaginationRequest {
    rains: ReturnType<RainNode['toJSON']>[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
