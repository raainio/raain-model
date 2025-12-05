// GET /rains/:rainId/counts response body
export interface RaainApiRainsGetCountsResponse {
    counts: {
        result: Array<{
            percentImages?: number;
            percentRainy?: number;
            percentQ?: number;
            rainyCount?: number;
            rainySum?: number;
            year?: number;
            month?: number;
            day?: number;
            hour?: number;
            minute?: number;
        }>;
    };
    queueRunning: number;
}
