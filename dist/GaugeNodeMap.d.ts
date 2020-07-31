import { Link } from "./Link";
import { GaugeNode } from "./GaugeNode";
import { GaugeMeasure } from "./GaugeMeasure";
/**
 * api/gauges/:id?format=map&begin=...
 */
export declare class GaugeNodeMap extends GaugeNode {
    private map;
    constructor(idOrObjectToCopy: string | {
        id?: string;
        name?: string;
        links?: Link[];
        latitude?: number;
        longitude?: number;
        map?: string;
        getMapData?: any;
    }, name?: string, links?: Link[] | any[], latitude?: number, longitude?: number);
    toJSON(): Object;
    setMapData(mapData: GaugeMeasure[] | string): void;
    getMapData(): GaugeMeasure[];
}
