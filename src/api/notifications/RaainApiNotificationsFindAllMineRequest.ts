import {PaginationRequest} from '../common';

// GET /notifications query parameters
export interface RaainApiNotificationsFindAllMineRequest extends PaginationRequest {
    rain: string;
}
