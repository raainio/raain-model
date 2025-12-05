import {PaginationResponse} from '../common';
import {GaugeNode} from '../../gauge';

// GET /gauges response body
export interface RaainApiGaugesFindAllMineResponse extends PaginationResponse {
    gauges: ReturnType<GaugeNode['toJSON']>[];
}
