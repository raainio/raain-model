import {CartesianValue} from '../../cartesian/CartesianValue';

export class CartesianGaugeHistory {
    public gaugeId: string;
    public gaugeLabel: string;
    public date: Date;
    public value: CartesianValue;

    constructor(json: {
        gaugeId: string,
        gaugeLabel: string,
        date: Date,
        value: CartesianValue
    }) {
        this.gaugeId = json.gaugeId;
        this.gaugeLabel = json.gaugeLabel;
        this.date = json.date;
        this.value = json.value;
    }
}
