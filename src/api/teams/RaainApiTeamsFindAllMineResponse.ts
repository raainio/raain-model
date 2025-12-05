import {PaginationResponse} from '../common';
import {TeamNode} from '../../organization';

// GET /teams response body
export interface RaainApiTeamsFindAllMineResponse extends PaginationResponse {
    teams: ReturnType<TeamNode['toJSON']>[];
}
