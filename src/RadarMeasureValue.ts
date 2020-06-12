import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";
import {IMeasureValue} from "./IMeasureValue";

export class RadarMeasureValue implements IMeasureValue {

    public angle: number;
    private polars: MeasureValuePolarContainer[];

    constructor(
        angleOrObject: any | number,
        polars?: MeasureValuePolarContainer[]
    ) {
        if (!angleOrObject) {
            throw 'Need a valid Object or ID';
        }

        if (typeof (angleOrObject.angle) !== 'undefined') {
            this.angle = angleOrObject.angle;
            this.setPolarsAsContainer(angleOrObject.polars);
            return;
        }
        this.angle = angleOrObject;
        this.setPolarsAsContainer(polars);
    }

    getPolarsStringified(): string {
        return JSON.stringify(this.getPolars());
    }

    getPolars(): MeasureValuePolarContainer[] {
        let converted: any = this.polars;
        try {
            converted = JSON.parse(converted);
        } catch (e) {
        }
        return converted;
    }

    setPolarsAsString(s: string): void {
        this.polars = JSON.parse(s);
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        let parsed: any = s;
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
        }
        this.polars = parsed;
    }

    public toJSON(): Object {
        return {
            "angle": this.angle,
            "polars": this.polars
        };
    }

    public toJSONWithPolarStringified(): Object {
        return {
            "angle": this.angle,
            "polars": this.getPolarsStringified()
        };
    }
}
