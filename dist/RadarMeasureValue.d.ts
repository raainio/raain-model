import { MeasureValuePolarContainer } from "./MeasureValuePolarContainer";
import { IMeasureValue } from "./IMeasureValue";
export declare class RadarMeasureValue implements IMeasureValue {
    angle: number;
    private polars;
    constructor(angleOrObject: any | number, polars?: MeasureValuePolarContainer[]);
    getPolarsStringified(): string;
    getPolars(): MeasureValuePolarContainer[];
    setPolarsAsString(s: string): void;
    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;
    toJSON(): Object;
    toJSONWithPolarStringified(): Object;
}
