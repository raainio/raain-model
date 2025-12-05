// GET /rains/:rainId/indicators response body
export interface QualityIndicator {
    startDate: string; // ISO date string - start of consistent period
    endDate: string; // ISO date string - end of consistent period
    cumulative: boolean;
    provider: string;
    timeStepInMinutes: number;
    computingVersion: string; // Extracted from "C<version>-Q<version>"
    qualityVersion: string; // Extracted from "C<version>-Q<version>"
    averageQuality: number;
    count: number;
    lastUpdatedAt: string; // ISO date string - max(createdAt) of all records in period
}

// Indicators are sorted by lastUpdatedAt descending (most recent first)
export interface RaainApiRainsIndicatorsResponse {
    indicators: QualityIndicator[];
}
