import {CartesianValue} from '../../cartesian/CartesianValue';

export class CartesianRainHistory {

    public date: Date;
    public computedValue: CartesianValue;

    constructor(json: {
        date: Date,
        computedValue: CartesianValue
    }) {
        this.date = json.date;
        this.computedValue = json.computedValue;
    }
}
