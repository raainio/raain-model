import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';

export class Measure extends RaainNode {
    public date: Date;
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[];
    //   -> why array ? because you can have different angle from the Radar
    public validity: number;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number
                }
    ) {
        super(json);
        this.values = json.values ? json.values : [];
        this.date = json.date ? new Date(json.date) : undefined;
        this.validity = json.validity >= 0 ? json.validity : -1;
    }

    public toJSON(options: { removeValues?: boolean } = {}): JSON {
        const json = super.toJSON();
        json['date'] = this.date?.toISOString();
        json['validity'] = this.validity;

        if (!options?.removeValues) {
            json['values'] = this.values;
        }
        return json;
    }
}
