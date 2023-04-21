import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {PolarValue} from './PolarValue';

export interface IPolarMeasureValue {

    getPolarsStringified(): string;

    getPolars(): MeasureValuePolarContainer[];

    setPolarsAsString(s: string): void;

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;

    toJSON(): JSON;

    toJSONWithPolarStringified(): JSON;

    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue;

    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void;
}
