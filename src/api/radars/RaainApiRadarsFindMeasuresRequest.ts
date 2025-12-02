// GET /radars/:radarId/measures query parameters
export interface RaainApiRadarsFindMeasuresRequest {
    begin: string;
    end: string;
    withValues: string;
}
