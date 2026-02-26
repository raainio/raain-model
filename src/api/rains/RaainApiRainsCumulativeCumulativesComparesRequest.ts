// GET /rains/:rainId/cumulatives/:rainComputationCumulativeId/compares query parameters
export interface RaainApiRainsCumulativeCumulativesComparesRequest {
    provider: string; // e.g. "Raain"
    timeStepInMinutes: number; // App granularity (e.g. 30), converted to windowInMinutes by raain-api
}
