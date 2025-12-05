// GET /rains/:rainId/providers response body
export interface RaainApiRainsProvidersResponse {
    providers: string[];
    timeStepInMinutes: number[];
}
