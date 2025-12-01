import {PaginationRequest} from '../common';

// GET /radars query parameters
export interface RaainApiRadarsFindAllMineRequest extends PaginationRequest {
    name: string;
}
