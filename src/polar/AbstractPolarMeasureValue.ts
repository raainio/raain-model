import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

export class AbstractPolarMeasureValue implements IPolarMeasureValue {

    protected polars: PolarMeasureValue;

    constructor(json: {
        polars: AbstractPolarMeasureValue | PolarMeasureValue | string
    }) {

        if (!json?.polars) {
            throw new Error('PolarMeasureValue needs polars');
        }

        if (typeof json.polars === 'string') {
            if (json.polars.indexOf('polars') > 0) {
                const polarsObject = JSON.parse(json.polars);
                if (polarsObject.polars && typeof polarsObject.polars === 'string') {
                    this.setPolarsAsString(polarsObject.polars);
                } else {
                    this.setPolarsAsContainer(polarsObject.polars);
                }
            } else {
                this.setPolarsAsString(json.polars);
            }
            return;
        }

        if (json.polars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(json.polars.getPolars());
            return
        }

        if (json.polars.polars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(json.polars.polars.getPolars());
        } else {
            this.setPolarsAsString(JSON.stringify(json.polars.polars));
        }
    }

    getPolarsStringified(): string {
        return this.polars.getPolarsStringified();
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.polars.getPolars();
    }

    setPolarsAsString(s: string): void {
        this.polars = new PolarMeasureValue({measureValuePolarContainers: s});
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        this.polars = new PolarMeasureValue({measureValuePolarContainers: s});
    }

    getPolarValue(json: { azimuthIndex: number, edgeIndex: number, strict?: boolean }): PolarValue {
        return this.polars.getPolarValue(json);
    }

    setPolarValue(json: { azimuthIndex: number, edgeIndex: number, value: number }): void {
        return this.polars.setPolarValue(json);
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

    public toJSON(stringify = false): JSON {
        let polars: any = this.polars;
        if (stringify) {
            polars = this.polars.toJSONWithPolarStringified();
        }

        const json: any = {
            polars,
        };
        return json;
    }

    public toJSONWithPolarStringified(): JSON {
        const json: any = this.polars.toJSONWithPolarStringified();
        return json;
    }
}
