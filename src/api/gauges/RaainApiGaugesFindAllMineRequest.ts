import {PaginationRequest} from '../common';

// GET /gauges query parameters
export interface RaainApiGaugesFindAllMineRequest extends PaginationRequest {
    name: string;
    aroundLatLng: string; // new LatLng({lat, lng}).toString()
}
