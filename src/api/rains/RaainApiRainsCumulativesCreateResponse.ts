// POST /rains/:rainId/cumulatives response
export interface RaainApiRainsCumulativesCreateResponse {
    postJobId: string;
    getJobId: string;
    groundJobIds?: string[];
    cumulativeWindowInMinutes: number;
}
