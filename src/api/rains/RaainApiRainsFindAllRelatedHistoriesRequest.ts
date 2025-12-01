// GET /rains/:rainId/computations query parameters
export interface RaainApiRainsFindAllRelatedHistoriesRequest {
    forced: boolean | string;
    configuration: any;
    begin: string;
    end: string;
    format: string;
    periodBegin: string;
}
