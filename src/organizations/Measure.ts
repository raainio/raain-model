import {IPolarMeasureValue} from '../polars/IPolarMeasureValue';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesians/ICartesianMeasureValue';

export class Measure extends RaainNode {
    public date: Date;
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[];
    //   -> why array ? because you can have different angle from the Radar
    public validity: number;

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
        validity?: number
    ) {
        super(idOrObjectToCopy);
        if (typeof (idOrObjectToCopy) === 'object') {
            this.date = idOrObjectToCopy.date;
            this.values = idOrObjectToCopy.values;
            this.validity = idOrObjectToCopy.validity;
            return;
        }
        this.date = date;
        this.values = values;
        this.validity = validity;
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['date'] = this.date;
        json['values'] = this.values;
        json['validity'] = this.validity;
        return json;
    }
}
