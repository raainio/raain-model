// GET /rains/:rainId/counts query parameters
export interface RaainApiRainsGetCountsRequest {
    begin: string;
    range: 'year' | 'month' | 'day' | 'hour';
}
