// GET /rains/:rainId/cumulatives query parameters
export interface RaainApiRainsCumulativesListRequest {
    windowInMinutes?: number;
    provider?: string;
    isReady?: boolean;
    forced?: boolean;
}
