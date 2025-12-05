import {TeamNode} from '../../organization';

// GET /teams/:teamId response body
export type RaainApiTeamsFindOneResponse = ReturnType<TeamNode['toJSON']>;
