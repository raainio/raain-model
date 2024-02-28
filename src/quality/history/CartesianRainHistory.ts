import {CartesianValue} from '../../cartesian/CartesianValue';

export class CartesianRainHistory {

    public periodBegin: Date;
    public periodEnd: Date;
    public computedValue: CartesianValue;

    constructor(json: {
        periodBegin: Date,
        periodEnd: Date,
        computedValue: CartesianValue
    }) {
        this.periodBegin = json.periodBegin;
        this.periodEnd = json.periodEnd;
        this.computedValue = json.computedValue;
    }
}
