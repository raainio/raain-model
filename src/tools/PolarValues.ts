import {MeasureValuePolarContainer} from "../MeasureValuePolarContainer";
import {IMeasureValue} from "../IMeasureValue";
import {PolarValue} from "../PolarValue";

export class PolarValues implements IMeasureValue {
    private polars: MeasureValuePolarContainer[];

    constructor(polars: MeasureValuePolarContainer[] | any) {
        if (typeof polars === 'string') {
            this.setPolarsAsString(polars);
        } else if (polars instanceof PolarValues && polars.getPolars()) {
            this.setPolarsAsContainer(polars.getPolars());
        } else {
            this.setPolarsAsContainer(polars);
        }
    }

    getPolarsStringified(): string {
        return JSON.stringify(this.getPolars());
    }

    getPolars(): MeasureValuePolarContainer[] {
        let converted: any = this.polars;
        try {
            // converted = JSON.parse(converted);
            // converted = converted.map(convertedPolar => new MeasureValuePolarContainer(convertedPolar));
        } catch (e) {
            console.warn('getPolars pb: ', e, typeof converted, converted);
        }
        return converted;
    }

    setPolarsAsString(s: string): void {
        try {
            let polars = JSON.parse(s);
            // console.warn('setPolarsAsString polars: ', polars, typeof s, s);
            if (polars && polars.polars) {
                polars = polars.polars;
            }
            // console.warn('setPolarsAsString polars : ', polars, typeof polars);
            if (typeof polars === 'string') {
                polars = JSON.parse(polars);
            }
            // console.warn('setPolarsAsString polars  : ', polars);
            this.polars = polars.map(convertedPolar => new MeasureValuePolarContainer(convertedPolar));
            // console.warn('setPolarsAsString this.polars : ', this.polars);
        } catch (e) {
            console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.polars = [];
        }
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        let parsed: any = s ? s : [];
        if (!('length' in parsed)) {
            parsed = [];
        }
        this.polars = parsed;
    }

    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue {
        azimuthIndex = this.updateIndex(this.polars, azimuthIndex);
        const azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        edgeIndex = this.updateIndex(azimuthContainer.polarEdges, edgeIndex);
        const edgeValue = azimuthContainer.polarEdges[edgeIndex];
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

    protected updateIndex(array: Array<any>, index: number): number {
        if (array.length <= index) {
            index = index - array.length;
        } else if (index < 0) {
            index = array.length + index;
        }
        return index;
    }
}
