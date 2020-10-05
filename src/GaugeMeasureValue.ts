import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";
import {IMeasureValue} from "./IMeasureValue";
import {PolarValue} from "./PolarValue";

export class GaugeMeasureValue implements IMeasureValue {

    private polar: MeasureValuePolarContainer;

    constructor(
        polarOrObjectToCopy: string | MeasureValuePolarContainer
    ) {
        if (!polarOrObjectToCopy) {
            throw 'GaugeMeasureValue needs a valid Object or Polar';
        }

        if (typeof polarOrObjectToCopy === 'string') {
            this.setPolarsAsString(polarOrObjectToCopy);
        } else  if (polarOrObjectToCopy.toJSON) {
            this.setPolarsAsString(JSON.stringify(polarOrObjectToCopy.toJSON()));
        } else if (polarOrObjectToCopy['polars']) {
            this.setPolarsAsString(JSON.stringify(polarOrObjectToCopy['polars']));
        }

    }

    getPolarsStringified(): string {
        return JSON.stringify({polars: [this.polar.toJSON()]});
    }

    getPolars(): MeasureValuePolarContainer[] {
        return [this.polar];
    }

    setPolarsAsString(s: string): void {
        let mvpc = s;
        try {
            mvpc = JSON.parse(s);
            if (mvpc.length === 1) {
                mvpc = mvpc[0];
            }
        } catch(e) {

        }
        this.polar = new MeasureValuePolarContainer(mvpc);
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        this.polar = new MeasureValuePolarContainer(s[0]);
    }

    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue {
        if (this.polar && this.polar.azimuth === azimuthIndex && this.polar.distance === edgeIndex) {
            return this.getThePolarValue();
        }
        return null;
    }

    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void {
        this.polar = new MeasureValuePolarContainer(azimuthIndex, edgeIndex, [value]);
    }

    getThePolarValue(): PolarValue {
        return new PolarValue(this.polar.polarEdges[0], this.polar.azimuth, this.polar.distance);
    }

    public toJSON(): Object {
        return {
            "polars": this.getPolars()
        };
    }

    public toJSONWithPolarStringified(): Object {
        return {
            "polars": this.getPolarsStringified()
        };
    }
}
