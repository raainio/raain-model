import {RadarPolarMeasureValue} from '../../polar';
import {RadarCartesianMeasureValue} from '../../cartesian';

// POST /radars/:radarId/measures request body
export interface RaainApiRadarsUpsertMeasureRequestBody {
    date: string;
    values:
        | ReturnType<RadarPolarMeasureValue['toJSON']>[]
        | ReturnType<RadarCartesianMeasureValue['toJSON']>[]
        | number[];
}
