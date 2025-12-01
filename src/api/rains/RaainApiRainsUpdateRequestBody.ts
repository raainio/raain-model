// PUT /rains/:rainId request body
export interface RaainApiRainsUpdateRequestBody {
    name: string;
    radars: any[];
    gauges: any[];
    configurationAsJSON: string;
    radarMeasuresToIdentifyEchoes: any[];
    radarMeasuresToLearn: any[];
    confName: string;
}
