import {PaginationRequest} from '../common';
import {GaugeNode} from '../../gauge';

// GET /gauges response body
export interface RaainApiGaugesFindAllMineResponse extends PaginationRequest {
    gauges: ReturnType<GaugeNode['toJSON']>[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
