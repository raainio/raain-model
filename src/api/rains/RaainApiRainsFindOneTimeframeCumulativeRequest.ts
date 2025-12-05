// GET /rains/:rainId query parameters
export interface RaainApiRainsFindOneTimeframeCumulativeRequest {
    format: 'timeframeCumulative';
    begin: string;
    end: string;
    provider: string;
    timeStepInMinutes: string;
    forced?: string;
}
