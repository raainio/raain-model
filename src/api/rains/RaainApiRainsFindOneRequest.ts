// GET /rains/:rainId query parameters
export interface RaainApiRainsFindOneRequest {
    format: string;
    forced: boolean | string;
    begin: string;
    end: string;
    provider: string;
    timeStepInMinutes: string;
}
