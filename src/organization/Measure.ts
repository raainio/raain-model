import {IPolarMeasureValue} from '../polar';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian';

export class Measure extends RaainNode {
    public date: Date;
    //   -> why array ? because you have different angle/axis from the Radar
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
    public validity: number;

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string;
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
        date?: Date;
        validity?: number;
        configurationAsJSON?: string;
        version?: string;
    }) {
        super(json);
        this.values = json.values ? json.values : [];
        this.date = json.date ? new Date(json.date) : undefined;
        this.validity = json.validity >= 0 ? json.validity : -1;
        this.setConfiguration(json.configurationAsJSON);
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
            // Ignore parsing errors, use the original value
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public toJSON(options: {removeValues?: boolean} = {}) {
        const json = super.toJSON();
        const extendedJson = {
            ...json,
            date: this.date,
            validity: this.validity,
            configurationAsJSON: this.configurationAsJSON,
            values: [] as IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
        };

        if (options?.removeValues) {
            return extendedJson;
        }

        return {
            ...extendedJson,
            values: this.values,
        };
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
            // Return null if configuration cannot be parsed
        }
        return null;
    }
}
