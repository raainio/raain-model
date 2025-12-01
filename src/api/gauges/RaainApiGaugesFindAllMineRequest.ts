import {PaginationRequest} from '../common';

// GET /gauges query parameters
export interface RaainApiGaugesFindAllMineRequest extends PaginationRequest {
    name: string;
    aroundLatLng: string; // "lat,lng" format
}
