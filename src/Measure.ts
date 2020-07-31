import {IMeasureValue} from "./IMeasureValue";
import {RaainNode} from "./RaainNode";

export class Measure extends RaainNode {
    public date: Date;
    public values: IMeasureValue[] | number[]; // why array ? because you can have different angle for Radar
    public validity: number;

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IMeasureValue[] | number[],
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

    public toJSON(): Object {
        return {
            "id": this.id,
            "date": this.date,
            "values": this.values,
            "validity": this.validity
        };
    }
}

