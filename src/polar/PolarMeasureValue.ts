import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';

export class PolarMeasureValue implements IPolarMeasureValue {

    private measureValuePolarContainers: MeasureValuePolarContainer[];

    constructor(json: {
        measureValuePolarContainers: MeasureValuePolarContainer[] | string
    }) {
        if (typeof json.measureValuePolarContainers === 'string') {
            this.setPolarsAsString(json.measureValuePolarContainers);
            return;
        }

        if (json.measureValuePolarContainers instanceof AbstractPolarMeasureValue
            || json.measureValuePolarContainers instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(json.measureValuePolarContainers.getPolars());
            return;
        }

        this.setPolarsAsContainer(json.measureValuePolarContainers);
    }

    getPolarsStringified(): string {
        return JSON.stringify(this.getPolars());
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.measureValuePolarContainers;
    }

    setPolarsAsString(s: string): void {
        try {
            let polars = JSON.parse(s);

            if (polars && polars.measureValuePolarContainers) {
                polars = polars.measureValuePolarContainers;
            }

            if (typeof polars === 'string') {
                polars = JSON.parse(polars);
            }

            this.measureValuePolarContainers = polars.map(convertedPolar => new MeasureValuePolarContainer(convertedPolar));
        } catch (e) {
            // console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.measureValuePolarContainers = [];
        }
    }

    setPolarsAsContainer(measureValuePolarContainers: MeasureValuePolarContainer[]): void {
        let parsed: any = measureValuePolarContainers ? measureValuePolarContainers : [];
        if (!('length' in parsed)) {
            parsed = [];
        }
        this.measureValuePolarContainers = parsed;
    }

    getPolarValue(json: { azimuthIndex: number, edgeIndex: number, strict?: boolean }): PolarValue {
        let azimuthIndex = json.azimuthIndex;
        if (!json.strict) {
            azimuthIndex = this.updateIndex(this.measureValuePolarContainers, json.azimuthIndex);
        }
        const azimuthContainer = this.measureValuePolarContainers[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }

        let edgeIndex = json.edgeIndex;
        if (!json.strict) {
            edgeIndex = this.updateIndex(azimuthContainer.polarEdges, json.edgeIndex);
        }
        const edgeValue = azimuthContainer.polarEdges[edgeIndex];
        if (typeof edgeValue === 'undefined') {
            return null;
        }

        return new PolarValue({
            value: edgeValue,
            polarAzimuthInDegrees: azimuthContainer.azimuth,
            polarDistanceInMeters: azimuthContainer.distance * edgeIndex
        });
    }

    setPolarValue(json: {
        azimuthIndex: number,
        edgeIndex: number,
        value: number
    }): void {
        const azimuthIndex = this.updateIndex(this.measureValuePolarContainers, json.azimuthIndex);
        const azimuthContainer = this.measureValuePolarContainers[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        const edgeIndex = this.updateIndex(azimuthContainer.polarEdges, json.edgeIndex);
        azimuthContainer.polarEdges[edgeIndex] = json.value;
    }

    public toJSON() {
        return {
            measureValuePolarContainers: this.measureValuePolarContainers
        };
    }

    public toJSONWithPolarStringified() {
        return {
            measureValuePolarContainers: this.getPolarsStringified()
        };
    }

    protected updateIndex(array: Array<any>, index: number): number {
        if (array.length <= index) {
            index = index - array.length;
        } else if (index < 0) {
            index = array.length + index;
        }
        return index;
    }
}
