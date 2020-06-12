import { MeasureValuePolarContainer } from "./MeasureValuePolarContainer";
import { IMeasureValue } from "./IMeasureValue";
export declare class RainMeasureValue implements IMeasureValue {
    private polars;
    constructor(polars: any | MeasureValuePolarContainer[]);
    getPolarsStringified(): string;
    getPolars(): MeasureValuePolarContainer[];
    setPolarsAsString(s: string): void;
    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;
    toJSON(): Object;
    toJSONWithPolarStringified(): Object;
}
