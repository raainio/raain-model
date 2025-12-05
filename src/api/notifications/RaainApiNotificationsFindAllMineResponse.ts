import {PaginationResponse} from '../common';
import {EventNode} from '../../organization';

// GET /notifications response body
export interface RaainApiNotificationsFindAllMineResponse extends PaginationResponse {
    notifications: ReturnType<EventNode['toJSON']>[];
}
