import {PaginationRequest} from '../common';

// GET /rains query parameters
export interface RaainApiRainsFindAllMineRequest extends PaginationRequest {
    name: string;
    date: string;
    latLng1: string;
    latLng2: string;
}
