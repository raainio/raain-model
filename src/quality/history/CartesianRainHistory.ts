import {CartesianValue} from '../../cartesian';

export class CartesianRainHistory {

    public date: Date;
    public computedValue: CartesianValue;

    constructor(json: {
        date: Date,
        computedValue: CartesianValue
    }) {
        this.date = json.date ? new Date(json.date) : undefined;
        this.computedValue = json.computedValue;
    }
}
