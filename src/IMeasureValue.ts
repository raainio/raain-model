import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";

export interface IMeasureValue {

    getPolarsStringified(): string;

    getPolars(): MeasureValuePolarContainer[];

    setPolarsAsString(s: string): void;

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;

    toJSON(): Object;

    toJSONWithPolarStringified(): Object;
}
