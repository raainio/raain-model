import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";
import {IMeasureValue} from "./IMeasureValue";

export class RainMeasureValue implements IMeasureValue {

    private polars: MeasureValuePolarContainer[];

    constructor(
        polars: any | MeasureValuePolarContainer[]
    ) {
        if (!polars) {
            throw 'Need a valid Object';
        }
        if (polars.polars) {
            this.setPolarsAsContainer(polars.polars);
            return;
        }
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
            "polars": this.polars
        };
    }

    public toJSONWithPolarStringified(): Object {
        return {
            "polars": this.getPolarsStringified()
        };
    }
}
