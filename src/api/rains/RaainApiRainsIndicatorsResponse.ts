// GET /rains/:rainId/indicators response body
export interface QualityIndicator {
    startDate: string; // ISO date string - start of consistent period
    endDate: string; // ISO date string - end of consistent period
    cumulative: boolean;
    provider: string;
    timeStepInMinutes: number;
    version: string;
    averageQuality: number;
    count: number;
}

export interface RaainApiRainsIndicatorsResponse {
    indicators: QualityIndicator[];
}
