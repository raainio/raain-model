import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

export class AbstractPolarMeasureValue implements IPolarMeasureValue {

    public polarMeasureValue: PolarMeasureValue;

    constructor(json: {
        polarMeasureValue: AbstractPolarMeasureValue | PolarMeasureValue | string
    }) {

        if (!json?.polarMeasureValue) {
            throw new Error('PolarMeasureValue needs polarMeasureValue');
        }

        let polarMeasureValue: any = json.polarMeasureValue;
        if (typeof polarMeasureValue === 'string') {
            if (polarMeasureValue.indexOf('polarMeasureValue') > 0) {
                polarMeasureValue = JSON.parse(polarMeasureValue);
            } else {
                this.setPolarsAsString(polarMeasureValue);
                return;
            }
        }

        if (polarMeasureValue instanceof AbstractPolarMeasureValue
            || polarMeasureValue instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(polarMeasureValue.getPolars());
            return;
        }

        let polarMeasure = polarMeasureValue;
        if (polarMeasureValue
            && typeof polarMeasureValue['polarMeasureValue'] !== 'undefined') {
            polarMeasure = polarMeasureValue['polarMeasureValue'];
        }

        let polarContainers: any = polarMeasure;
        if (polarMeasure && polarMeasure['measureValuePolarContainers']) {
            polarContainers = polarMeasure['measureValuePolarContainers'];
        }

        if (polarContainers instanceof AbstractPolarMeasureValue
            || polarContainers instanceof PolarMeasureValue) {
            this.setPolarsAsContainer(polarContainers.getPolars());
            return;
        }

        if (typeof polarContainers === 'string') {
            this.setPolarsAsString(polarContainers);
            return;
        }

        if (Array.isArray(polarContainers)) {
            this.setPolarsAsContainer(polarContainers);
            return;
        }

        throw new Error('PolarMeasureValue needs valid typed polarMeasureValue');
    }

    getPolarsStringified(): string {
        return this.polarMeasureValue.getPolarsStringified();
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.polarMeasureValue.getPolars();
    }

    setPolarsAsString(s: string): void {
        this.polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: s});
    }

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void {
        this.polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: s});
    }

    getPolarValue(json: { azimuthIndex: number, edgeIndex: number, strict?: boolean }): PolarValue {
        return this.polarMeasureValue.getPolarValue(json);
    }

    setPolarValue(json: { azimuthIndex: number, edgeIndex: number, value: number }): void {
        return this.polarMeasureValue.setPolarValue(json);
    }

    getAzimuthsCount(): number {
        return this.polarMeasureValue.getPolars().length;
    }

    getPolarEdgesCount(): number {
        const polars = this.polarMeasureValue.getPolars();
        if (polars.length > 0) {
            return polars[0].polarEdges.length;
        }
        return 0;
    }

    getDistance(): number {
        const polars = this.polarMeasureValue.getPolars();
        if (polars.length > 0) {
            return polars[0].distance;
        }
        return 1;
    }

    public toJSON(stringify = false): any {
        let polarMeasureValue: any = this.polarMeasureValue;
        if (stringify) {
            polarMeasureValue = JSON.stringify(this.polarMeasureValue.toJSONWithPolarStringified());
        }

        return {
            polarMeasureValue,
        };
    }

    public toJSONWithPolarStringified(): any {
        const polarMeasureValue = JSON.stringify(this.polarMeasureValue.toJSONWithPolarStringified());
        return {polarMeasureValue};
    }
}
