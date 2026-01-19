// POST /rains/:rainId/cumulatives request body
export interface RaainApiRainsCumulativesCreateRequest {
    periodBegin: string;
    periodEnd: string;
    provider: string;
    confName?: string;
    timeStepInMinutes?: number;
    groundJobIds?: string[];
}
