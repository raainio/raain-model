import {PaginationRequest} from '../common';
import {RadarNode} from '../../radar/RadarNode';

// GET /radars response body
export interface RaainApiRadarsFindAllMineResponse extends PaginationRequest {
    radars: ReturnType<RadarNode['toJSON']>[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
