import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

export class AbstractPolarMeasureValue implements IPolarMeasureValue {

    // TODO rename "polars" to "polarMeasureValue" (+ inherits kids)
    protected polars: PolarMeasureValue;

    constructor(json: {
        polars: AbstractPolarMeasureValue | PolarMeasureValue | string
    }) {

        if (!json?.polars) {
            throw new Error('PolarMeasureValue needs polars');
        }

        let polars = json.polars;
        if (typeof polars === 'string') {
            if (polars.indexOf('polars') > 0) {
                polars = JSON.parse(polars);
            } else {
                this.setPolarsAsString(polars);
                return;
            }
        }

        if (polars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(polars.getPolars());
            return;
        }

        let polarMeasure = polars;
        if (polars && typeof polars['polars'] !== 'undefined' && typeof polars['angle'] !== 'undefined') {
            polarMeasure = polars['polars'];
        }

        let subPolars = polarMeasure;
        if (polarMeasure && polarMeasure['polars']) {
            subPolars = polarMeasure['polars'];
        }

        if (subPolars instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(subPolars.getPolars());
            return;
        }

        if (typeof subPolars === 'string') {
            this.setPolarsAsString(subPolars);
            return;
        }

        if (Array.isArray(subPolars)) {
            this.setPolarsAsContainer(subPolars);
            return;
        }

        throw new Error('PolarMeasureValue needs valid typed polars');
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
