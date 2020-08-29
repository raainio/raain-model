import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";
import {IMeasureValue} from "./IMeasureValue";
import {PolarValues} from "./tools/PolarValues";
import {PolarValue} from "./PolarValue";

export class RainMeasureValue implements IMeasureValue {

    private polars: PolarValues;

    constructor(
        polars: any | MeasureValuePolarContainer[]
    ) {
        if (!polars) {
            throw 'RainMeasureValue needs a valid Object';
        }
        if (polars.polars) {
            if (typeof polars.polars === 'string') {
                this.setPolarsAsString(polars.polars);
            } else {
                this.setPolarsAsContainer(polars.polars);
            }
            return;
        }

        if (typeof polars === 'string') {
            this.setPolarsAsString(polars);
        } else {
            this.setPolarsAsContainer(polars);
        }
    }

    getPolarsStringified(): string {
        return this.polars.getPolarsStringified();
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.polars.getPolars();
    }

    setPolarsAsString(s: string): void {
        this.polars = new PolarValues(s);
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        this.polars = new PolarValues(s);
    }

    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue {
        return this.polars.getPolarValue(azimuthIndex, edgeIndex);
    }

    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void {
        return this.polars.setPolarValue(azimuthIndex, edgeIndex, value);
    }

    getAzimuthsCount(): number {
        return this.polars.getPolars().length;
    }

    getPolarEdgesCount(): number {
        const polars = this.polars.getPolars();
        if (polars.length > 0) {
            return polars[0].polarEdges.length;
        }
        return 0;
    }

    getDistance() : number {
        const polars = this.polars.getPolars();
        if (polars.length > 0) {
            return polars[0].distance;
        }
        return 1;
    }

    public toJSON(): Object {
        return this.polars.toJSON();
    }

    public toJSONWithPolarStringified(): Object {
        return this.polars.toJSONWithPolarStringified();
    }
}
