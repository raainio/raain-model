import { MeasureValuePolarContainer } from "./MeasureValuePolarContainer";
import { IMeasureValue } from "./IMeasureValue";
import { PolarValue } from "./PolarValue";
export declare class RainMeasureValue implements IMeasureValue {
    private polars;
    constructor(polars: any | MeasureValuePolarContainer[]);
    getPolarsStringified(): string;
    getPolars(): MeasureValuePolarContainer[];
    setPolarsAsString(s: string): void;
    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;
    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue;
    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void;
    getAzimuthsCount(): number;
    getPolarEdgesCount(): number;
    toJSON(): Object;
    toJSONWithPolarStringified(): Object;
}
