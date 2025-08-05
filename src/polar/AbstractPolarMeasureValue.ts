import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarValue} from './PolarValue';

export class AbstractPolarMeasureValue implements IPolarMeasureValue {
    public polarMeasureValue: PolarMeasureValue;

    public getMinMaxValues(): {min: number; max: number} | null {
        return this.polarMeasureValue.getMinMaxValues();
    }

    constructor(json: {polarMeasureValue: AbstractPolarMeasureValue | PolarMeasureValue | string}) {
        if (!json?.polarMeasureValue) {
            throw new Error('Needs one polarMeasureValue');
        }

        let polarMeasureValue1: any = json.polarMeasureValue;
        if (typeof polarMeasureValue1 === 'string') {
            polarMeasureValue1 = JSON.parse(polarMeasureValue1);
        }

        if (
            polarMeasureValue1 instanceof AbstractPolarMeasureValue ||
            polarMeasureValue1 instanceof PolarMeasureValue
        ) {
            this.setPolarsAsContainer(
                polarMeasureValue1.getPolars(),
                polarMeasureValue1.getAzimuthsCount(),
                polarMeasureValue1.getPolarEdgesCount()
            );
            return;
        }

        let polarMeasureValue2 = polarMeasureValue1;
        if (polarMeasureValue1['polarMeasureValue']) {
            if (typeof polarMeasureValue1['polarMeasureValue'] === 'string') {
                polarMeasureValue2 = JSON.parse(polarMeasureValue1['polarMeasureValue']);
            } else {
                polarMeasureValue2 = polarMeasureValue1['polarMeasureValue'];
            }
        }

        let azimuthsCount: number;
        let polarEdgesCount: number;
        let measureValuePolarContainers = [];
        if (polarMeasureValue2 && polarMeasureValue2['measureValuePolarContainers']) {
            measureValuePolarContainers = polarMeasureValue2['measureValuePolarContainers'];

            if (polarMeasureValue2['azimuthsCount'] && polarMeasureValue2['polarEdgesCount']) {
                azimuthsCount = parseInt('' + polarMeasureValue2['azimuthsCount'], 10);
                polarEdgesCount = parseInt('' + polarMeasureValue2['polarEdgesCount'], 10);
            }
        }

        if (typeof measureValuePolarContainers === 'string') {
            this.setPolarsAsString(measureValuePolarContainers, azimuthsCount, polarEdgesCount);
            return;
        }

        if (Array.isArray(measureValuePolarContainers)) {
            this.setPolarsAsContainer(measureValuePolarContainers, azimuthsCount, polarEdgesCount);
            return;
        }

        throw new Error('Needs valid polarMeasureValue');
    }

    getPolarsStringified(): string {
        return this.polarMeasureValue.getPolarsStringified();
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.polarMeasureValue.getPolars();
    }

    setPolarsAsString(
        measureValuePolarContainers: string,
        azimuthsCount: number,
        polarEdgesCount: number
    ): void {
        this.polarMeasureValue = new PolarMeasureValue({
            measureValuePolarContainers,
            azimuthsCount,
            polarEdgesCount,
        });
    }

    setPolarsAsContainer(
        measureValuePolarContainers: MeasureValuePolarContainer[],
        azimuthsCount: number,
        polarEdgesCount: number
    ): void {
        this.polarMeasureValue = new PolarMeasureValue({
            measureValuePolarContainers,
            azimuthsCount,
            polarEdgesCount,
        });
    }

    getPolarValue(json: {azimuthInDegrees: number; distanceInMeters: number}): PolarValue {
        return this.polarMeasureValue.getPolarValue(json);
    }

    setPolarValue(json: {azimuthInDegrees: number; distanceInMeters: number; value: number}): void {
        return this.polarMeasureValue.setPolarValue(json);
    }

    getAzimuthsCount(): number {
        return this.polarMeasureValue.getAzimuthsCount();
    }

    getPolarEdgesCount(): number {
        return this.polarMeasureValue.getPolarEdgesCount();
    }

    public toJSON() {
        return {
            polarMeasureValue: this.polarMeasureValue,
        };
    }

    public toJSONWithPolarStringified() {
        const json = this.toJSON();
        return {
            ...json,
            polarMeasureValue: JSON.stringify(this.polarMeasureValue.toJSONWithPolarStringified()),
        };
    }
}
