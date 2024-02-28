import {CartesianValue} from '../cartesian/CartesianValue';

export class QualityPoint {

    public gaugeId: string;
    public gaugeLabel: string;
    public gaugeDate: Date;
    public rainDate: Date;
    public gaugeCartesianValue: CartesianValue;
    public rainCartesianValues: CartesianValue[];
    public speed: { x: number, y: number };

    constructor(json: {
        gaugeId: string,
        gaugeLabel: string,
        gaugeDate: Date,
        rainDate: Date,
        gaugeCartesianValue: CartesianValue,
        rainCartesianValues: CartesianValue[],
        speed: { x: number, y: number },
    }) {
        this.gaugeId = json.gaugeId;
        this.gaugeLabel = json.gaugeLabel;
        this.gaugeDate = new Date(json.gaugeDate);
        this.rainDate = new Date(json.rainDate);
        this.gaugeCartesianValue = json.gaugeCartesianValue;
        this.rainCartesianValues = json.rainCartesianValues;
        this.speed = json.speed;
    }

    getValue(): number {
        const sum = this.rainCartesianValues.reduce((prev, rcv) => prev + rcv.value, 0);
        return this.rainCartesianValues.length ? sum / this.rainCartesianValues.length : 0;
    }

    getValueLat(): number {
        return this.getMiddleValue()?.lat;
    }

    getValueLng(): number {
        return this.getMiddleValue()?.lng;
    }

    getDelta(): number {
        return Math.abs(this.gaugeCartesianValue.value - this.getValue());
    }

    getRatio(): number {

        let ratio = 0;
        if (this.getValue() === 0) {
            return ratio;
        }

        if (this.gaugeCartesianValue?.value > this.getValue()) {
            ratio = this.getValue() / this.gaugeCartesianValue.value;
        } else {
            ratio = this.gaugeCartesianValue.value / this.getValue();
        }

        return ratio;
    }

    private getMiddleValue(): CartesianValue {
        if (!this.rainCartesianValues || this.rainCartesianValues.length === 0) {
            return null;
        }

        const sortedValues = this.rainCartesianValues.sort((a, b) => {
            return (a.lat - b.lat) * (a.lng - b.lng);
        });
        const middlePos = Math.floor(sortedValues.length / 2);
        return sortedValues[middlePos];
    }

}
