import { RadarMeasure } from "./RadarMeasure";
import { RadarNode } from "./RadarNode";
import { Link } from "./Link";
/**
 * api/radars/:id?format=map&...
  */
export declare class RadarNodeMap extends RadarNode {
    private map;
    constructor(idOrObjectToCopy: any | string, name?: string, links?: Link[] | any[], latitude?: number, longitude?: number);
    toJSON(): Object;
    setMapData(mapData: RadarMeasure[] | string): void;
    getMapData(): RadarMeasure[];
}
