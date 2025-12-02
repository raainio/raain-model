import {GaugeMeasure} from '../../gauge';

// GET /gauges/:gaugeId/measures response body
export interface RaainApiGaugesFindMeasuresResponse {
    gaugeMeasures: ReturnType<GaugeMeasure['toJSON']>[];
}
