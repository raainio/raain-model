import {RainNode} from '../../rain';

// GET /rains/:rainId response body
export type RaainApiRainsFindOneResponse = ReturnType<RainNode['toJSON']>;
