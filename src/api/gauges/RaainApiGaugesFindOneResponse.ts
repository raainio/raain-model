import {GaugeNode} from '../../gauge';

// GET /gauges/:gaugeId response body
export type RaainApiGaugesFindOneResponse = ReturnType<GaugeNode['toJSON']>;
