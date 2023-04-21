import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;
    private polars: PolarMeasureValue;

    constructor(
        angleOrObject: any | number,
        polars?: string | MeasureValuePolarContainer[]
    ) {
        if (!angleOrObject) {
            throw new Error('RadarPolarMeasureValue needs a valid Object or ID');
        }

        if (typeof (angleOrObject.angle) !== 'undefined') {
            this.angle = angleOrObject.angle;

            if (typeof angleOrObject.polars === 'string') {
                this.setPolarsAsString(angleOrObject.polars);
            } else {
                this.setPolarsAsContainer(angleOrObject.polars);
            }
            return;
        }
        this.angle = angleOrObject;

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
        this.polars = new PolarMeasureValue(s);
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        this.polars = new PolarMeasureValue(s);
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

    getDistance(): number {
        const polars = this.polars.getPolars();
        if (polars.length > 0) {
            return polars[0].distance;
        }
        return 1;
    }

    public toJSON(): JSON {
        const json: any = this.polars.toJSON();
        json.angle = this.angle;
        return json;
    }

    public toJSONWithPolarStringified(): JSON {
        const json: any = this.polars.toJSONWithPolarStringified();
        json.angle = this.angle;
        return json;
    }
}
