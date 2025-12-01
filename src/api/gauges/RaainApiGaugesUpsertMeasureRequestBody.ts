// POST /gauges/:gaugeId/measures request body
export interface RaainApiGaugesUpsertMeasureRequestBody {
    date: string;
    values: number[];
}
