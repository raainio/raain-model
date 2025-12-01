// POST /radars/:radarId/measures request body
export interface RaainApiRadarsUpsertMeasureRequestBody {
    date: string;
    values: any[]; // TODO be more precise than 'any' type
}
