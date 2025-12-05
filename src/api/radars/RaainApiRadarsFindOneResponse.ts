import {RadarNode} from '../../radar';

// GET /radars/:radarId response body
export type RaainApiRadarsFindOneResponse = ReturnType<RadarNode['toJSON']>;
