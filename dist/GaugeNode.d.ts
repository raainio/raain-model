import { RaainNode } from "./RaainNode";
import { Link } from "./Link";
/**
 *  api/gauges/:id
 */
export declare class GaugeNode extends RaainNode {
    name: string;
    latitude: number;
    longitude: number;
    constructor(idOrObjectToCopy: string | {
        id?: string;
        name?: string;
        links?: Link[];
        latitude?: number;
        longitude?: number;
    }, name?: string, links?: Link[] | any[], latitude?: number, longitude?: number);
    toJSON(): Object;
    protected getLinkType(): string;
}
