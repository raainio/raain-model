import {PaginationRequest} from '../common';

// GET /teams query parameters (for user's teams)
export interface RaainApiTeamsFindAllMineRequest extends PaginationRequest {
    name?: string;
}
