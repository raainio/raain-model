import { RaainNode } from './RaainNode';
import { Link } from "./Link";
/**
 * api/rains/:id
 */
export declare class RainNode extends RaainNode {
    name: string;
    status: number;
    quality: number;
    latitude: number;
    longitude: number;
    radius: number;
    constructor(idOrObjectToCopy: any | string, name?: string, links?: Link[] | any[], status?: number, quality?: number, latitude?: number, longitude?: number, radius?: number);
    toJSON(): Object;
    protected getLinkType(): string;
    addRadars(linksToAdd: Link[] | any[]): void;
    addCompletedComputations(linksToAdd: Link[] | any[]): void;
    private static _getRadarLinks(linksToPurify);
    private static _getRainComputationLinks(linksToPurify);
}
