import {RadarMeasure} from '../../radar';

// GET /radars/:radarId/measures response body
export interface RaainApiRadarsFindMeasuresResponse {
    radarMeasures: ReturnType<RadarMeasure['toJSON']>[];
}
