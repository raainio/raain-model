import { RainComputationNode } from "./RainComputationNode";
import { Link } from "./Link";
import { RainMeasure } from "./RainMeasure";
export declare class RainComputationMap extends RainComputationNode {
    private map;
    constructor(idOrObjectToCopy: any | string, periodBegin?: Date, periodEnd?: Date, links?: Link[] | any[], quality?: number, progressIngest?: number, progressComputing?: number, timeSpentInMs?: number);
    toJSON(): Object;
    setMapData(mapData: RainMeasure[] | string): void;
    getMapData(): RainMeasure[];
}
