import {CartesianValue} from '../cartesian';

export class QualityPoint {
    public gaugeId: string;
    public gaugeLabel: string;
    public gaugeDate: Date;
    public rainDate: Date;
    public gaugeCartesianValue: CartesianValue;
    public rainCartesianValues: CartesianValue[];
    public speed: {x: number; y: number};
    public remark: string;

    constructor(json: {
        gaugeId: string;
        gaugeLabel: string;
        gaugeDate: Date;
        rainDate: Date;
        gaugeCartesianValue: CartesianValue;
        rainCartesianValues: CartesianValue[];
        speed: {x: number; y: number};
        remark: string;
    }) {
        this.gaugeId = json.gaugeId;
        this.gaugeLabel = json.gaugeLabel;
        this.gaugeDate = new Date(json.gaugeDate);
        this.rainDate = new Date(json.rainDate);
        this.gaugeCartesianValue = json.gaugeCartesianValue;
        this.rainCartesianValues = json.rainCartesianValues;
        this.speed = json.speed;
        this.remark = json.remark;
    }

    static CreateFromJSON(src: QualityPoint) {
        return new QualityPoint({
            gaugeId: src.gaugeId,
            gaugeLabel: src.gaugeLabel,
            gaugeDate: new Date(src.gaugeDate),
            rainDate: new Date(src.rainDate),
            gaugeCartesianValue: new CartesianValue(src.gaugeCartesianValue),
            rainCartesianValues: src.rainCartesianValues.map((v) => new CartesianValue(v)),
            speed: {x: src.speed?.x, y: src.speed?.y},
            remark: src.remark,
        });
    }

    getGaugeValue(): number {
        return this.gaugeCartesianValue?.value;
    }

    getRainValue(): number {
        const sum = this.rainCartesianValues.reduce((prev, rcv) => prev + rcv.value, 0);
        return this.rainCartesianValues.length ? sum / this.rainCartesianValues.length : 0;
    }

    getRainLat(): number {
        return this.getMiddleValue()?.lat;
    }

    getRainLng(): number {
        return this.getMiddleValue()?.lng;
    }

    getDelta(): number {
        const rain = this.getRainValue();
        const gauge = this.getGaugeValue();
        if (typeof rain !== 'number' || typeof gauge !== 'number') {
            return undefined;
        }
        return Math.abs(rain - gauge);
    }

    getRatio(): number {
        let ratio = 0;
        if (this.getRainValue() === 0) {
            return ratio;
        }

        if (this.getGaugeValue() > this.getRainValue()) {
            ratio = this.getRainValue() / this.getGaugeValue();
        } else {
            ratio = this.getGaugeValue() / this.getRainValue();
        }

        return ratio;
    }

    getTimeDeltaInMinutes(): number {
        const delta = this.rainDate.getTime() - this.gaugeDate.getTime();
        return Math.round(delta / 60000);
    }

    accumulateValues(qualityPoint: QualityPoint) {
        this.gaugeCartesianValue.value += qualityPoint.getGaugeValue();
        if (this.rainCartesianValues.length === 0) {
            this.rainCartesianValues = qualityPoint.rainCartesianValues.map((q) => q);
        } else {
            this.rainCartesianValues.forEach((v) => (v.value += qualityPoint.getRainValue()));
        }
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
