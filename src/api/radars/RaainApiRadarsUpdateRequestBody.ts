import {RadarNode} from '../../radar';

// PUT /radars/:radarId request body
export type RaainApiRadarsUpdateRequestBody = Partial<
    Omit<
        ReturnType<RadarNode['toJSON']>,
        'id' | 'team' | 'configurationAsJSON' | 'links' | 'version'
    >
>;
