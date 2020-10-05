import {MeasureValuePolarContainer} from "./MeasureValuePolarContainer";
import {PolarValue} from "./PolarValue";

export interface IMeasureValue {

    getPolarsStringified(): string;

    getPolars(): MeasureValuePolarContainer[];

    setPolarsAsString(s: string): void;

    setPolarsAsContainer(s: MeasureValuePolarContainer[]): void;

    toJSON(): Object;

    toJSONWithPolarStringified(): Object;

    getPolarValue(azimuthIndex: number, edgeIndex: number) : PolarValue;

    setPolarValue(azimuthIndex: number, edgeIndex: number, value : number) : void;
}
