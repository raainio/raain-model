import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {PolarValue} from './PolarValue';

export interface IPolarMeasureValue {

    getAzimuthsCount(): number;

    getPolarEdgesCount(): number;

    getPolarsStringified(): string;

    getPolars(): MeasureValuePolarContainer[];

    toJSON(options?: any): any;

    toJSONWithPolarStringified(): any;

    getPolarValue(json: { azimuthInDegrees: number, distanceInMeters: number }): PolarValue;

    setPolarValue(json: { azimuthInDegrees: number, distanceInMeters: number, value: number }): void;
}
