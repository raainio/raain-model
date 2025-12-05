import {PaginationResponse} from '../common';
import {RadarNode} from '../../radar';

// GET /radars response body
export interface RaainApiRadarsFindAllMineResponse extends PaginationResponse {
    radars: ReturnType<RadarNode['toJSON']>[];
}
