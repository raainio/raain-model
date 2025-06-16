import {CartesianValue} from '../../cartesian/CartesianValue';

export class CartesianGaugeHistory {
    public gaugeId: string;
    public gaugeLabel: string;
    public date: Date;
    public value: CartesianValue;
    public configurationAsJSON: string;

    constructor(json: {
        gaugeId: string;
        gaugeLabel: string;
        date: Date;
        value: CartesianValue;
        configurationAsJSON: string;
    }) {
        this.gaugeId = json.gaugeId;
        this.gaugeLabel = json.gaugeLabel;
        this.date = json.date ? new Date(json.date) : undefined;
        this.value = json.value;
        this.configurationAsJSON = json.configurationAsJSON;
    }
}
