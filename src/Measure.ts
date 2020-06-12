import {RadarMeasureValue} from "./RadarMeasureValue";
import {IMeasureValue} from "./IMeasureValue";
import {RaainNode} from "./RaainNode";

export class Measure extends RaainNode {
    public date: Date;
    public values: IMeasureValue[];
    public validity: number;

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IMeasureValue[],
        validity?: number
    ) {
        super(idOrObjectToCopy);
        if (typeof(idOrObjectToCopy) === 'object') {
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
        let json = {
            "id": this.id,
            "date": this.date,
            "values": this.values,
            "validity" : this.validity
        }
        return json;
    }
}

