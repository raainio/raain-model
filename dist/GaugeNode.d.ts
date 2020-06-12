import { RaainNode } from "./RaainNode";
import { Link } from "./Link";
/**
 *  api/gauges/:id
 */
export declare class GaugeNode extends RaainNode {
    name: string;
    latitude: number;
    longitude: number;
    constructor(idOrObjectToCopy: any | string, name?: string, links?: Link[] | any[], latitude?: number, longitude?: number);
    toJSON(): Object;
    protected getLinkType(): string;
}
