import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
import {MeasureConfiguration} from '../configuration/MeasureConfiguration';

export class Measure extends RaainNode {
    public date: Date;
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[];
    //   -> why array ? because you can have potential different angle from the Radar

    public validity: number
    private configurationAsJSON: string;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number,
                    configurationAsJSON?: string | MeasureConfiguration,
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

    public toJSON(options: { removeValues?: boolean } = {}): JSON {
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
