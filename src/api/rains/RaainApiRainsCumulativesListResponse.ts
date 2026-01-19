// GET /rains/:rainId/cumulatives response
export interface CumulativePeriod {
    windowInMinutes: number;
    provider: string;
    timeStepInMinutes: number;
    periodBegin: string;
    periodEnd: string;
    count: number;
}

export interface RaainApiRainsCumulativesListResponse {
    periods: CumulativePeriod[];
    total: number;
}
