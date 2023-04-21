import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';

/**
 * Gauge with single polar value container
 */
export class GaugePolarMeasureValue implements IPolarMeasureValue {

    private polar: MeasureValuePolarContainer; // polarEdges is a single point (this.polar.polarEdges[0])

    constructor(
        polarOrObjectToCopy: string | MeasureValuePolarContainer
    ) {
        if (!polarOrObjectToCopy) {
            throw new Error('GaugePolarMeasureValue needs a valid Object or Polar');
        }

        if (typeof polarOrObjectToCopy === 'string') {
            this.setPolarsAsString(polarOrObjectToCopy);
        } else if (polarOrObjectToCopy.toJSON) {
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
        } catch (e) {

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

    public toJSON(): JSON {
        return {
            'polars': this.getPolars()
        } as any;
    }

    public toJSONWithPolarStringified(): JSON {
        return {
            'polars': this.getPolarsStringified()
        } as any;
    }
}
