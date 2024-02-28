import {PositionValue} from '../position/PositionValue';

export class PositionHistory extends PositionValue {
    public id: string;
    public label: string;
    public date: Date;
    public valueFromGauge: number;
    public valueFromRain: number;

    constructor(json: {
        id: string,
        label: string,
        date: Date,
        x: number,
        y: number,
        value: number,
        valueFromGauge?: number,
        valueFromRain?: number,
    }) {
        super(json);

        this.id = json.id;
        this.label = json.label;
        this.date = json.date;
        this.valueFromGauge = json.valueFromGauge;
        this.valueFromRain = json.valueFromRain;
    }
}
