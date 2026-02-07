// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares query parameters
export interface RaainApiRainsCumulativeCumulativesComparesRequest {
    date: string; // ISO date string
    provider: string; // e.g. "Raain"
    timeStepInMinutes: number; // App granularity (e.g. 30), converted to windowInMinutes by raain-api
}
