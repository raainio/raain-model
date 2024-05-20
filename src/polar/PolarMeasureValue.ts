import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';

export class PolarMeasureValue implements IPolarMeasureValue {

    // TODO rename "polars" to "measureValuePolarContainers"
    private polars: MeasureValuePolarContainer[];

    constructor(json: {
        measureValuePolarContainers: MeasureValuePolarContainer[] | string
    }) {
        if (typeof json.measureValuePolarContainers === 'string') {
            this.setPolarsAsString(json.measureValuePolarContainers);
            return;
        }

        if (json.measureValuePolarContainers instanceof PolarMeasureValue && json.measureValuePolarContainers.getPolars()) {
            this.setPolarsAsContainer(json.measureValuePolarContainers.getPolars());
            return;
        }

        this.setPolarsAsContainer(json.measureValuePolarContainers);
    }

    getPolarsStringified(): string {
        return JSON.stringify(this.getPolars());
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.polars;
    }

    setPolarsAsString(s: string): void {
        try {
            let polars = JSON.parse(s);

            if (polars && polars.polars) {
                polars = polars.polars;
            }

            if (typeof polars === 'string') {
                polars = JSON.parse(polars);
            }

            this.polars = polars.map(convertedPolar => new MeasureValuePolarContainer(convertedPolar));
        } catch (e) {
            console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.polars = [];
        }
    }

    setPolarsAsContainer(measureValuePolarContainers: MeasureValuePolarContainer[]): void {
        let parsed: any = measureValuePolarContainers ? measureValuePolarContainers : [];
        if (!('length' in parsed)) {
            parsed = [];
        }
        this.polars = parsed;
    }

    getPolarValue(json: { azimuthIndex: number, edgeIndex: number, strict?: boolean }): PolarValue {
        let azimuthIndex = json.azimuthIndex;
        if (!json.strict) {
            azimuthIndex = this.updateIndex(this.polars, json.azimuthIndex);
        }
        const azimuthContainer = this.polars[azimuthIndex];
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
        const azimuthIndex = this.updateIndex(this.polars, json.azimuthIndex);
        const azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        const edgeIndex = this.updateIndex(azimuthContainer.polarEdges, json.edgeIndex);
        azimuthContainer.polarEdges[edgeIndex] = json.value;
    }

    public toJSON(): JSON {
        return {
            polars: this.polars
        } as any;
    }

    public toJSONWithPolarStringified(): JSON {
        return {
            polars: this.getPolarsStringified()
        } as any;
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
