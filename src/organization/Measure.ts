import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';

export class Measure extends RaainNode {
    public date: Date;
    //   -> why array ? because you have different angle/axis from the Radar
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
    public validity: number

    // internal
    private configurationAsJSON: string;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
                    date?: Date,
                    validity?: number,
                    configurationAsJSON?: string,
                }
    ) {
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
        }

        this.configurationAsJSON = JSON.stringify(conf);
    }

    public toJSON(options: { removeValues?: boolean } = {}): any {
        const json = super.toJSON();
        json['date'] = this.date?.toISOString();
        json['validity'] = this.validity;
        json['configurationAsJSON'] = this.configurationAsJSON;

        if (!options?.removeValues) {
            json['values'] = this.values;
        }
        return json;
    }
}
