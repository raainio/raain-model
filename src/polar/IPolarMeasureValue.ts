import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {PolarValue} from './PolarValue';

export interface IPolarMeasureValue {

    getPolarsStringified(): string;

    getPolars(): MeasureValuePolarContainer[];

    setPolarsAsString(s: string): void;

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;

    toJSON(): any;

    toJSONWithPolarStringified(): any;

    getPolarValue(json: { azimuthIndex: number, edgeIndex: number }): PolarValue;

    setPolarValue(json: { azimuthIndex: number, edgeIndex: number, value: number }): void;
}
