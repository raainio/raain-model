// GET /gauges/:gaugeId query parameters
export interface RaainApiGaugesFindOneRequest {
    format: 'cartesian-map';
    begin: string;
    end: string;
}
