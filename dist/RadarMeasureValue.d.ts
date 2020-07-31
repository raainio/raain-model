import { MeasureValuePolarContainer } from "./MeasureValuePolarContainer";
import { IMeasureValue } from "./IMeasureValue";
import { PolarValue } from "./PolarValue";
export declare class RadarMeasureValue implements IMeasureValue {
    angle: number;
    private polars;
    constructor(angleOrObject: any | number, polars?: string | MeasureValuePolarContainer[]);
    getPolarsStringified(): string;
    getPolars(): MeasureValuePolarContainer[];
    setPolarsAsString(s: string): void;
    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;
    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue;
    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void;
    toJSON(): Object;
    toJSONWithPolarStringified(): Object;
}
