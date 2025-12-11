// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares query parameters
// For cumulative of cumulative compares (on-demand cumulative)
export interface RaainApiRainsCumulativeCumulativesComparesRequest {
    date: string; // ISO date string
    cumulativeHours: number; // Cumulative window in hours (converted to windowInMinutes = cumulativeHours * 60)
}
