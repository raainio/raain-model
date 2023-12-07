import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

export class AbstractPolarMeasureValue implements IPolarMeasureValue {

    protected polars: PolarMeasureValue;

    constructor(polars: AbstractPolarMeasureValue | PolarMeasureValue | string) {

        if (!polars) {
            throw new Error('PolarMeasureValue needs polars');
        }

        if (typeof polars === 'string') {
            if (polars.indexOf('polars') > 0) {
                const polarsObject = JSON.parse(polars);
                if (polarsObject.polars && typeof polarsObject.polars === 'string') {
                    this.setPolarsAsString(polarsObject.polars);
                } else {
                    this.setPolarsAsContainer(polarsObject.polars);
                }
            } else {
                this.setPolarsAsString(polars);
            }
            return;
        }

        if (polars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(polars.getPolars());
            return
        }

        if (polars.polars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(polars.polars.getPolars());
        } else {
            this.setPolarsAsString(JSON.stringify(polars.polars));
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
