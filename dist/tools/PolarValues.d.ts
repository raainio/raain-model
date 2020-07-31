import { MeasureValuePolarContainer } from "../MeasureValuePolarContainer";
import { IMeasureValue } from "../IMeasureValue";
import { PolarValue } from "../PolarValue";
export declare class PolarValues implements IMeasureValue {
    private polars;
    constructor(polars: MeasureValuePolarContainer[] | any);
    getPolarsStringified(): string;
    getPolars(): MeasureValuePolarContainer[];
    setPolarsAsString(s: string): void;
    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;
    getPolarValue(azimuthIndex: number, edgeIndex: number): PolarValue;
    setPolarValue(azimuthIndex: number, edgeIndex: number, value: number): void;
    toJSON(): Object;
    toJSONWithPolarStringified(): Object;
    protected updateIndex(array: Array<any>, index: number): number;
}
