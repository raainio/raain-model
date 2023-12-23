import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';

export class PolarMeasureValue implements IPolarMeasureValue {
    private polars: MeasureValuePolarContainer[];

    constructor(measureValuePolarContainers: MeasureValuePolarContainer[] | string) {
        if (typeof measureValuePolarContainers === 'string') {
            this.setPolarsAsString(measureValuePolarContainers);
            return;
        }

        if (measureValuePolarContainers instanceof PolarMeasureValue && measureValuePolarContainers.getPolars()) {
            this.setPolarsAsContainer(measureValuePolarContainers.getPolars());
            return;
        }

        this.setPolarsAsContainer(measureValuePolarContainers);
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

    getPolarValue(azimuthIndex: number, edgeIndex: number, strict = false): PolarValue {
        if (!strict) {
            azimuthIndex = this.updateIndex(this.polars, azimuthIndex);
        }
        const azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        if (!strict) {
            edgeIndex = this.updateIndex(azimuthContainer.polarEdges, edgeIndex);
        }
        const edgeValue = azimuthContainer.polarEdges[edgeIndex];
        if (typeof edgeValue === 'undefined') {
            return null;
        }
        return new PolarValue(edgeValue, azimuthContainer.azimuth, azimuthContainer.distance * edgeIndex);
    }

    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void {
        azimuthIndex = this.updateIndex(this.polars, azimuthIndex);
        const azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        edgeIndex = this.updateIndex(azimuthContainer.polarEdges, edgeIndex);
        azimuthContainer.polarEdges[edgeIndex] = value;
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
